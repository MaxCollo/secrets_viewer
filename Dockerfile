# Stage 1: Build frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Go binary
FROM golang:1.23-alpine AS go-build
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
COPY --from=frontend-build /app/frontend/dist ./frontend/dist
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /secrets-viewer ./cmd/server

# Stage 3: Runtime
FROM gcr.io/distroless/static-debian12
COPY --from=go-build /secrets-viewer /secrets-viewer
USER 65534:65534
EXPOSE 8080
ENTRYPOINT ["/secrets-viewer"]
