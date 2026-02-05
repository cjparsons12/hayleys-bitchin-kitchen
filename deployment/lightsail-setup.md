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

```bash
nano .env
```

Add the following (replace with your values):

```env
# Required: Strong password for admin access
ADMIN_PASSWORD=your-very-secure-password-here

# Production settings
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

# Database path (inside container)
DATABASE_PATH=/app/data/database.sqlite

# CORS - set to your domain or * for all
CORS_ORIGIN=*

# Rate limiting
RATE_LIMIT_ADMIN=10
RATE_LIMIT_PUBLIC=60
```

**Important:** 
- Use a **strong, unique password** for `ADMIN_PASSWORD`
- Never commit `.env` to git
- If you change the password later, all JWT tokens will be invalidated

Save and exit: `Ctrl+X`, then `Y`, then `Enter`

### 3. Create Data Directories

```bash
mkdir -p data backups
```

### 4. Build and Start Application

```bash
# Build and start containers
docker-compose up -d --build

# View logs (optional)
docker-compose logs -f

# Press Ctrl+C to exit logs
```

### 5. Verify Deployment

```bash
# Check container status
docker-compose ps

# Test API
curl http://localhost:3000/api/recipes

# Should return: {"recipes":[]}
```

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

## Step 7: Configure HTTPS with Caddy (Recommended)

### Why HTTPS?
- **Required for JWT security** (spec states this is mandatory)
- Encrypts all traffic including passwords
- Better SEO and user trust

### Using Caddy (Easiest Method)

1. **Create Caddyfile**

```bash
cd ~/hayleys-bitchin-kitchen
nano Caddyfile
```

Add:

```
your-domain.com {
    reverse_proxy localhost:3000
}
```

2. **Update docker-compose.yml**

```bash
nano docker-compose.yml
```

Add Caddy service:

```yaml
version: '3.8'

services:
  app:
    build: .
    container_name: hbk-app
    ports:
      - "3000:3000"
    environment:
      - ADMIN_PASSWORD=${ADMIN_PASSWORD}
      - NODE_ENV=production
      - DATABASE_PATH=/app/data/database.sqlite
      - LOG_LEVEL=${LOG_LEVEL:-info}
      - CORS_ORIGIN=${CORS_ORIGIN:-*}
    volumes:
      - ./data:/app/data
      - ./backups:/app/backups
    restart: unless-stopped

  caddy:
    image: caddy:2-alpine
    container_name: hbk-caddy
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config
    restart: unless-stopped

volumes:
  caddy_data:
  caddy_config:
```

3. **Restart Services**

```bash
docker-compose down
docker-compose up -d --build
```

Caddy will automatically obtain and renew Let's Encrypt SSL certificates!

---

## Step 8: Set Up Automated Backups

### Daily Database Backup

```bash
# Edit crontab
crontab -e
```

Add these lines:

```bash
# Daily backup at 2 AM
0 2 * * * docker exec hbk-app sqlite3 /app/data/database.sqlite ".backup /app/backups/backup-$(date +\%Y\%m\%d).sqlite"

# Delete backups older than 7 days
0 3 * * * find ~/hayleys-bitchin-kitchen/backups -name "backup-*.sqlite" -mtime +7 -delete
```

Save and exit.

### Manual Backup Anytime

```bash
cp ~/hayleys-bitchin-kitchen/data/database.sqlite ~/backup-$(date +%Y%m%d).sqlite
```

---

## Step 9: Updating the Application

### Pull Latest Code

```bash
cd ~/hayleys-bitchin-kitchen
git pull origin main
```

### Rebuild and Restart

```bash
docker-compose down
docker-compose up -d --build
```

### View Logs

```bash
docker-compose logs -f
```

---

## Monitoring & Maintenance

### View Application Logs

```bash
# All services
docker-compose logs -f

# Just app
docker-compose logs -f app

# Last 100 lines
docker-compose logs --tail=100 app
```

### Check Container Status

```bash
docker-compose ps
```

### Check Disk Space

```bash
df -h
du -sh ~/hayleys-bitchin-kitchen/data/
```

### Restart Services

```bash
docker-compose restart
```

### Stop Services

```bash
docker-compose down
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
