package services

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"math/rand"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// LayananRepository handles public service submissions
// (booking prioritas, pengaduan, formulir identifikasi, tracking berkas).
type LayananRepository struct {
	pool   *pgxpool.Pool
	schema string
}

// NewLayanan creates the repository bound to the kemenag_inklusi schema.
func NewLayanan(pool *pgxpool.Pool) *LayananRepository {
	return &LayananRepository{pool: pool, schema: "kemenag_inklusi"}
}

// Booking is a priority queue booking submission.
type Booking struct {
	ID       int64  `json:"id"`
	Kode     string `json:"kode"`
	Nama     string `json:"nama"`
	Kategori string `json:"kategori"`
	Layanan  string `json:"layanan"`
	Tanggal  string `json:"tanggal"`
	Waktu    string `json:"waktu"`
	Keterangan string `json:"keterangan"`
	Status   string `json:"status"`
}

// CreateBooking inserts a booking and returns it with a generated queue code.
func (r *LayananRepository) CreateBooking(ctx context.Context, b *Booking) (*Booking, error) {
	kode := fmt.Sprintf("VIP-%d", 1000+rand.Intn(9000))
	q := `INSERT INTO ` + r.schema + `.booking_prioritas (kode, nama, kategori, layanan, tanggal, waktu, keterangan, status)
		VALUES ($1,$2,$3,$4,$5,$6,$7,'Menunggu') RETURNING id, status`
	err := r.pool.QueryRow(ctx, q, kode, b.Nama, b.Kategori, b.Layanan, b.Tanggal, b.Waktu, b.Keterangan).
		Scan(&b.ID, &b.Status)
	if err != nil {
		return nil, err
	}
	b.Kode = kode
	return b, nil
}

// Pengaduan is a complaint/whistleblowing submission.
type Pengaduan struct {
	ID       int64  `json:"id"`
	Nama     string `json:"nama,omitempty"`
	Kategori string `json:"kategori"`
	Detail   string `json:"detail"`
	Lampiran string `json:"lampiran,omitempty"`
	Status   string `json:"status"`
}

// CreatePengaduan inserts a complaint.
func (r *LayananRepository) CreatePengaduan(ctx context.Context, p *Pengaduan) (*Pengaduan, error) {
	q := `INSERT INTO ` + r.schema + `.pengaduan (nama, kategori, detail, lampiran, status)
		VALUES ($1,$2,$3,$4,'Baru') RETURNING id, status`
	err := r.pool.QueryRow(ctx, q, p.Nama, p.Kategori, p.Detail, p.Lampiran).
		Scan(&p.ID, &p.Status)
	if err != nil {
		return nil, err
	}
	return p, nil
}

// Formulir is a vulnerable-group identification form submission.
type Formulir struct {
	ID         int64  `json:"id"`
	Nama       string `json:"nama"`
	NIK        string `json:"nik"`
	Telepon    string `json:"telepon"`
	Kategori   string `json:"kategori"`
	Layanan    string `json:"layanan"`
	Kebutuhan  string `json:"kebutuhan"`
	Lampiran   string `json:"lampiran,omitempty"`
}

// CreateFormulir inserts an identification form.
func (r *LayananRepository) CreateFormulir(ctx context.Context, f *Formulir) (*Formulir, error) {
	q := `INSERT INTO ` + r.schema + `.formulir_identifikasi (nama, nik, telepon, kategori, layanan, kebutuhan, lampiran)
		VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`
	err := r.pool.QueryRow(ctx, q, f.Nama, f.NIK, f.Telepon, f.Kategori, f.Layanan, f.Kebutuhan, f.Lampiran).
		Scan(&f.ID)
	if err != nil {
		return nil, err
	}
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
	ID       int64          `json:"id"`
	Resi     string         `json:"resi"`
	Layanan  string         `json:"layanan"`
	Pemohon  string         `json:"pemohon"`
	Status   string         `json:"status"`
	Steps    []TrackingStep `json:"steps"`
	Updated  string         `json:"updated_at"`
}

// TrackBerkas looks up a document by its resi number.
func (r *LayananRepository) TrackBerkas(ctx context.Context, resi string) (*Berkas, error) {
	q := `SELECT id, resi, layanan, pemohon, status,
		COALESCE(langkah::text, '[]'), COALESCE(updated_at::text, '')
		FROM ` + r.schema + `.berkas_tracking WHERE resi = $1 LIMIT 1`
	var b Berkas
	var stepsJSON []byte
	err := r.pool.QueryRow(ctx, q, resi).Scan(&b.ID, &b.Resi, &b.Layanan, &b.Pemohon, &b.Status, &stepsJSON, &b.Updated)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	if len(stepsJSON) > 0 {
		if err := json.Unmarshal(stepsJSON, &b.Steps); err != nil {
			b.Steps = []TrackingStep{}
		}
	}
	return &b, nil
}

// ErrNotFound signals a missing record.
var ErrNotFound = errors.New("record not found")