# Deployment Improvements

This document summarizes the deployment automation improvements made to simplify production deployments.

## New Files Created

### Environment Templates
- **`.env.production`** - Production-ready environment template with secure defaults
- **`.env.example`** - Comprehensive documentation of all available environment variables

### Docker Configuration
- **`docker-compose.prod.yml`** - Production Docker Compose configuration with:
  - Caddy reverse proxy for automatic HTTPS
  - Let's Encrypt SSL certificate automation
  - Health-check based service dependencies
  - Security headers
  - Stricter restart policies

- **`Caddyfile`** - Caddy configuration for automatic HTTPS, security headers, and logging

### Automation Scripts
- **`deployment/deploy.sh`** - Automated deployment script with:
  - Git pull automation
  - Environment validation
  - Pre-deployment backups
  - Zero-downtime rolling updates
  - Health checks
  - Automatic cleanup

- **`scripts/backup.sh`** - Automated database backup with:
  - Timestamped backups
  - Compression to save space
  - Automatic rotation (30-day retention)
  - Detailed logging

- **`scripts/restore.sh`** - Database restoration tool with:
  - Interactive backup selection
  - Safety backups before restore
  - Support for compressed backups
  - Verification steps

### CI/CD
- **`.github/workflows/deploy.yml`** - GitHub Actions workflow for:
  - Automatic deployment on push to main
  - SSH-based deployment to Lightsail
  - Deployment verification
  - Secure credential management

## Key Improvements

### 1. Simplified Setup
```bash
# Old way:
nano .env  # manually type everything

# New way:
cp .env.production .env
nano .env  # only change ADMIN_PASSWORD and DOMAIN
```

### 2. Automatic HTTPS
```bash
# Old way: Manual Caddy setup, manual cert renewal

# New way:
docker-compose -f docker-compose.prod.yml up -d
# HTTPS just works! Automatic cert renewal included.
```

### 3. One-Command Deployments
```bash
# Old way:
git pull
docker-compose down
docker-compose up -d --build
# Hope nothing breaks...

# New way:
./deployment/deploy.sh
# Handles everything with validation and rollback capability
```

### 4. Automated Backups
```bash
# Old way: Manual cron setup with complex sqlite3 commands

# New way:
./scripts/backup.sh  # Test it works
crontab -e  # Add one simple line
# Automatic backup, compression, and rotation
```

### 5. CI/CD Integration
```bash
# Old way: SSH into server, run commands manually

# New way:
git push origin main
# GitHub Actions deploys automatically!
```

## Quick Start for New Deployments

1. **Clone and setup environment:**
   ```bash
   git clone <repo>
   cd hayleys-bitchin-kitchen
   cp .env.production .env
   nano .env  # Set ADMIN_PASSWORD and DOMAIN
   ```

2. **Deploy with HTTPS:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

3. **Set up automated backups:**
   ```bash
   crontab -e
   # Add: 0 2 * * * cd ~/hayleys-bitchin-kitchen && ./scripts/backup.sh
   ```

4. **Optional: Enable CI/CD**
   - Add GitHub secrets (SSH_KEY, HOST, USER, PROJECT_PATH)
   - Push to main branch
   - Automatic deployments!

## GitHub Secrets Required for CI/CD

Set these in: Repository → Settings → Secrets and variables → Actions

- `LIGHTSAIL_SSH_KEY` - Private SSH key for server access
- `LIGHTSAIL_HOST` - Server IP address or domain
- `LIGHTSAIL_USER` - SSH username (usually `ubuntu`)
- `PROJECT_PATH` - Full path to project directory (e.g., `/home/ubuntu/hayleys-bitchin-kitchen`)

## Environment Variables Reference

### Required
- `ADMIN_PASSWORD` - Admin authentication password and JWT secret
- `DOMAIN` - Your domain name (for automatic HTTPS)

### Optional (with defaults)
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode (default: production)
- `DB_PATH` - Database path (default: ./data/database.sqlite)
- `LOG_LEVEL` - Logging level (default: warn for production)
- `CORS_ORIGIN` - CORS configuration (default: *)
- `ADMIN_RATE_LIMIT` - Admin endpoint rate limit (default: 5)
- `PUBLIC_RATE_LIMIT` - Public endpoint rate limit (default: 100)

## Migration Notes

### From Old Setup to New

If you have an existing deployment:

1. **Pull latest code:**
   ```bash
   cd ~/hayleys-bitchin-kitchen
   git pull origin main
   ```

2. **Update .env file:**
   ```bash
   # Add new required variable
   echo "DOMAIN=yourdomain.com" >> .env
   ```

3. **Switch to production compose:**
   ```bash
   docker-compose down
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

4. **Set up new automation:**
   ```bash
   chmod +x deployment/deploy.sh scripts/*.sh
   ./scripts/backup.sh  # Test backup
   ```

Your data is preserved through Docker volumes - no data loss!
