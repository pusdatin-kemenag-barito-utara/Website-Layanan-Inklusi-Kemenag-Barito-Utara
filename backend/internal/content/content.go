package content

import (
	"context"
	"errors"
	"fmt"
	"log"
	"strconv"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Repository provides typed access to CMS content tables.
type Repository struct {
	pool   *pgxpool.Pool
	schema string
}

// NewRepository creates a content repository bound to the kemenag_inklusi schema.
func NewRepository(pool *pgxpool.Pool) *Repository {
	return &Repository{pool: pool, schema: "kemenag_inklusi"}
}

// allowedTables whitelist prevents SQL injection via arbitrary table names.
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

// List returns all rows for a content table ordered by created_at desc.
func (r *Repository) List(ctx context.Context, table string) ([]map[string]interface{}, error) {
	if !r.tableOK(table) {
		return nil, errors.New("table not allowed")
	}
	q := "SELECT * FROM " + r.schema + "." + table + " ORDER BY created_at DESC"
	rows, err := r.pool.Query(ctx, q)
	if err != nil {
		return nil, err
	}
	return collect(rows)
}

// ListActive returns rows filtered by status ordered by created_at desc.
func (r *Repository) ListActive(ctx context.Context, table, status string) ([]map[string]interface{}, error) {
	if !r.tableOK(table) {
		return nil, errors.New("table not allowed")
	}
	q := "SELECT * FROM " + r.schema + "." + table + " WHERE status = $1 ORDER BY created_at DESC"
	rows, err := r.pool.Query(ctx, q, status)
	if err != nil {
		return nil, err
	}
	return collect(rows)
}

// ByID returns a single row by primary key id.
// ByID returns a single row by primary key id (works with uuid or integer id).
func (r *Repository) ByID(ctx context.Context, table string, id string) (map[string]interface{}, error) {
	if !r.tableOK(table) {
		return nil, errors.New("table not allowed")
	}
	q := "SELECT * FROM " + r.schema + "." + table + " WHERE id::text = $1 LIMIT 1"
	rows, err := r.pool.Query(ctx, q, id)
	if err != nil {
		return nil, err
	}
	return first(rows)
}

// BySlug returns a single row by its slug column.
func (r *Repository) BySlug(ctx context.Context, table, slug string) (map[string]interface{}, error) {
	if !r.tableOK(table) {
		return nil, errors.New("table not allowed")
	}
	q := "SELECT * FROM " + r.schema + "." + table + " WHERE slug = $1 LIMIT 1"
	rows, err := r.pool.Query(ctx, q, slug)
	if err != nil {
		return nil, err
	}
	return first(rows)
}

// Insert creates a row from an arbitrary field set.
func (r *Repository) Insert(ctx context.Context, table string, fields map[string]interface{}) (map[string]interface{}, error) {
	if !r.tableOK(table) {
		return nil, errors.New("table not allowed")
	}
	delete(fields, "id")

	cols := make([]string, 0, len(fields))
	params := make([]interface{}, 0, len(fields))
	for k, v := range fields {
		cols = append(cols, k)
		params = append(params, v)
	}
	placeholders := make([]string, len(cols))
	for j := range cols {
		placeholders[j] = "$" + strconv.Itoa(j+1)
	}

	q := "INSERT INTO " + r.schema + "." + table +
		" (" + strings.Join(cols, ", ") + ") VALUES (" + strings.Join(placeholders, ", ") + ") RETURNING *"

	rows, err := r.pool.Query(ctx, q, params...)
	if err != nil {
		return nil, err
	}
	return first(rows)
}

// Update modifies a row's fields by id (works with uuid or integer id).
func (r *Repository) Update(ctx context.Context, table string, id string, fields map[string]interface{}) (map[string]interface{}, error) {
	if !r.tableOK(table) {
		return nil, errors.New("table not allowed")
	}
	delete(fields, "id")

	if len(fields) == 0 {
		return r.ByID(ctx, table, id)
	}

	sets := make([]string, 0, len(fields))
	params := make([]interface{}, 0, len(fields)+1)
	i := 1
	for k, v := range fields {
		sets = append(sets, k+" = $"+strconv.Itoa(i))
		params = append(params, v)
		i++
	}
	params = append(params, id)

	q := "UPDATE " + r.schema + "." + table + " SET " + strings.Join(sets, ", ") +
		" WHERE id::text = $" + strconv.Itoa(len(params)) + " RETURNING *"

	rows, err := r.pool.Query(ctx, q, params...)
	if err != nil {
		return nil, err
	}
	return first(rows)
}

// Delete removes a row by id (works with uuid or integer id).
func (r *Repository) Delete(ctx context.Context, table string, id string) error {
	if !r.tableOK(table) {
		return errors.New("table not allowed")
	}
	q := "DELETE FROM " + r.schema + "." + table + " WHERE id::text = $1"
	_, err := r.pool.Exec(ctx, q, id)
	return err
}

func formatRow(row map[string]interface{}) map[string]interface{} {
	for k, v := range row {
		switch val := v.(type) {
		case [16]byte:
			row[k] = fmt.Sprintf("%x-%x-%x-%x-%x", val[0:4], val[4:6], val[6:8], val[8:10], val[10:16])
		case pgtype.UUID:
			if val.Valid {
				row[k] = fmt.Sprintf("%x-%x-%x-%x-%x", val.Bytes[0:4], val.Bytes[4:6], val.Bytes[6:8], val.Bytes[8:10], val.Bytes[10:16])
			}
		}
	}
	return row
}

func collect(rows pgx.Rows) ([]map[string]interface{}, error) {
	defer rows.Close()
	all, err := pgx.CollectRows(rows, pgx.RowToMap)
	if err != nil {
		log.Printf("[collect error]: %v", err)
		return nil, err
	}
	for i := range all {
		all[i] = formatRow(all[i])
	}
	return all, nil
}

func first(rows pgx.Rows) (map[string]interface{}, error) {
	all, err := collect(rows)
	if err != nil {
		return nil, err
	}
	if len(all) == 0 {
		return nil, pgx.ErrNoRows
	}
	return all[0], nil
}
