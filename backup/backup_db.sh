#!/bin/bash

# YCM Database Backup Script
# Usage: ./backup_db.sh [backup_directory]

# Configuration
DB_HOST="localhost"
DB_NAME="ycm_db"
DB_USER="ycm_user"
BACKUP_DIR="${1:-/var/backups/ycm}"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="ycm_backup_$DATE.sql.gz"
RETENTION_DAYS=30

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" >&2
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

# Check if mysqldump is available
if ! command -v mysqldump &> /dev/null; then
    error "mysqldump could not be found. Please install MySQL client tools."
    exit 1
fi

# Create backup directory if it doesn't exist
if [ ! -d "$BACKUP_DIR" ]; then
    log "Creating backup directory: $BACKUP_DIR"
    mkdir -p "$BACKUP_DIR"
    if [ $? -ne 0 ]; then
        error "Failed to create backup directory: $BACKUP_DIR"
        exit 1
    fi
fi

# Check if directory is writable
if [ ! -w "$BACKUP_DIR" ]; then
    error "Backup directory is not writable: $BACKUP_DIR"
    exit 1
fi

# Read MySQL password from .env file or use environment variable
if [ -f "../.env" ]; then
    DB_PASS=$(grep DB_PASS ../.env | cut -d '=' -f2)
else
    DB_PASS="$MYSQL_PASSWORD"
fi

if [ -z "$DB_PASS" ]; then
    error "MySQL password not found. Set DB_PASS in .env file or MYSQL_PASSWORD environment variable."
    exit 1
fi

# Perform backup
log "Starting database backup: $DB_NAME"
log "Backup file: $BACKUP_DIR/$BACKUP_FILE"

mysqldump -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" \
    --single-transaction \
    --quick \
    --lock-tables=false \
    --routines \
    --triggers \
    --events \
    | gzip > "$BACKUP_DIR/$BACKUP_FILE"

# Check if backup was successful
if [ $? -eq 0 ]; then
    log "Backup completed successfully: $BACKUP_DIR/$BACKUP_FILE"
    
    # Get file size
    FILE_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)
    log "Backup size: $FILE_SIZE"
else
    error "Backup failed!"
    exit 1
fi

# Clean up old backups
log "Cleaning up backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "ycm_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete

# List remaining backups
BACKUP_COUNT=$(find "$BACKUP_DIR" -name "ycm_backup_*.sql.gz" | wc -l)
log "Total backups in directory: $BACKUP_COUNT"

# Create latest backup symlink
LATEST_LINK="$BACKUP_DIR/ycm_backup_latest.sql.gz"
ln -sf "$BACKUP_DIR/$BACKUP_FILE" "$LATEST_LINK"
log "Created symlink: $LATEST_LINK → $BACKUP_FILE"

# Backup completion
log "Backup process completed successfully"

# Optional: Upload to cloud storage (uncomment and configure as needed)
# log "Uploading to cloud storage..."
# aws s3 cp "$BACKUP_DIR/$BACKUP_FILE" s3://your-bucket/ycm-backups/ --quiet
# if [ $? -eq 0 ]; then
#     log "Cloud upload successful"
# else
#     warning "Cloud upload failed"
# fi

exit 0