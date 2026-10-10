package pocketbase

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

// AuthWithPassword authenticates a user against an auth collection (e.g. "users").
func (c *Client) AuthWithPassword(ctx context.Context, collection, identity, password string) (*AuthResponse, error) {
	b, err := json.Marshal(map[string]string{
		"identity": identity,
		"password": password,
	})
	if err != nil {
		return nil, err
	}

	u := fmt.Sprintf("%s/api/collections/%s/auth-with-password", c.BaseURL, collection)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, u, bytes.NewReader(b))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusBadRequest || resp.StatusCode == http.StatusUnauthorized {
		return nil, ErrUnauthorized
	}
	if resp.StatusCode >= 300 {
		respBytes, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("pocketbase auth error (%d): %s", resp.StatusCode, string(respBytes))
	}

	var authRes AuthResponse
	if err := json.NewDecoder(resp.Body).Decode(&authRes); err != nil {
		return nil, err
	}
	return &authRes, nil
}
