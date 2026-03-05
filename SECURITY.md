# Security Review — secrets-viewer

**Scope**: DEV/demo tool to verify ESO integration. Displaying env var values is intentional.

## Findings

### Health Endpoint — PASS
- `/health` returns only `status` and `version` — no sensitive data leaked
- `/healthz` and `/readyz` return plain `ok` — safe for K8s probes

### Secrets Endpoint — PASS
- `/api/secrets` is read-only (reads `os.Environ()`, no write operations)
- No filesystem access beyond environment variables
- No user input accepted (no query params, no body parsing) — no injection surface

### Security Headers — FIXED
- Added `X-Content-Type-Options: nosniff` on all responses
- Added `X-Frame-Options: DENY` on all responses
- Added `Cache-Control: no-store` on `/api/*` responses to prevent caching secrets

### Container Security — PASS
- Distroless base image (`gcr.io/distroless/static-debian12`)
- Non-root user (`USER 65534:65534`)
- Multi-stage build — no build tools in final image
- Binary compiled with `-ldflags="-s -w"` (stripped symbols)

### Helm Chart Security — PASS
- `runAsNonRoot: true` + `runAsUser: 65534`
- `readOnlyRootFilesystem: true`
- `allowPrivilegeEscalation: false`
- `capabilities.drop: [ALL]`
- Resource limits set (200m CPU, 128Mi memory)
- Service account created without extra privileges (no `automountServiceAccountToken: false` — acceptable for ESO demo)

### CORS — PASS
- No CORS headers set — defaults to same-origin (SPA is embedded in the binary)

### Frontend — PASS
- API calls are same-origin relative paths (`/api/secrets`, `/api/info`, `/health`)
- Secret values masked by default in UI (click to reveal)
- No user input sent to backend — filter is client-side only

## Test Coverage
- `internal/handler/health_test.go` — 4 tests (JSON shape, no data leaks, probe endpoints)
- `internal/handler/secrets_test.go` — 6 tests (array response, entry schema, read-only, classification)
- `internal/handler/info_test.go` — 7 tests (JSON shape, fields, env var usage, defaults)
