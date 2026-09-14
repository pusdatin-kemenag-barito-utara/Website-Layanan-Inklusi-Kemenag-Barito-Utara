package storage

import (
	"bytes"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"path"
	"strings"
	"time"
)

// Storage wraps Supabase Storage for file uploads.
type Storage struct {
	supabaseURL string
	serviceKey  string
	bucket      string
}

// New creates a Storage client for the given Supabase project.
func New(supabaseURL, serviceKey, bucket string) *Storage {
	return &Storage{supabaseURL: strings.TrimRight(supabaseURL, "/"), serviceKey: serviceKey, bucket: bucket}
}

// Enabled reports whether the client has enough config to actually upload.
func (s *Storage) Enabled() bool {
	return s.supabaseURL != "" && s.serviceKey != ""
}

// Upload stores a file under the given logical name and returns its public URL.
func (s *Storage) Upload(name string, file multipart.File, contentType string) (string, error) {
	if !s.Enabled() {
		return "", fmt.Errorf("storage not configured")
	}

	data, err := io.ReadAll(file)
	if err != nil {
		return "", err
	}

	ts := time.Now().UTC().Format("20060102")
	objectPath := path.Join(ts, name)

	url := fmt.Sprintf("%s/storage/v1/object/%s/%s", s.supabaseURL, s.bucket, objectPath)
	req, err := http.NewRequest(http.MethodPost, url, bytes.NewReader(data))
	if err != nil {
		return "", err
	}
	req.Header.Set("Authorization", "Bearer "+s.serviceKey)
	req.Header.Set("apikey", s.serviceKey)
	req.Header.Set("Content-Type", contentType)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("upload failed (%d): %s", resp.StatusCode, string(body))
	}

	return fmt.Sprintf("%s/storage/v1/object/public/%s/%s", s.supabaseURL, s.bucket, objectPath), nil
}

// Remove deletes an object given its full public URL.
func (s *Storage) Remove(publicURL string) error {
	prefix := fmt.Sprintf("%s/storage/v1/object/public/%s/", s.supabaseURL, s.bucket)
	if !strings.HasPrefix(publicURL, prefix) {
		return nil
	}
	objectPath := strings.TrimPrefix(publicURL, prefix)

	url := fmt.Sprintf("%s/storage/v1/object/%s/%s", s.supabaseURL, s.bucket, objectPath)
	req, err := http.NewRequest(http.MethodDelete, url, nil)
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+s.serviceKey)
	req.Header.Set("apikey", s.serviceKey)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	return nil
}