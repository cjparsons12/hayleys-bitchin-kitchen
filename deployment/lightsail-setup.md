# AWS Lightsail Deployment Guide

Complete guide for deploying Hayley's Bitchin Kitchen to AWS Lightsail using Docker.

## Overview

- **Hosting Platform:** AWS Lightsail
- **Server OS:** Ubuntu 22.04 LTS
- **Cost:** $3.50/month (512 MB) or $5/month (1 GB) - recommended
- **Deployment Method:** Docker Compose
- **Database:** SQLite (file-based, persisted via volume)

## Prerequisites

- AWS account
- Domain name (optional, but recommended for HTTPS)
- Git repository with your code (GitHub, GitLab, etc.)

---

## Step 1: Create Lightsail Instance

1. **Go to AWS Lightsail Console**
   - Visit: https://lightsail.aws.amazon.com/

2. **Create Instance**
   - Click "Create instance"
   - Select region closest to your users
   - Pick platform: **Linux/Unix**
   - Select blueprint: **OS Only** → **Ubuntu 22.04 LTS**

3. **Choose Instance Plan**
   - **Recommended:** $5/month (1 GB RAM, 1 vCPU, 40 GB SSD)
   - Budget option: $3.50/month (512 MB RAM) - may be slower

4. **Name Your Instance**
   - Example: `hayleys-kitchen-prod`

5. **Create Instance**
   - Click "Create instance" and wait for it to start

---

## Step 2: Configure Firewall

1. **Open Networking Tab**
   - Click on your instance
   - Go to "Networking" tab

2. **Add Firewall Rules**
   - Port 80 (HTTP) - **Required**
   - Port 443 (HTTPS) - **Required for production**
   - Port 22 (SSH) - Already enabled

3. **Save Changes**

---

## Step 3: Connect to Instance

### Option A: Browser-based SSH (Easy)

1. Click "Connect using SSH" in Lightsail console

### Option B: SSH Key (Recommended)

1. **Download SSH Key**
   - Account → SSH Keys → Download default key
   - Save as `lightsail-key.pem`

2. **Set Permissions**
   ```bash
   chmod 400 lightsail-key.pem
   ```

3. **Connect**
   ```bash
   ssh -i lightsail-key.pem ubuntu@YOUR_INSTANCE_IP
   ```

---

## Step 4: Install Docker & Docker Compose

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install -y docker.io docker-compose

# Add user to docker group (avoid sudo)
sudo usermod -aG docker ubuntu

# Log out and back in for group changes
exit
# Reconnect via SSH

# Verify installation
docker --version
docker-compose --version
```

---

## Step 5: Deploy Application

### 1. Clone Repository

```bash
cd ~
git clone https://github.com/YOUR_USERNAME/hayleys-bitchin-kitchen.git
cd hayleys-bitchin-kitchen
```

### 2. Create Environment File

**Quick setup from template:**

```bash
# Copy production template
cp .env.production .env

# Edit with your values
nano .env
```

Update these required values:

```env
# REQUIRED: Strong password for admin access
ADMIN_PASSWORD=your-very-secure-password-here

# REQUIRED: Your domain name (for HTTPS)
DOMAIN=yourdomain.com

# Optional: Adjust production settings
LOG_LEVEL=warn
CORS_ORIGIN=https://yourdomain.com
ADMIN_RATE_LIMIT=5
PUBLIC_RATE_LIMIT=100
```

**Important:** 
- Use a **strong, unique password** for `ADMIN_PASSWORD`
- Set your actual `DOMAIN` for automatic HTTPS
- Never commit `.env` to git
- If you change the password later, all JWT tokens will be invalidated

Save and exit: `Ctrl+X`, then `Y`, then `Enter`

### Alternative: Manual Setup

If `.env.production` isn't available, see `.env.example` in the repository for all available configuration options.

### 3. Create Data Directories

```bash
mkdir -p data backups
```

### 4. Build and Start Application

**For production deployment with HTTPS:**

```bash
# Build and start with production compose file (includes Caddy)
docker-compose -f docker-compose.prod.yml up -d --build

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Press Ctrl+C to exit logs
```

**For development/testing (no HTTPS):**

```bash
# Build and start with basic compose file
docker-compose up -d --build
```

The production setup includes:
- ✅ Automatic HTTPS via Caddy + Let's Encrypt
- ✅ Automatic certificate renewal
- ✅ HTTP to HTTPS redirect
- ✅ Security headers
- ✅ Health-check based startup

### 5. Verify Deployment

```bash
# Check container status
docker-compose -f docker-compose.prod.yml ps

