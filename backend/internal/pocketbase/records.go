package pocketbase

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
)

// ListRecords queries records from a collection with optional filter, sort, and pagination.
func (c *Client) ListRecords(ctx context.Context, collection, filter, sort string, page, perPage int) ([]map[string]interface{}, int, error) {
	token, err := c.GetAdminToken(ctx)
	if err != nil {
		return nil, 0, err
	}

	if page < 1 {
		page = 1
	}
	if perPage < 1 {
		perPage = 500
	}

	params := url.Values{}
	params.Set("page", strconv.Itoa(page))
	params.Set("perPage", strconv.Itoa(perPage))
	if filter != "" {
		params.Set("filter", filter)
	}
	if sort != "" {
		params.Set("sort", sort)
	}

	u := fmt.Sprintf("%s/api/collections/%s/records?%s", c.BaseURL, collection, params.Encode())
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u, nil)
	if err != nil {
		return nil, 0, err
	}
	req.Header.Set("Authorization", token)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, 0, err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		b, _ := io.ReadAll(resp.Body)
		return nil, 0, fmt.Errorf("pocketbase list %s failed (%d): %s", collection, resp.StatusCode, string(b))
	}

	var lr ListResponse
	if err := json.NewDecoder(resp.Body).Decode(&lr); err != nil {
		return nil, 0, err
	}
	return lr.Items, lr.TotalItems, nil
}

// GetRecord fetches a single record by its ID.
func (c *Client) GetRecord(ctx context.Context, collection, id string) (map[string]interface{}, error) {
	token, err := c.GetAdminToken(ctx)
	if err != nil {
		return nil, err
	}

	u := fmt.Sprintf("%s/api/collections/%s/records/%s", c.BaseURL, collection, id)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", token)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNotFound {
		return nil, ErrNotFound
	}
	if resp.StatusCode >= 300 {
		b, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("pocketbase get %s/%s failed (%d): %s", collection, id, resp.StatusCode, string(b))
	}

	var rec map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&rec); err != nil {
		return nil, err
	}
	return rec, nil
}

// CreateRecord inserts a new record into the collection.
func (c *Client) CreateRecord(ctx context.Context, collection string, data map[string]interface{}) (map[string]interface{}, error) {
	token, err := c.GetAdminToken(ctx)
	if err != nil {
		return nil, err
	}

	b, err := json.Marshal(data)
	if err != nil {
		return nil, err
	}

	u := fmt.Sprintf("%s/api/collections/%s/records", c.BaseURL, collection)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, u, bytes.NewReader(b))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", token)
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		respBytes, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("pocketbase create %s failed (%d): %s", collection, resp.StatusCode, string(respBytes))
	}

	var rec map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&rec); err != nil {
		return nil, err
	}
	return rec, nil
}

// UpdateRecord updates an existing record by ID.
func (c *Client) UpdateRecord(ctx context.Context, collection, id string, data map[string]interface{}) (map[string]interface{}, error) {
	token, err := c.GetAdminToken(ctx)
	if err != nil {
		return nil, err
	}

	b, err := json.Marshal(data)
	if err != nil {
		return nil, err
	}

	u := fmt.Sprintf("%s/api/collections/%s/records/%s", c.BaseURL, collection, id)
	req, err := http.NewRequestWithContext(ctx, http.MethodPatch, u, bytes.NewReader(b))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", token)
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNotFound {
		return nil, ErrNotFound
	}
	if resp.StatusCode >= 300 {
		respBytes, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("pocketbase update %s/%s failed (%d): %s", collection, id, resp.StatusCode, string(respBytes))
	}

	var rec map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&rec); err != nil {
		return nil, err
	}
	return rec, nil
}

// DeleteRecord deletes a record by ID.
func (c *Client) DeleteRecord(ctx context.Context, collection, id string) error {
	token, err := c.GetAdminToken(ctx)
	if err != nil {
		return err
	}

	u := fmt.Sprintf("%s/api/collections/%s/records/%s", c.BaseURL, collection, id)
	req, err := http.NewRequestWithContext(ctx, http.MethodDelete, u, nil)
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", token)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNotFound {
		return ErrNotFound
	}
	if resp.StatusCode >= 300 {
		b, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("pocketbase delete %s/%s failed (%d): %s", collection, id, resp.StatusCode, string(b))
	}
	return nil
}
