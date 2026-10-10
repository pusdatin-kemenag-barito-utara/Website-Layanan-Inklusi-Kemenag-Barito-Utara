package content

import (
	"context"
	"errors"
	"fmt"

	"github.com/kemenag/inklusi-backend/internal/pocketbase"
)

// ErrNotFound indicates a record was not found in PocketBase.
var ErrNotFound = pocketbase.ErrNotFound

// Repository provides typed access to CMS content collections backed by PocketBase.
type Repository struct {
	pb *pocketbase.Client
}

// NewRepository creates a content repository bound to PocketBase.
func NewRepository(pb *pocketbase.Client) *Repository {
	return &Repository{pb: pb}
}

// allowedTables whitelist prevents unauthorized collection queries.
var allowedTables = map[string]bool{
	"berita":                true,
	"pengumuman":            true,
	"agenda":                true,
	"galeri":                true,
	"dokumen":               true,
	"booking_prioritas":     true,
	"pengaduan":             true,
	"formulir_identifikasi": true,
	"berkas_tracking":       true,
}

func (r *Repository) tableOK(table string) bool {
	return allowedTables[table]
}

func sortForTable(table string) string {
	switch table {
	case "agenda":
		return "-waktu,-created"
	case "berita", "dokumen", "galeri", "pengumuman":
		return "-tanggal,-created"
	default:
		return "-created"
	}
}

func normalizeRecord(rec map[string]interface{}) map[string]interface{} {
	if rec == nil {
		return nil
	}
	// Fallback created_at to created, or tanggal, or waktu
	if _, ok := rec["created_at"]; !ok {
		if c, ok := rec["created"]; ok && c != "" {
			rec["created_at"] = c
		} else if t, ok := rec["tanggal"]; ok && t != "" {
			rec["created_at"] = t
		} else if w, ok := rec["waktu"]; ok && w != "" {
			rec["created_at"] = w
		}
	}
	if _, ok := rec["updated_at"]; !ok {
		if u, ok := rec["updated"]; ok && u != "" {
			rec["updated_at"] = u
		} else if t, ok := rec["tanggal"]; ok && t != "" {
			rec["updated_at"] = t
		}
	}
	return rec
}

// List returns all rows for a content table ordered by date/created desc.
func (r *Repository) List(ctx context.Context, table string) ([]map[string]interface{}, error) {
	if !r.tableOK(table) {
		return nil, errors.New("table not allowed")
	}
	items, _, err := r.pb.ListRecords(ctx, table, "", sortForTable(table), 1, 500)
	if err != nil {
		return nil, err
	}
	for i := range items {
		items[i] = normalizeRecord(items[i])
	}
	return items, nil
}

// ListActive returns rows filtered by status ordered by date/created desc.
func (r *Repository) ListActive(ctx context.Context, table, status string) ([]map[string]interface{}, error) {
	if !r.tableOK(table) {
		return nil, errors.New("table not allowed")
	}
	filter := fmt.Sprintf("status='%s'", status)
	items, _, err := r.pb.ListRecords(ctx, table, filter, sortForTable(table), 1, 500)
	if err != nil {
		return nil, err
	}
	for i := range items {
		items[i] = normalizeRecord(items[i])
	}
	return items, nil
}

// ByID returns a single row by primary key id.
func (r *Repository) ByID(ctx context.Context, table string, id string) (map[string]interface{}, error) {
	if !r.tableOK(table) {
		return nil, errors.New("table not allowed")
	}
	rec, err := r.pb.GetRecord(ctx, table, id)
	if err != nil {
		return nil, err
	}
	return normalizeRecord(rec), nil
}

// BySlug returns a single row by its slug column.
func (r *Repository) BySlug(ctx context.Context, table, slug string) (map[string]interface{}, error) {
	if !r.tableOK(table) {
		return nil, errors.New("table not allowed")
	}
	filter := fmt.Sprintf("slug='%s'", slug)
	items, _, err := r.pb.ListRecords(ctx, table, filter, "", 1, 1)
	if err != nil {
		return nil, err
	}
	if len(items) == 0 {
		return nil, ErrNotFound
	}
	return normalizeRecord(items[0]), nil
}

// Insert creates a row in the PocketBase collection.
func (r *Repository) Insert(ctx context.Context, table string, fields map[string]interface{}) (map[string]interface{}, error) {
	if !r.tableOK(table) {
		return nil, errors.New("table not allowed")
	}
	delete(fields, "id")
	rec, err := r.pb.CreateRecord(ctx, table, fields)
	if err != nil {
		return nil, err
	}
	return normalizeRecord(rec), nil
}

// Update modifies a row's fields by id.
func (r *Repository) Update(ctx context.Context, table string, id string, fields map[string]interface{}) (map[string]interface{}, error) {
	if !r.tableOK(table) {
		return nil, errors.New("table not allowed")
	}
	delete(fields, "id")
	rec, err := r.pb.UpdateRecord(ctx, table, id, fields)
	if err != nil {
		return nil, err
	}
	return normalizeRecord(rec), nil
}

// Delete removes a row by id.
func (r *Repository) Delete(ctx context.Context, table string, id string) error {
	if !r.tableOK(table) {
		return errors.New("table not allowed")
	}
	err := r.pb.DeleteRecord(ctx, table, id)
	if err != nil && errors.Is(err, pocketbase.ErrNotFound) {
		return nil
	}
	return err
}