# Test API (local)
curl http://localhost:3000/api/recipes

# Should return: {"recipes":[]}

# Test via HTTPS (replace with your domain)
curl https://yourdomain.com/api/recipes
```

If using `docker-compose.prod.yml`, HTTPS should work automatically once DNS propagates!

---

## Step 6: Configure Domain (Optional but Recommended)

### Option A: Use Static IP

1. **Create Static IP in Lightsail**
   - Go to instance → Networking
   - Click "Create static IP"
   - Attach to your instance

2. **Update DNS Records**
   - Go to your domain registrar
   - Add A record pointing to static IP:
     ```
     Type: A
     Name: @ (or subdomain like 'recipes')
     Value: YOUR_STATIC_IP
     TTL: 3600
     ```

### Option B: Use Lightsail DNS

1. **Create DNS Zone in Lightsail**
   - Networking → DNS zones → Create DNS zone
   - Enter your domain name

2. **Update Nameservers**
   - Copy Lightsail nameservers
   - Update at your domain registrar

3. **Add A Record**
   - Point to your instance's IP

---

## Step 7: Configure HTTPS with Caddy

### Option A: Using docker-compose.prod.yml (Recommended - Easiest!)

If you deployed with `docker-compose.prod.yml`, **HTTPS is already configured!** Caddy automatically:
- ✅ Obtains Let's Encrypt SSL certificate
- ✅ Renews certificates automatically
- ✅ Redirects HTTP to HTTPS
- ✅ Adds security headers

Just make sure:
1. Your `DOMAIN` is set correctly in `.env`
2. DNS points to your server's IP
3. Ports 80 and 443 are open in firewall

That's it! No manual configuration needed.

### Option B: Manual Caddy Setup (if using docker-compose.yml)

### Why HTTPS?
- **Required for JWT security** (spec states this is mandatory)
- Encrypts all traffic including passwords
- Better SEO and user trust

### Manual Setup Steps

1. **Ensure Caddyfile exists**

```bash
cd ~/hayleys-bitchin-kitchen
# Caddyfile should already exist from repository
cat Caddyfile
```

2. **Update .env with domain**

```bash
nano .env
# Add or update: DOMAIN=yourdomain.com
```

---

## Step 8: Set Up Automated Backups

### Using Automated Backup Script (Recommended)

The repository includes ready-to-use backup scripts:

```bash
# Test backup script
./scripts/backup.sh

# Test restore script (lists available backups)
./scripts/restore.sh
```

### Set Up Daily Automated Backups

```bash
# Edit crontab
crontab -e
```

Add this line for daily backups at 2 AM:

```bash
# Daily database backup at 2 AM with 30-day retention
0 2 * * * cd ~/hayleys-bitchin-kitchen && ./scripts/backup.sh >> ~/backup.log 2>&1
```

The backup script automatically:
- ✅ Creates timestamped backups
- ✅ Compresses backups to save space
- ✅ Rotates old backups (keeps last 30 days)
- ✅ Logs all operations

### Manual Backup Anytime

```bash
cd ~/hayleys-bitchin-kitchen
./scripts/backup.sh
```

### Restore from Backup

```bash
# Interactive restore (shows list of backups)
./scripts/restore.sh

# Direct restore from specific backup
./scripts/restore.sh backups/database-20260204-140530.sqlite.gz
```

### Legacy Manual Method

```bash
# Manual backup
cp ~/hayleys-bitchin-kitchen/data/database.sqlite ~/backup-$(date +%Y%m%d).sqlite
```

---

## Step 9: Updating the Application

### Automated Deployment (Recommended)

Use the automated deployment script for zero-downtime updates:

```bash
cd ~/hayleys-bitchin-kitchen
./deployment/deploy.sh
```

The deploy script automatically:
- ✅ Pulls latest code from git
- ✅ Validates environment configuration
- ✅ Creates pre-deployment backup
- ✅ Builds new Docker image
- ✅ Performs zero-downtime rolling update
- ✅ Runs health checks
- ✅ Cleans up old images

### CI/CD with GitHub Actions (Optional)

For automatic deployments on every push to main:

1. **Set up GitHub Secrets** in your repository:
   - `LIGHTSAIL_SSH_KEY` - Your SSH private key
   - `LIGHTSAIL_HOST` - Your server IP or domain
   - `LIGHTSAIL_USER` - Usually `ubuntu`
   - `PROJECT_PATH` - Path to project (e.g., `/home/ubuntu/hayleys-bitchin-kitchen`)

2. **Push to main branch** - deployment happens automatically!

3. **Monitor deployment** in GitHub Actions tab

### Manual Deployment (Legacy Method)

```bash
cd ~/hayleys-bitchin-kitchen

# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

---

## Monitoring & Maintenance

### View Application Logs

```bash
# All services (production)
docker-compose -f docker-compose.prod.yml logs -f

# Just app
docker-compose -f docker-compose.prod.yml logs -f app

# Just Caddy (HTTPS proxy)
docker-compose -f docker-compose.prod.yml logs -f caddy

# Last 100 lines
docker-compose -f docker-compose.prod.yml logs --tail=100 app
```

### Check Container Status

```bash
docker-compose -f docker-compose.prod.yml ps
```

### Check Disk Space

```bash
df -h
du -sh ~/hayleys-bitchin-kitchen/data/
du -sh ~/hayleys-bitchin-kitchen/backups/
```

### Restart Services

```bash
docker-compose -f docker-compose.prod.yml restart
```

### Stop Services

```bash
docker-compose -f docker-compose.prod.yml down
```

---

## Security Checklist

- ✅ Strong `ADMIN_PASSWORD` set
- ✅ HTTPS configured (Caddy or Certbot)
- ✅ Firewall rules configured (ports 80, 443)
- ✅ Regular backups enabled
- ✅ `.env` file not committed to git
- ✅ Rate limiting enabled
- ✅ Docker containers restart automatically

---

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs app

# Common issues:
# - Missing ADMIN_PASSWORD in .env
# - Port 3000 already in use
# - Permissions on data directory
```

### Can't connect to application

```bash
# Check if container is running
docker-compose ps

# Check firewall rules in Lightsail console
# Verify ports 80 and 443 are open

# Test locally
curl http://localhost:3000/api/recipes
```

### Out of disk space

```bash
# Check disk usage
df -h

# Clean up Docker
docker system prune -a

# Remove old backups
find ~/hayleys-bitchin-kitchen/backups -mtime +7 -delete
```

### HTTPS certificate issues

```bash
# Check Caddy logs
docker-compose logs caddy

# Ensure:
# - Domain DNS points to server
# - Ports 80 and 443 are open
# - Domain is correctly set in Caddyfile
```

### Database corrupted

```bash
# Stop containers
docker-compose down

# Restore from backup
cp ~/hayleys-bitchin-kitchen/backups/backup-20260204.sqlite \
   ~/hayleys-bitchin-kitchen/data/database.sqlite

# Restart
docker-compose up -d
```

---

## Cost Breakdown

| Component | Cost |
|-----------|------|
| Lightsail Instance (1 GB) | $5.00/month |
| Data Transfer (1 TB included) | $0.00 |
| Static IP | $0.00 (free while attached) |
| SSL Certificate (Let's Encrypt) | $0.00 |
| **Total** | **~$5/month** |

Budget option with 512 MB plan: **$3.50/month**

---

## Performance Tips

### For 512 MB Instance

- Monitor memory usage: `docker stats`
- Consider adding swap space if needed:
  ```bash
  sudo fallocate -l 1G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  ```

### For Better Performance

- Upgrade to $5/month (1 GB) plan
- Use static IP to avoid IP changes
- Enable Cloudflare (free CDN + DDoS protection)

---

## Support

If you encounter issues:

1. Check logs: `docker-compose logs -f`
2. Verify environment variables: `cat .env`
3. Check container status: `docker-compose ps`
4. Review firewall rules in Lightsail console
5. Test locally: `curl http://localhost:3000/api/recipes`

---

## Next Steps

1. ✅ Test adding recipes via admin panel
2. ✅ Verify recipes appear on home page
3. ✅ Test on mobile devices
4. ✅ Set up monitoring (UptimeRobot, etc.)
5. ✅ Share with friends!

**Your recipe blog is now live! 🎉**
