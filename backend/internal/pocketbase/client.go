package pocketbase

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"sync"
	"time"
)

// Client handles REST calls to a PocketBase instance.
type Client struct {
	BaseURL       string
	AdminEmail    string
	AdminPassword string
	httpClient    *http.Client

	adminMu      sync.RWMutex
	adminToken   string
	tokenExpires time.Time
}

// NewClient initializes a new PocketBase Client.
func NewClient(baseURL, adminEmail, adminPassword string) *Client {
	cleanURL := strings.TrimRight(baseURL, "/")
	if cleanURL == "" {
		cleanURL = "https://db-inklusi.kemenag-baritoutara.com"
	}

	tr := &http.Transport{
		Proxy:               http.ProxyFromEnvironment,
		MaxIdleConns:        100,
		MaxIdleConnsPerHost: 50,
		IdleConnTimeout:     90 * time.Second,
		TLSHandshakeTimeout: 10 * time.Second,
	}

	return &Client{
		BaseURL:       cleanURL,
		AdminEmail:    adminEmail,
		AdminPassword: adminPassword,
		httpClient: &http.Client{
			Timeout:   30 * time.Second,
			Transport: tr,
		},
	}
}

// GetAdminToken returns a cached or newly fetched PocketBase superuser token.
func (c *Client) GetAdminToken(ctx context.Context) (string, error) {
	c.adminMu.RLock()
	if c.adminToken != "" && time.Now().Before(c.tokenExpires) {
		token := c.adminToken
		c.adminMu.RUnlock()
		return token, nil
	}
	c.adminMu.RUnlock()

	c.adminMu.Lock()
	defer c.adminMu.Unlock()

	// Double check under write lock
	if c.adminToken != "" && time.Now().Before(c.tokenExpires) {
		return c.adminToken, nil
	}

	body, err := json.Marshal(map[string]string{
		"identity": c.AdminEmail,
		"password": c.AdminPassword,
	})
	if err != nil {
		return "", err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.BaseURL+"/api/collections/_superusers/auth-with-password", bytes.NewReader(body))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		b, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("pocketbase admin auth failed (%d): %s", resp.StatusCode, string(b))
	}

	var res struct {
		Token string `json:"token"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&res); err != nil {
		return "", err
	}

	c.adminToken = res.Token
	// Set expiration to 6 days (PocketBase tokens typically expire in 7 days)
	c.tokenExpires = time.Now().Add(6 * 24 * time.Hour)
	return c.adminToken, nil
}
