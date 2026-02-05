#!/bin/bash

# Hayley's Bitchin' Kitchen - Database Backup Script
# Automates SQLite database backups with rotation

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DB_PATH="${DB_PATH:-$PROJECT_DIR/data/database.sqlite}"
BACKUP_DIR="${BACKUP_DIR:-$PROJECT_DIR/backups}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="$BACKUP_DIR/database-$TIMESTAMP.sqlite"

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if database exists
if [ ! -f "$DB_PATH" ]; then
    log_error "Database file not found at: $DB_PATH"
    exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Perform backup
log_info "Starting database backup..."
log_info "Source: $DB_PATH"
log_info "Destination: $BACKUP_FILE"

# Copy database file
if cp "$DB_PATH" "$BACKUP_FILE"; then
    # Get file size
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    log_info "Backup completed successfully! Size: $SIZE"
else
    log_error "Backup failed!"
    exit 1
fi

# Compress backup (optional but saves space)
log_info "Compressing backup..."
if gzip "$BACKUP_FILE"; then
    COMPRESSED_SIZE=$(du -h "$BACKUP_FILE.gz" | cut -f1)
    log_info "Backup compressed: $BACKUP_FILE.gz ($COMPRESSED_SIZE)"
    BACKUP_FILE="$BACKUP_FILE.gz"
else
    log_warn "Compression failed, keeping uncompressed backup"
fi

# Rotate old backups
log_info "Rotating old backups (keeping last $RETENTION_DAYS days)..."
DELETED_COUNT=0

find "$BACKUP_DIR" -name "database-*.sqlite*" -type f -mtime +$RETENTION_DAYS | while read file; do
    rm -f "$file"
    log_info "Deleted old backup: $(basename $file)"
    DELETED_COUNT=$((DELETED_COUNT + 1))
done

if [ $DELETED_COUNT -eq 0 ]; then
    log_info "No old backups to delete"
fi

# Summary
log_info "Backup summary:"
echo "  - Backup file: $(basename $BACKUP_FILE)"
echo "  - Total backups: $(find "$BACKUP_DIR" -name "database-*.sqlite*" -type f | wc -l | tr -d ' ')"
echo "  - Backup directory size: $(du -sh "$BACKUP_DIR" | cut -f1)"
echo
log_info "Backup completed at $(date)"
