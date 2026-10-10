package api

import (
	"context"
	"encoding/json"
	"fmt"
	"sync"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/kemenag/inklusi-backend/internal/config"
	"github.com/kemenag/inklusi-backend/internal/pocketbase"
)

// MaintenanceWatcher manages real-time maintenance status.
// It keeps status in-memory for zero latency on web requests and provides SSE broadcasts.
type MaintenanceWatcher struct {
	pb            *pocketbase.Client
	cfg           *config.Config
	mu            sync.RWMutex
	status        string
	appName       string
	schemaName    string
	updatedAt     time.Time
	lastError     string
	listenerState string
	triggerCount  int
	subscribers   map[chan string]struct{}
	subMu         sync.Mutex
}

// NewMaintenanceWatcher creates and starts the maintenance watcher.
func NewMaintenanceWatcher(ctx context.Context, pb *pocketbase.Client, cfg *config.Config) *MaintenanceWatcher {
	w := &MaintenanceWatcher{
		pb:            pb,
		cfg:           cfg,
		status:        "online",
		appName:       "Pusat Layanan Inklusi",
		schemaName:    "kemenag_inklusi",
		updatedAt:     time.Now(),
		listenerState: "active",
		subscribers:   make(map[chan string]struct{}),
	}

	return w
}

// SetStatus updates the in-memory status and notifies all active SSE subscribers.
func (w *MaintenanceWatcher) SetStatus(newStatus string) {
	w.mu.Lock()
	w.status = newStatus
	w.updatedAt = time.Now()
	w.triggerCount++
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
		"source":      "pocketbase_realtime",
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

// GetDiag returns diagnostic telemetry about the watcher.
func (w *MaintenanceWatcher) GetDiag() fiber.Map {
	w.mu.RLock()
	defer w.mu.RUnlock()
	return fiber.Map{
		"listener_state": w.listenerState,
		"last_error":     w.lastError,
		"trigger_count":  w.triggerCount,
		"pb_endpoint":    w.pb.BaseURL,
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
