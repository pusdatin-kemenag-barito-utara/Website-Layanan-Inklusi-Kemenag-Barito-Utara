package api

import (
	"errors"
	"path"
	"strings"

	"github.com/gofiber/fiber/v3"

	"github.com/kemenag/inklusi-backend/internal/services"
	"github.com/kemenag/inklusi-backend/internal/storage"
)

// LayananHandler handles HTTP requests for public service submissions.
type LayananHandler struct {
	svc     *services.LayananRepository
	storage *storage.Storage
}

// NewLayananHandler creates a new handler instance.
func NewLayananHandler(deps *Dependencies) *LayananHandler {
	return &LayananHandler{
		svc:     services.NewLayanan(deps.PB),
		storage: storage.New(deps.PB, "uploads"),
	}
}

func registerServiceRoutes(g fiber.Router, deps *Dependencies) {
	h := NewLayananHandler(deps)
	pg := g.Group("/public")

	pg.Post("/booking", h.CreateBooking)
	pg.Post("/pengaduan", h.CreatePengaduan)
	pg.Post("/formulir", h.CreateFormulir)
	pg.Get("/tracking/:resi", h.GetTracking)
	pg.Post("/upload", h.Upload)
}

// CreateBooking handles POST /api/public/booking.
func (h *LayananHandler) CreateBooking(c fiber.Ctx) error {
	var req struct {
		Nama       string `json:"nama"`
		Kategori   string `json:"kategori"`
		Layanan    string `json:"layanan"`
		Tanggal    string `json:"tanggal"`
		Waktu      string `json:"waktu"`
		Keterangan string `json:"keterangan"`
	}
	if err := c.Bind().Body(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}
	if req.Nama == "" || req.Kategori == "" || req.Layanan == "" || req.Tanggal == "" || req.Waktu == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Semua kolom wajib diisi"})
	}
	b, err := h.svc.CreateBooking(c.Context(), &services.Booking{
		Nama:       req.Nama,
		Kategori:   req.Kategori,
		Layanan:    req.Layanan,
		Tanggal:    req.Tanggal,
		Waktu:      req.Waktu,
		Keterangan: req.Keterangan,
	})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Gagal menyimpan booking"})
	}
	return c.Status(fiber.StatusCreated).JSON(b)
}

// CreatePengaduan handles POST /api/public/pengaduan.
func (h *LayananHandler) CreatePengaduan(c fiber.Ctx) error {
	var req services.Pengaduan
	if err := c.Bind().Body(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}
	if req.Kategori == "" || req.Detail == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Kategori dan detail aduan wajib diisi"})
	}
	p, err := h.svc.CreatePengaduan(c.Context(), &req)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Gagal menyimpan pengaduan"})
	}
	return c.Status(fiber.StatusCreated).JSON(p)
}

// CreateFormulir handles POST /api/public/formulir.
func (h *LayananHandler) CreateFormulir(c fiber.Ctx) error {
	var req services.Formulir
	if err := c.Bind().Body(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}
	if req.Nama == "" || req.NIK == "" || req.Kategori == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Nama, NIK, dan kategori wajib diisi"})
	}
	f, err := h.svc.CreateFormulir(c.Context(), &req)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Gagal menyimpan formulir"})
	}
	return c.Status(fiber.StatusCreated).JSON(f)
}

// GetTracking handles GET /api/public/tracking/:resi.
func (h *LayananHandler) GetTracking(c fiber.Ctx) error {
	resi := c.Params("resi")
	if resi == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Nomor resi wajib diisi"})
	}
	b, err := h.svc.TrackBerkas(c.Context(), resi)
	if err != nil {
		if errors.Is(err, services.ErrNotFound) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Nomor resi tidak ditemukan"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Gagal melacak berkas"})
	}
	return c.JSON(b)
}

// Upload handles POST /api/public/upload.
func (h *LayananHandler) Upload(c fiber.Ctx) error {
	file, err := c.FormFile("file")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "file wajib diunggah"})
	}
	if file.Size > 10*1024*1024 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "ukuran file maksimal 10MB"})
	}

	src, err := file.Open()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "gagal membuka file"})
	}
	defer src.Close()

	ext := strings.ToLower(path.Ext(file.Filename))
	ct := "application/octet-stream"
	switch ext {
	case ".jpg", ".jpeg":
		ct = "image/jpeg"
	case ".png":
		ct = "image/png"
	case ".pdf":
		ct = "application/pdf"
	}

	publicURL, err := h.storage.Upload(file.Filename, src, ct)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "gagal upload file: " + err.Error()})
	}
	return c.JSON(fiber.Map{"url": publicURL})
}