package services

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"math/rand"

	"github.com/kemenag/inklusi-backend/internal/pocketbase"
)

// LayananRepository handles public service submissions
// (booking prioritas, pengaduan, formulir identifikasi, tracking berkas) via PocketBase.
type LayananRepository struct {
	pb *pocketbase.Client
}

// NewLayanan creates the repository bound to PocketBase.
func NewLayanan(pb *pocketbase.Client) *LayananRepository {
	return &LayananRepository{pb: pb}
}

// Booking is a priority queue booking submission.
type Booking struct {
	ID         string `json:"id"`
	Kode       string `json:"kode"`
	Nama       string `json:"nama"`
	Kategori   string `json:"kategori"`
	Layanan    string `json:"layanan"`
	Tanggal    string `json:"tanggal"`
	Waktu      string `json:"waktu"`
	Keterangan string `json:"keterangan"`
	Status     string `json:"status"`
}

// CreateBooking inserts a booking into PocketBase and returns it with a generated queue code.
func (r *LayananRepository) CreateBooking(ctx context.Context, b *Booking) (*Booking, error) {
	kode := fmt.Sprintf("VIP-%d", 1000+rand.Intn(9000))
	data := map[string]interface{}{
		"kode":       kode,
		"nama":       b.Nama,
		"kategori":   b.Kategori,
		"layanan":    b.Layanan,
		"tanggal":    b.Tanggal,
		"waktu":      b.Waktu,
		"keterangan": b.Keterangan,
		"status":     "Menunggu",
	}

	rec, err := r.pb.CreateRecord(ctx, "booking_prioritas", data)
	if err != nil {
		return nil, err
	}

	b.ID, _ = rec["id"].(string)
	b.Kode = kode
	b.Status = "Menunggu"
	return b, nil
}

// Pengaduan is a complaint/whistleblowing submission.
type Pengaduan struct {
	ID       string `json:"id"`
	Nama     string `json:"nama,omitempty"`
	Kategori string `json:"kategori"`
	Detail   string `json:"detail"`
	Lampiran string `json:"lampiran,omitempty"`
	Status   string `json:"status"`
}

// CreatePengaduan inserts a complaint into PocketBase.
func (r *LayananRepository) CreatePengaduan(ctx context.Context, p *Pengaduan) (*Pengaduan, error) {
	data := map[string]interface{}{
		"nama":     p.Nama,
		"kategori": p.Kategori,
		"detail":   p.Detail,
		"lampiran": p.Lampiran,
		"status":   "Baru",
	}

	rec, err := r.pb.CreateRecord(ctx, "pengaduan", data)
	if err != nil {
		return nil, err
	}

	p.ID, _ = rec["id"].(string)
	p.Status = "Baru"
	return p, nil
}

// Formulir is a vulnerable-group identification form submission.
type Formulir struct {
	ID        string `json:"id"`
	Nama      string `json:"nama"`
	NIK       string `json:"nik"`
	Telepon   string `json:"telepon"`
	Kategori  string `json:"kategori"`
	Layanan   string `json:"layanan"`
	Kebutuhan string `json:"kebutuhan"`
	Lampiran  string `json:"lampiran,omitempty"`
}

// CreateFormulir inserts an identification form into PocketBase.
func (r *LayananRepository) CreateFormulir(ctx context.Context, f *Formulir) (*Formulir, error) {
	data := map[string]interface{}{
		"nama":      f.Nama,
		"nik":       f.NIK,
		"telepon":   f.Telepon,
		"kategori":  f.Kategori,
		"layanan":   f.Layanan,
		"kebutuhan": f.Kebutuhan,
		"lampiran":  f.Lampiran,
	}

	rec, err := r.pb.CreateRecord(ctx, "formulir_identifikasi", data)
	if err != nil {
		return nil, err
	}

	f.ID, _ = rec["id"].(string)
	return f, nil
}

// TrackingStep represents one step in a berkas timeline.
type TrackingStep struct {
	Title string `json:"title"`
	Time  string `json:"time"`
	Done  bool   `json:"done"`
}

// Berkas describes a tracked document.
type Berkas struct {
	ID      string         `json:"id"`
	Resi    string         `json:"resi"`
	Layanan string         `json:"layanan"`
	Pemohon string         `json:"pemohon"`
	Status  string         `json:"status"`
	Steps   []TrackingStep `json:"steps"`
	Updated string         `json:"updated_at"`
}

// TrackBerkas looks up a document by its resi number in PocketBase.
func (r *LayananRepository) TrackBerkas(ctx context.Context, resi string) (*Berkas, error) {
	filter := fmt.Sprintf("resi='%s'", resi)
	items, _, err := r.pb.ListRecords(ctx, "berkas_tracking", filter, "", 1, 1)
	if err != nil {
		return nil, err
	}
	if len(items) == 0 {
		return nil, ErrNotFound
	}

	rec := items[0]
	b := &Berkas{
		ID:      fmt.Sprintf("%v", rec["id"]),
		Resi:    fmt.Sprintf("%v", rec["resi"]),
		Layanan: fmt.Sprintf("%v", rec["layanan"]),
		Pemohon: fmt.Sprintf("%v", rec["pemohon"]),
		Status:  fmt.Sprintf("%v", rec["status"]),
	}
	if upd, ok := rec["updated"].(string); ok {
		b.Updated = upd
	} else if upd, ok := rec["updated_at"].(string); ok {
		b.Updated = upd
	}

	if rawSteps, ok := rec["langkah"]; ok && rawSteps != nil {
		if stepsBytes, err := json.Marshal(rawSteps); err == nil {
			_ = json.Unmarshal(stepsBytes, &b.Steps)
		}
	}
	if b.Steps == nil {
		b.Steps = []TrackingStep{}
	}

	return b, nil
}

// ErrNotFound signals a missing record.
var ErrNotFound = errors.New("record not found")