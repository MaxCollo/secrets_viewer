package handler

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
)

func TestPodInfo_ReturnsJSON(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/api/info", nil)
	w := httptest.NewRecorder()

	PodInfo(w, req)

	resp := w.Result()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
	}

	ct := resp.Header.Get("Content-Type")
	if ct != "application/json" {
		t.Fatalf("expected Content-Type application/json, got %q", ct)
	}

	var body podInfoResponse
	if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
		t.Fatalf("failed to decode JSON: %v", err)
	}
}

func TestPodInfo_HostnamePopulated(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/api/info", nil)
	w := httptest.NewRecorder()

	PodInfo(w, req)

	var body podInfoResponse
	json.NewDecoder(w.Result().Body).Decode(&body)

	if body.Hostname == "" {
		t.Error("expected hostname to be non-empty")
	}
}

func TestPodInfo_StartTimePopulated(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/api/info", nil)
	w := httptest.NewRecorder()

	PodInfo(w, req)

	var body podInfoResponse
	json.NewDecoder(w.Result().Body).Decode(&body)

	if body.StartTime == "" {
		t.Error("expected startTime to be non-empty")
	}
}

func TestPodInfo_ExpectedFields(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/api/info", nil)
	w := httptest.NewRecorder()

	PodInfo(w, req)

	var body map[string]interface{}
	json.NewDecoder(w.Result().Body).Decode(&body)

	expected := []string{"hostname", "namespace", "podName", "nodeName", "startTime"}
	for _, key := range expected {
		if _, ok := body[key]; !ok {
			t.Errorf("missing expected field %q", key)
		}
	}
}

func TestPodInfo_UsesEnvVars(t *testing.T) {
	os.Setenv("POD_NAMESPACE", "test-ns")
	os.Setenv("POD_NAME", "test-pod")
	os.Setenv("NODE_NAME", "test-node")
	defer func() {
		os.Unsetenv("POD_NAMESPACE")
		os.Unsetenv("POD_NAME")
		os.Unsetenv("NODE_NAME")
	}()

	req := httptest.NewRequest(http.MethodGet, "/api/info", nil)
	w := httptest.NewRecorder()

	PodInfo(w, req)

	var body podInfoResponse
	json.NewDecoder(w.Result().Body).Decode(&body)

	if body.Namespace != "test-ns" {
		t.Errorf("expected namespace %q, got %q", "test-ns", body.Namespace)
	}
	if body.PodName != "test-pod" {
		t.Errorf("expected podName %q, got %q", "test-pod", body.PodName)
	}
	if body.NodeName != "test-node" {
		t.Errorf("expected nodeName %q, got %q", "test-node", body.NodeName)
	}
}

func TestEnvOrDefault_ReturnsEnv(t *testing.T) {
	os.Setenv("TEST_KEY_12345", "value")
	defer os.Unsetenv("TEST_KEY_12345")

	if got := envOrDefault("TEST_KEY_12345", "fallback"); got != "value" {
		t.Errorf("expected %q, got %q", "value", got)
	}
}

func TestEnvOrDefault_ReturnsFallback(t *testing.T) {
	os.Unsetenv("TEST_KEY_99999")
	if got := envOrDefault("TEST_KEY_99999", "fallback"); got != "fallback" {
		t.Errorf("expected %q, got %q", "fallback", got)
	}
}
