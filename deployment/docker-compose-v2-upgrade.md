# Upgrading to Docker Compose v2

This guide covers upgrading your server from Docker Compose v1 to v2.

## What's Changing?

- **Old command:** `docker-compose` (standalone binary)
- **New command:** `docker compose` (Docker plugin)
- **Your config files:** Already compatible! ✓

## Benefits of v2

- ✅ Actively maintained and supported
- ✅ Faster performance
- ✅ Better compatibility with newer Docker features
- ✅ Fixes issues like the `ContainerConfig` error
- ✅ Integrated directly into Docker CLI

## Server Upgrade Instructions

### Step 1: SSH into your server

```bash
ssh -i .ssh/HayleysBitchinKitchenProd.pem ubuntu@YOUR_SERVER_IP
```

### Step 2: Check current version

```bash
docker-compose --version
# Should show: docker-compose version 1.29.2 or similar
```

### Step 3: Stop running containers

```bash
cd ~/hbk  # or your project directory
docker-compose -f docker-compose.prod.yml down
```

### Step 4: Remove old Docker Compose v1

```bash
sudo apt-get remove docker-compose
```

### Step 5: Install Docker Compose v2 plugin

```bash
# Update package list
sudo apt-get update

# Install Docker Compose v2 plugin
sudo apt-get install docker-compose-plugin
```

### Step 6: Verify installation

```bash
docker compose version
# Should show: Docker Compose version v2.x.x or similar
```

### Step 7: Start containers with new command

```bash
cd ~/hbk  # or your project directory
docker compose -f docker-compose.prod.yml up -d
```

### Step 8: Verify everything works

```bash
# Check container status
docker compose -f docker-compose.prod.yml ps

# Check logs
docker compose -f docker-compose.prod.yml logs -f

# Test the API
curl http://localhost:3000/api/recipes
```

## What If Something Goes Wrong?

### Rollback to v1 (if needed)

```bash
# Stop v2 containers
docker compose -f docker-compose.prod.yml down

# Reinstall v1
sudo apt-get install docker-compose

# Start with old command
docker-compose -f docker-compose.prod.yml up -d
```

## Updated Commands Reference

All existing commands work exactly the same, just change `docker-compose` to `docker compose`:

| Old Command (v1) | New Command (v2) |
|------------------|------------------|
| `docker-compose up -d` | `docker compose up -d` |
| `docker-compose down` | `docker compose down` |
| `docker-compose logs -f` | `docker compose logs -f` |
| `docker-compose ps` | `docker compose ps` |
| `docker-compose restart` | `docker compose restart` |
| `docker-compose build` | `docker compose build` |

## Troubleshooting

### "docker: 'compose' is not a docker command"

This means the plugin wasn't installed correctly. Try:

```bash
# Check Docker version (needs to be recent)
docker --version

# Try installing again
sudo apt-get update
sudo apt-get install docker-compose-plugin

# If still doesn't work, check if Docker is up to date
sudo apt-get install --only-upgrade docker.io
```

### Containers won't start

```bash
# Check if old containers exist
docker ps -a

# Remove old containers if needed
docker rm -f $(docker ps -aq)

# Start fresh
docker compose -f docker-compose.prod.yml up -d --force-recreate
```

## Next Steps

Once upgraded:

1. ✅ Deploy script will use new `docker compose` command
2. ✅ GitHub Actions will use new command
3. ✅ All documentation now reflects v2 syntax
4. ✅ CI/CD pipeline will work seamlessly

## Questions?

- Check Docker Compose v2 docs: https://docs.docker.com/compose/
- v1 to v2 migration guide: https://docs.docker.com/compose/migrate/
