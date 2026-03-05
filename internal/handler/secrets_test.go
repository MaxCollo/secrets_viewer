package handler

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestListSecrets_ReturnsArray(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/api/secrets", nil)
	w := httptest.NewRecorder()

	ListSecrets(w, req)

	resp := w.Result()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
	}

	ct := resp.Header.Get("Content-Type")
	if ct != "application/json" {
		t.Fatalf("expected Content-Type application/json, got %q", ct)
	}

	var entries []secretEntry
	if err := json.NewDecoder(resp.Body).Decode(&entries); err != nil {
		t.Fatalf("failed to decode JSON: %v", err)
	}

	if len(entries) == 0 {
		t.Fatal("expected at least one env var entry")
	}
}

func TestListSecrets_EntryShape(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/api/secrets", nil)
	w := httptest.NewRecorder()

	ListSecrets(w, req)

	var entries []secretEntry
	json.NewDecoder(w.Result().Body).Decode(&entries)

	for _, e := range entries {
		if e.Name == "" {
			t.Error("entry has empty name")
		}
		switch e.Source {
		case "secret", "configmap", "env":
			// valid
		default:
			t.Errorf("unexpected source %q for %s", e.Source, e.Name)
		}
	}
}

func TestListSecrets_IsReadOnly(t *testing.T) {
	// Call twice and verify env is not mutated
	req1 := httptest.NewRequest(http.MethodGet, "/api/secrets", nil)
	w1 := httptest.NewRecorder()
	ListSecrets(w1, req1)

	var first []secretEntry
	json.NewDecoder(w1.Result().Body).Decode(&first)

	req2 := httptest.NewRequest(http.MethodGet, "/api/secrets", nil)
	w2 := httptest.NewRecorder()
	ListSecrets(w2, req2)

	var second []secretEntry
	json.NewDecoder(w2.Result().Body).Decode(&second)

	if len(first) != len(second) {
		t.Errorf("read-only violation: first call returned %d entries, second returned %d", len(first), len(second))
	}
}

func TestClassifySource_Secret(t *testing.T) {
	tests := []struct {
		name     string
		expected string
	}{
		{"DB_PASSWORD", "secret"},
		{"API_SECRET_KEY", "secret"},
		{"AUTH_TOKEN", "secret"},
		{"MY_CREDENTIALS", "secret"},
	}
	for _, tt := range tests {
		if got := classifySource(tt.name); got != tt.expected {
			t.Errorf("classifySource(%q) = %q, want %q", tt.name, got, tt.expected)
		}
	}
}

func TestClassifySource_Configmap(t *testing.T) {
	tests := []struct {
		name     string
		expected string
	}{
		{"KUBERNETES_SERVICE_HOST", "configmap"},
		{"MY_APP_SERVICE_PORT", "configmap"},
	}
	for _, tt := range tests {
		if got := classifySource(tt.name); got != tt.expected {
			t.Errorf("classifySource(%q) = %q, want %q", tt.name, got, tt.expected)
		}
	}
}

func TestClassifySource_Env(t *testing.T) {
	tests := []string{"HOME", "PATH", "GOPATH", "APP_NAME"}
	for _, name := range tests {
		if got := classifySource(name); got != "env" {
			t.Errorf("classifySource(%q) = %q, want %q", name, got, "env")
		}
	}
}
