package api

import (
	"errors"
	"log"

	"github.com/gofiber/fiber/v3"
	"github.com/kemenag/inklusi-backend/internal/content"
)

// PublicHandler handles unauthenticated public content read requests.
type PublicHandler struct {
	repo *content.Repository
}

// NewPublicHandler creates a new PublicHandler.
func NewPublicHandler(deps *Dependencies) *PublicHandler {
	return &PublicHandler{repo: deps.Content()}
}

func registerPublicRoutes(g fiber.Router, deps *Dependencies) {
	h := NewPublicHandler(deps)
	pg := g.Group("/public")

	pg.Get("/berita", h.ListBerita)
	pg.Get("/berita/:slug", h.GetBeritaBySlug)
	pg.Get("/galeri", h.ListGaleri)
	pg.Get("/pengumuman", h.ListPengumuman)
	pg.Get("/dokumen", h.ListDokumen)
	pg.Get("/agenda", h.ListAgenda)
}

// ListBerita returns active news articles.
func (h *PublicHandler) ListBerita(c fiber.Ctx) error {
	rows, err := h.repo.ListActive(c.Context(), "berita", "Aktif")
	if err != nil {
		log.Printf("[public API] ListBerita error: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	if rows == nil {
		rows = []map[string]interface{}{}
	}
	return c.JSON(rows)
}

// GetBeritaBySlug returns a single news article by slug.
func (h *PublicHandler) GetBeritaBySlug(c fiber.Ctx) error {
	row, err := h.repo.BySlug(c.Context(), "berita", c.Params("slug"))
	if err != nil {
		if errors.Is(err, content.ErrNotFound) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "berita not found"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to load berita"})
	}
	return c.JSON(row)
}

// ListGaleri returns all gallery items.
func (h *PublicHandler) ListGaleri(c fiber.Ctx) error {
	rows, err := h.repo.List(c.Context(), "galeri")
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to load galeri"})
	}
	if rows == nil {
		rows = []map[string]interface{}{}
	}
	return c.JSON(rows)
}

// ListPengumuman returns active announcements.
func (h *PublicHandler) ListPengumuman(c fiber.Ctx) error {
	rows, err := h.repo.ListActive(c.Context(), "pengumuman", "Aktif")
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to load pengumuman"})
	}
	if rows == nil {
		rows = []map[string]interface{}{}
	}
	return c.JSON(rows)
}

// ListDokumen returns active documents & SOPs.
func (h *PublicHandler) ListDokumen(c fiber.Ctx) error {
	rows, err := h.repo.ListActive(c.Context(), "dokumen", "Aktif")
	if err != nil {
		log.Printf("[public API] ListDokumen error: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	if rows == nil {
		rows = []map[string]interface{}{}
	}
	return c.JSON(rows)
}

// ListAgenda returns all agenda events.
func (h *PublicHandler) ListAgenda(c fiber.Ctx) error {
	rows, err := h.repo.List(c.Context(), "agenda")
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to load agenda"})
	}
	if rows == nil {
		rows = []map[string]interface{}{}
	}
	return c.JSON(rows)
}
