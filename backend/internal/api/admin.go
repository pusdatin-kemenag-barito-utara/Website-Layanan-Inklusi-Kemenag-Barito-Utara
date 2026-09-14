package api

import (
	"github.com/gofiber/fiber/v3"
	"github.com/jackc/pgx/v5"
	"github.com/kemenag/inklusi-backend/internal/content"
)

// AdminHandler handles CMS table CRUD operations for authorized administrators.
type AdminHandler struct {
	repo *content.Repository
}

// NewAdminHandler creates an AdminHandler.
func NewAdminHandler(deps *Dependencies) *AdminHandler {
	return &AdminHandler{repo: deps.Content()}
}

// registerAdminRoutes wires protected CRUD endpoints for CMS content tables.
func registerAdminRoutes(g fiber.Router, deps *Dependencies) {
	h := NewAdminHandler(deps)
	admin := g.Group("/admin", requireAuth(deps), requireAdmin(deps))

	admin.Get("/:table", h.List)
	admin.Post("/:table", h.Create)
	admin.Put("/:table/:id", h.Update)
	admin.Delete("/:table/:id", h.Delete)
}

// List returns all rows for a content table.
func (h *AdminHandler) List(c fiber.Ctx) error {
	rows, err := h.repo.List(c.Context(), c.Params("table"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid table"})
	}
	if rows == nil {
		rows = []map[string]interface{}{}
	}
	return c.JSON(rows)
}

// Create inserts a new row into the specified content table.
func (h *AdminHandler) Create(c fiber.Ctx) error {
	var fields map[string]interface{}
	if err := c.Bind().Body(&fields); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid body"})
	}
	row, err := h.repo.Insert(c.Context(), c.Params("table"), fields)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "insert failed: " + err.Error()})
	}
	return c.Status(fiber.StatusCreated).JSON(row)
}

// Update modifies a row by ID in the specified content table.
func (h *AdminHandler) Update(c fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid id"})
	}
	var fields map[string]interface{}
	if err := c.Bind().Body(&fields); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid body"})
	}
	row, err := h.repo.Update(c.Context(), c.Params("table"), id, fields)
	if err != nil {
		if err == pgx.ErrNoRows {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "not found"})
		}
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "update failed: " + err.Error()})
	}
	return c.JSON(row)
}

// Delete removes a row by ID from the specified content table.
func (h *AdminHandler) Delete(c fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid id"})
	}
	if err := h.repo.Delete(c.Context(), c.Params("table"), id); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "delete failed: " + err.Error()})
	}
	return c.JSON(fiber.Map{"success": true})
}
