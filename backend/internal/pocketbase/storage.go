package pocketbase

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
)

// UploadFile uploads a multipart file to a PocketBase collection and returns the created record.
func (c *Client) UploadFile(ctx context.Context, collection, fileField, filename string, fileReader io.Reader) (map[string]interface{}, error) {
	token, err := c.GetAdminToken(ctx)
	if err != nil {
		return nil, err
	}

	var buf bytes.Buffer
	w := multipart.NewWriter(&buf)
	part, err := w.CreateFormFile(fileField, filename)
	if err != nil {
		return nil, err
	}
	if _, err := io.Copy(part, fileReader); err != nil {
		return nil, err
	}
	_ = w.WriteField("name", filename)
	_ = w.Close()

	u := fmt.Sprintf("%s/api/collections/%s/records", c.BaseURL, collection)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, u, &buf)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", token)
	req.Header.Set("Content-Type", w.FormDataContentType())

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		b, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("pocketbase upload to %s failed (%d): %s", collection, resp.StatusCode, string(b))
	}

	var rec map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&rec); err != nil {
		return nil, err
	}
	return rec, nil
}
