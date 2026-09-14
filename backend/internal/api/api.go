package api

import (
	"bufio"
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/kemenag/inklusi-backend/internal/config"
	"github.com/kemenag/inklusi-backend/internal/content"
	"github.com/kemenag/inklusi-backend/internal/middleware"
)

// Dependencies bundles shared services passed to route handlers.
type Dependencies struct {
	Config  *config.Config
	DB      *pgxpool.Pool
	repo    *content.Repository
	watcher *MaintenanceWatcher
}

// Content returns the shared content repository (lazily initialized).
func (d *Dependencies) Content() *content.Repository {
	if d.repo == nil {
		d.repo = content.NewRepository(d.DB)
	}
	return d.repo
}

// Watcher returns the shared maintenance watcher (lazily initialized).
func (d *Dependencies) Watcher() *MaintenanceWatcher {
	if d.watcher == nil {
		d.watcher = NewMaintenanceWatcher(context.Background(), d.DB, d.Config)
	}
	return d.watcher
}

// RegisterRoutes wires all API route groups onto the Fiber app.
func RegisterRoutes(app *fiber.App, deps *Dependencies) {
	// Initialize real-time maintenance listener on startup
	_ = deps.Watcher()

	apiGroup := app.Group("/api")

	// health
	apiGroup.Get("/health", func(c fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":    "ok",
			"timestamp": c.RequestCtx().Time().Format("2006-01-02T15:04:05Z07:00"),
		})
	})

	registerAuthRoutes(apiGroup, deps)
	registerPublicRoutes(apiGroup, deps)
	registerAdminRoutes(apiGroup, deps)
	registerServiceRoutes(apiGroup, deps)

	// maintenance status endpoints (event-driven via PostgreSQL LISTEN/NOTIFY)
	apiGroup.Get("/apps/status", deps.maintenanceStatus)
	apiGroup.Get("/apps/status/events", deps.maintenanceSSE)
}

// requireAuth returns a Fiber handler that guards protected routes.
func requireAuth(deps *Dependencies) fiber.Handler {
	return middleware.RequireSession(deps.Config, deps.DB)
}

// requireAdmin ensures the authenticated user has a valid role for this app.
func requireAdmin(deps *Dependencies) fiber.Handler {
	return middleware.RequireAdmin(deps.Config, deps.DB)
}

// maintenanceStatus returns the real-time status loaded in-memory (0ms latency, zero repeated DB queries).
func (d *Dependencies) maintenanceStatus(c fiber.Ctx) error {
	status, appName, updatedAt := d.Watcher().GetDetails()
	diag := d.Watcher().GetDiag()
	return c.JSON(fiber.Map{
		"status":      status,
		"app_name":    appName,
		"updated_at":  updatedAt.Format(time.RFC3339),
		"app_id":      d.Config.AppID,
		"schema_name": "kemenag_inklusi",
		"source":      "pusdatin_realtime_trigger",
		"diag":        diag,
	})
}

// maintenanceSSE provides a Server-Sent Events stream for instant status changes without polling.
func (d *Dependencies) maintenanceSSE(c fiber.Ctx) error {
	c.Set("Content-Type", "text/event-stream")
	c.Set("Cache-Control", "no-cache")
	c.Set("Connection", "keep-alive")
	c.Set("Access-Control-Allow-Origin", "*")

	ch := make(chan string, 10)
	d.Watcher().Subscribe(ch)

	// Send initial status event immediately
	status, appName, updatedAt := d.Watcher().GetDetails()
	initData, _ := json.Marshal(fiber.Map{
		"status":      status,
		"app_name":    appName,
		"updated_at":  updatedAt.Format(time.RFC3339),
		"app_id":      d.Config.AppID,
		"schema_name": "kemenag_inklusi",
		"source":      "pusdatin_realtime_trigger",
	})

	c.RequestCtx().SetBodyStreamWriter(func(w *bufio.Writer) {
		defer d.Watcher().Unsubscribe(ch)

		// Send initial event
		_, _ = fmt.Fprintf(w, "data: %s\n\n", initData)
		_ = w.Flush()

		// Heartbeat ticker to keep SSE connection alive
		ticker := time.NewTicker(25 * time.Second)
		defer ticker.Stop()

		for {
			select {
			case msg, ok := <-ch:
				if !ok {
					return
				}
				_, err := fmt.Fprintf(w, "%s", msg)
				if err != nil {
					return
				}
				if err := w.Flush(); err != nil {
					return
				}
			case <-ticker.C:
				_, err := fmt.Fprintf(w, ": heartbeat\n\n")
				if err != nil {
					return
				}
				if err := w.Flush(); err != nil {
					return
				}
			}
		}
	})

	return nil
}
