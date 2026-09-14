package api

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/kemenag/inklusi-backend/internal/config"
)

// MaintenanceWatcher manages real-time maintenance status directly from Pusdatin's database.
// It combines PostgreSQL event trigger (LISTEN/NOTIFY) with an internal background sync worker,
// ensuring zero latency for incoming web requests and zero load on the database per HTTP hit.
type MaintenanceWatcher struct {
	db            *pgxpool.Pool
	cfg           *config.Config
	mu            sync.RWMutex
	status        string
	appName       string
	schemaName    string
	updatedAt     time.Time
	lastError     string
	listenerState string
	triggerCount  int
	dbHostPort    string
	subscribers   map[chan string]struct{}
	subMu         sync.Mutex
}

// NewMaintenanceWatcher creates and starts the real-time Pusdatin maintenance watcher.
func NewMaintenanceWatcher(ctx context.Context, db *pgxpool.Pool, cfg *config.Config) *MaintenanceWatcher {
	w := &MaintenanceWatcher{
		db:            db,
		cfg:           cfg,
		status:        "online",
		appName:       "Pusat Layanan Inklusi",
		schemaName:    "kemenag_inklusi",
		updatedAt:     time.Now(),
		listenerState: "initializing",
		subscribers:   make(map[chan string]struct{}),
	}

	if db != nil && db.Config() != nil && db.Config().ConnConfig != nil {
		w.dbHostPort = fmt.Sprintf("%s:%d", db.Config().ConnConfig.Host, db.Config().ConnConfig.Port)
	}

	// 1. Initial status fetch from database
	w.refreshFromDB(ctx)

	// 2. Start background notification listener (PostgreSQL LISTEN/NOTIFY)
	go w.listenLoop(ctx)

	// 3. Start background sync worker (runs silently in backend process, never per user request)
	go w.syncLoop(ctx)

	return w
}

// refreshFromDB queries kemenag_pusdatin.satellite_apps directly to sync status.
func (w *MaintenanceWatcher) refreshFromDB(ctx context.Context) {
	queryCtx, cancel := context.WithTimeout(ctx, 4*time.Second)
	defer cancel()

	var status, name string
	err := w.db.QueryRow(queryCtx, `
		SELECT COALESCE(status, 'online'), COALESCE(name, 'Pusat Layanan Inklusi')
		FROM kemenag_pusdatin.satellite_apps
		WHERE id = $1 OR schema_name = $2
		LIMIT 1
	`, w.cfg.AppID, "kemenag_inklusi").Scan(&status, &name)

	if err != nil {
		w.mu.Lock()
		w.lastError = err.Error()
		w.mu.Unlock()
		return
	}

	w.mu.RLock()
	prevStatus := w.status
	w.mu.RUnlock()

	w.mu.Lock()
	w.appName = name
	w.lastError = ""
	w.mu.Unlock()

	if prevStatus != status {
		log.Printf("[MaintenanceWatcher] Status change detected from Pusdatin DB: %s -> %s (App: %s)", prevStatus, status, name)
		w.setStatus(status)
	}
}

// syncLoop ensures state is always synchronized in background without blocking or querying per HTTP request.
func (w *MaintenanceWatcher) syncLoop(ctx context.Context) {
	ticker := time.NewTicker(3 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			w.refreshFromDB(ctx)
		}
	}
}

// listenLoop listens to PostgreSQL notifications on channel 'satellite_apps_status_channel'.
func (w *MaintenanceWatcher) listenLoop(ctx context.Context) {
	for {
		select {
		case <-ctx.Done():
			return
		default:
		}

		conn, err := w.db.Acquire(ctx)
		if err != nil {
			w.mu.Lock()
			w.listenerState = "acquire_error"
			w.lastError = err.Error()
			w.mu.Unlock()
			time.Sleep(5 * time.Second)
			continue
		}

		_, err = conn.Exec(ctx, "LISTEN satellite_apps_status_channel")
		if err != nil {
			w.mu.Lock()
			w.listenerState = "listen_error"
			w.lastError = err.Error()
			w.mu.Unlock()
			conn.Release()
			time.Sleep(5 * time.Second)
			continue
		}

		w.mu.Lock()
		w.listenerState = "listening"
		w.lastError = ""
		w.mu.Unlock()

		for {
			notification, err := conn.Conn().WaitForNotification(ctx)
			if err != nil {
				w.mu.Lock()
				w.listenerState = "disconnected"
				w.lastError = err.Error()
				w.mu.Unlock()
				conn.Release()
				time.Sleep(2 * time.Second)
				break
			}

			var payload struct {
				ID         string `json:"id"`
				SchemaName string `json:"schema_name"`
				Status     string `json:"status"`
			}

			if err := json.Unmarshal([]byte(notification.Payload), &payload); err != nil {
				continue
			}

			if payload.ID == w.cfg.AppID || payload.SchemaName == "kemenag_inklusi" || payload.ID == "inklusi_kemenag" {
				log.Printf("[MaintenanceWatcher] Instant PG trigger received! Status: %s", payload.Status)
				w.mu.Lock()
				w.triggerCount++
				w.mu.Unlock()
				w.setStatus(payload.Status)
			}
		}
	}
}

// setStatus updates the in-memory status and notifies all active SSE subscribers.
func (w *MaintenanceWatcher) setStatus(newStatus string) {
	w.mu.Lock()
	w.status = newStatus
	w.updatedAt = time.Now()
	currentStatus := w.status
	appName := w.appName
	updatedAt := w.updatedAt
	w.mu.Unlock()

	// Broadcast to SSE subscribers
	data, _ := json.Marshal(fiber.Map{
		"status":      currentStatus,
		"app_name":    appName,
		"updated_at":  updatedAt.Format(time.RFC3339),
		"app_id":      w.cfg.AppID,
		"schema_name": "kemenag_inklusi",
		"source":      "pusdatin_realtime_trigger",
	})
	eventMsg := fmt.Sprintf("data: %s\n\n", data)

	w.subMu.Lock()
	for ch := range w.subscribers {
		select {
		case ch <- eventMsg:
		default:
		}
	}
	w.subMu.Unlock()
}

// GetStatus returns the current status in-memory with zero I/O latency.
func (w *MaintenanceWatcher) GetStatus() string {
	w.mu.RLock()
	defer w.mu.RUnlock()
	return w.status
}

// GetDetails returns the current status details in-memory.
func (w *MaintenanceWatcher) GetDetails() (status, appName string, updatedAt time.Time) {
	w.mu.RLock()
	defer w.mu.RUnlock()
	return w.status, w.appName, w.updatedAt
}

// GetDiag returns diagnostic telemetry about the real-time watcher.
func (w *MaintenanceWatcher) GetDiag() fiber.Map {
	w.mu.RLock()
	defer w.mu.RUnlock()
	return fiber.Map{
		"listener_state": w.listenerState,
		"last_error":     w.lastError,
		"trigger_count":  w.triggerCount,
		"db_endpoint":    w.dbHostPort,
	}
}

// Subscribe adds a channel for real-time status notifications.
func (w *MaintenanceWatcher) Subscribe(ch chan string) {
	w.subMu.Lock()
	w.subscribers[ch] = struct{}{}
	w.subMu.Unlock()
}

// Unsubscribe removes a notification channel.
func (w *MaintenanceWatcher) Unsubscribe(ch chan string) {
	w.subMu.Lock()
	delete(w.subscribers, ch)
	w.subMu.Unlock()
}
