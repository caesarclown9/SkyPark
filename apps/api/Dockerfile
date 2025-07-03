# Sky Park Go API Dockerfile
# Multi-stage build for optimal production image

# Builder stage
FROM golang:1.22-alpine AS builder

# Install git and ca-certificates
RUN apk add --no-cache git ca-certificates tzdata

# Set working directory
WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build for production
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags='-w -s -extldflags "-static"' \
    -a -installsuffix cgo \
    -o main ./cmd/api

# Development stage
FROM golang:1.22-alpine AS development
WORKDIR /app

# Install air for hot reload
RUN go install github.com/cosmtrek/air@latest

# Install necessary packages for development
RUN apk add --no-cache git ca-certificates curl

# Copy go files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Expose port
EXPOSE 8080

# Health check for development
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Development command with hot reload
CMD ["air", "-c", ".air.toml"]

# Production stage - minimal image
FROM scratch AS production

# Copy timezone data
COPY --from=builder /usr/share/zoneinfo /usr/share/zoneinfo

# Copy CA certificates
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# Copy the binary
COPY --from=builder /app/main /main

# Copy configuration and migration files
COPY --from=builder /app/migrations /migrations
COPY --from=builder /app/config /config

# Expose port
EXPOSE 8080

# Set environment
ENV TZ=Asia/Bishkek
ENV GIN_MODE=release

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD ["/main", "health"]

# Run the binary
ENTRYPOINT ["/main"] 
 