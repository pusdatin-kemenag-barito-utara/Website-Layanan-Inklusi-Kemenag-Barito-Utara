package storage

import (
	"context"
	"fmt"
	"mime/multipart"
	"strings"

	"github.com/kemenag/inklusi-backend/internal/pocketbase"
)

// Storage handles file uploads backed by PocketBase.
type Storage struct {
	pb         *pocketbase.Client
	collection string
}

// New creates a Storage client using PocketBase.
func New(pb *pocketbase.Client, collection string) *Storage {
	if collection == "" {
		collection = "uploads"
	}
	return &Storage{pb: pb, collection: collection}
}

// Enabled reports whether the client has valid configuration.
func (s *Storage) Enabled() bool {
	return s.pb != nil && s.pb.BaseURL != ""
}

// Upload stores a file in the PocketBase collection and returns its direct public URL.
func (s *Storage) Upload(name string, file multipart.File, contentType string) (string, error) {
	if !s.Enabled() {
		return "", fmt.Errorf("storage not configured")
	}

	ctx := context.Background()
	rec, err := s.pb.UploadFile(ctx, s.collection, "file", name, file)
	if err != nil {
		return "", fmt.Errorf("pocketbase upload failed: %w", err)
	}

	recID, _ := rec["id"].(string)
	fileName, _ := rec["file"].(string)
	if recID == "" || fileName == "" {
		return "", fmt.Errorf("invalid upload response")
	}

	publicURL := fmt.Sprintf("%s/api/files/%s/%s/%s", s.pb.BaseURL, s.collection, recID, fileName)
	return publicURL, nil
}

// Remove deletes a file record given its public URL.
func (s *Storage) Remove(publicURL string) error {
	prefix := fmt.Sprintf("%s/api/files/%s/", s.pb.BaseURL, s.collection)
	if !strings.HasPrefix(publicURL, prefix) {
		return nil
	}
	rem := strings.TrimPrefix(publicURL, prefix)
	parts := strings.Split(rem, "/")
	if len(parts) >= 1 {
		recID := parts[0]
		return s.pb.DeleteRecord(context.Background(), s.collection, recID)
	}
	return nil
}