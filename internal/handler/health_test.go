package handler

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestHealth_ReturnsJSON(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	w := httptest.NewRecorder()

	Health(w, req)

	resp := w.Result()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
	}

	ct := resp.Header.Get("Content-Type")
	if ct != "application/json" {
		t.Fatalf("expected Content-Type application/json, got %q", ct)
	}

	var body healthResponse
	if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
		t.Fatalf("failed to decode JSON: %v", err)
	}

	if body.Status != "healthy" {
		t.Errorf("expected status %q, got %q", "healthy", body.Status)
	}
	if body.Version == "" {
		t.Error("expected version to be non-empty")
	}
}

func TestHealth_DoesNotLeakSensitiveData(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	w := httptest.NewRecorder()

	Health(w, req)

	var body map[string]interface{}
	json.NewDecoder(w.Result().Body).Decode(&body)

	allowed := map[string]bool{"status": true, "version": true}
	for key := range body {
		if !allowed[key] {
			t.Errorf("unexpected field %q in health response", key)
		}
	}
}

func TestHealthz_Returns200(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/healthz", nil)
	w := httptest.NewRecorder()

	Healthz(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}
	if w.Body.String() != "ok" {
		t.Errorf("expected body %q, got %q", "ok", w.Body.String())
	}
}

func TestReadyz_Returns200(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/readyz", nil)
	w := httptest.NewRecorder()

	Readyz(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}
	if w.Body.String() != "ok" {
		t.Errorf("expected body %q, got %q", "ok", w.Body.String())
	}
}
