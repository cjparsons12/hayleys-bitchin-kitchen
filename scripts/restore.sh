#!/bin/bash

# Hayley's Bitchin' Kitchen - Database Restore Script
# Restores SQLite database from backup

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

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to list available backups
list_backups() {
    log_info "Available backups:"
    echo
    
    local backups=($(find "$BACKUP_DIR" -name "database-*.sqlite*" -type f | sort -r))
    
    if [ ${#backups[@]} -eq 0 ]; then
        log_warn "No backups found in $BACKUP_DIR"
        exit 1
    fi
    
    local i=1
    for backup in "${backups[@]}"; do
        local size=$(du -h "$backup" | cut -f1)
        local date=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" "$backup")
        echo "  [$i] $(basename $backup) - $size - $date"
        i=$((i + 1))
    done
    echo
}

# Function to restore from specific backup
restore_backup() {
    local backup_file="$1"
    
    if [ ! -f "$backup_file" ]; then
        log_error "Backup file not found: $backup_file"
        exit 1
    fi
    
    log_info "Preparing to restore from: $(basename $backup_file)"
    
    # Create safety backup of current database
    if [ -f "$DB_PATH" ]; then
        local safety_backup="$BACKUP_DIR/pre-restore-$(date +%Y%m%d-%H%M%S).sqlite"
        log_info "Creating safety backup of current database..."
        cp "$DB_PATH" "$safety_backup"
        log_info "Safety backup created: $safety_backup"
    fi
    
    # Check if backup is compressed
    if [[ "$backup_file" == *.gz ]]; then
        log_info "Decompressing backup..."
        local temp_file=$(mktemp)
        gunzip -c "$backup_file" > "$temp_file"
        backup_file="$temp_file"
    fi
    
    # Restore database
    log_info "Restoring database..."
    cp "$backup_file" "$DB_PATH"
    
    # Cleanup temp file if created
    if [ -n "$temp_file" ]; then
        rm -f "$temp_file"
    fi
    
    log_info "Database restored successfully!"
    log_warn "Remember to restart the application for changes to take effect:"
    log_warn "  docker-compose -f docker-compose.prod.yml restart"
}

# Main script
cd "$PROJECT_DIR"

echo -e "${GREEN}=== Database Restore Tool ===${NC}"
echo

# Check if backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
    log_error "Backup directory not found: $BACKUP_DIR"
    exit 1
fi

# If backup file provided as argument, use it
if [ $# -eq 1 ]; then
    BACKUP_FILE="$1"
    
    # If just filename provided, prepend backup directory
    if [[ "$BACKUP_FILE" != /* ]]; then
        BACKUP_FILE="$BACKUP_DIR/$BACKUP_FILE"
    fi
    
    restore_backup "$BACKUP_FILE"
    exit 0
fi

# Otherwise, show interactive menu
list_backups

# Prompt user to select backup
read -p "Enter backup number to restore (or 'q' to quit): " choice

if [ "$choice" = "q" ]; then
    log_info "Restore cancelled"
    exit 0
fi

# Validate input
if ! [[ "$choice" =~ ^[0-9]+$ ]]; then
    log_error "Invalid input. Please enter a number."
    exit 1
fi

# Get selected backup
backups=($(find "$BACKUP_DIR" -name "database-*.sqlite*" -type f | sort -r))
selected_index=$((choice - 1))

if [ $selected_index -lt 0 ] || [ $selected_index -ge ${#backups[@]} ]; then
    log_error "Invalid backup number"
    exit 1
fi

selected_backup="${backups[$selected_index]}"

# Confirm restore
log_warn "WARNING: This will replace the current database!"
read -p "Are you sure you want to restore from $(basename $selected_backup)? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    log_info "Restore cancelled"
    exit 0
fi

restore_backup "$selected_backup"
