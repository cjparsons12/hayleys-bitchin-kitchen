#!/bin/bash

# Hayley's Bitchin' Kitchen - Automated Deployment Script
# This script handles git updates, environment validation, backups, and zero-downtime deployments

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="$PROJECT_DIR/backups"
REQUIRED_ENV_VARS=("ADMIN_PASSWORD" "DOMAIN")

echo -e "${GREEN}=== Hayley's Bitchin' Kitchen Deployment ===${NC}"
echo "Project directory: $PROJECT_DIR"
echo

# Function to print colored messages
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Change to project directory
cd "$PROJECT_DIR"

# Step 1: Git update
log_info "Fetching latest changes from git..."
if git fetch origin; then
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    log_info "Current branch: $CURRENT_BRANCH"
    
    if git diff --quiet HEAD origin/$CURRENT_BRANCH; then
        log_info "Already up to date. No changes to deploy."
    else
        log_info "Changes detected. Pulling latest code..."
        git pull origin $CURRENT_BRANCH
    fi
else
    log_error "Failed to fetch from git repository"
    exit 1
fi

# Step 2: Validate environment file
log_info "Validating environment configuration..."
if [ ! -f "$PROJECT_DIR/.env" ]; then
    log_error ".env file not found!"
    log_warn "Please create .env from .env.production template:"
    log_warn "  cp .env.production .env"
    log_warn "  nano .env  # Edit with your values"
    exit 1
fi

# Check required environment variables
source "$PROJECT_DIR/.env"
for var in "${REQUIRED_ENV_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        log_error "Required environment variable $var is not set in .env file"
        exit 1
    fi
done
log_info "Environment validation passed"

# Step 3: Create backup before deployment
log_info "Creating pre-deployment backup..."
if [ -f "$PROJECT_DIR/data/database.sqlite" ]; then
    mkdir -p "$BACKUP_DIR"
    BACKUP_FILE="$BACKUP_DIR/pre-deploy-$(date +%Y%m%d-%H%M%S).sqlite"
    cp "$PROJECT_DIR/data/database.sqlite" "$BACKUP_FILE"
    log_info "Backup created: $BACKUP_FILE"
else
    log_warn "No database file found, skipping backup"
fi

# Step 4: Build new image
log_info "Building Docker image..."
if docker-compose -f docker-compose.prod.yml build --no-cache; then
    log_info "Docker image built successfully"
else
    log_error "Failed to build Docker image"
    exit 1
fi

# Step 5: Zero-downtime deployment
log_info "Performing zero-downtime deployment..."

# Start new containers
log_info "Starting updated containers..."
if docker-compose -f docker-compose.prod.yml up -d; then
    log_info "Containers started successfully"
else
    log_error "Failed to start containers"
    exit 1
fi

# Step 6: Health check
log_info "Waiting for application to be healthy..."
MAX_WAIT=60
WAIT_COUNT=0

while [ $WAIT_COUNT -lt $MAX_WAIT ]; do
    if docker-compose -f docker-compose.prod.yml ps | grep -q "healthy"; then
        log_info "Application is healthy!"
        break
    fi
    
    if [ $WAIT_COUNT -eq 0 ]; then
        echo -n "Waiting for health check"
    fi
    echo -n "."
    sleep 2
    WAIT_COUNT=$((WAIT_COUNT + 2))
done
echo

if [ $WAIT_COUNT -ge $MAX_WAIT ]; then
    log_error "Health check timeout! Application may not be running correctly."
    log_warn "Check logs with: docker-compose -f docker-compose.prod.yml logs"
    exit 1
fi

# Step 7: Cleanup old images
log_info "Cleaning up old Docker images..."
docker image prune -f

# Step 8: Display status
log_info "Deployment completed successfully!"
echo
echo -e "${GREEN}=== Deployment Summary ===${NC}"
echo "Branch: $CURRENT_BRANCH"
echo "Commit: $(git rev-parse --short HEAD)"
echo "Time: $(date)"
echo
echo "To view logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "To check status: docker-compose -f docker-compose.prod.yml ps"
echo
