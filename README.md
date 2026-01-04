# Hayley's Bitchin' Kitchen

A web application for tracking and displaying daily recipes in a blog-like format. Built with FastAPI (backend), Vue.js (frontend), and PostgreSQL (database).

## Features

- Upload recipes with title, description, or external link
- View recipes in a chronological blog feed
- Responsive design for desktop and mobile
- RESTful API with FastAPI
- Containerized with Docker for easy deployment

## Tech Stack

- **Backend:** Python FastAPI
- **Frontend:** Vue.js 3 with Vite
- **Database:** PostgreSQL
- **Containerization:** Docker & Docker Compose

## Quick Start

### Prerequisites

- Docker and Docker Compose installed on your system
- For WSL2 users: Ensure Docker Desktop is running and integrated with WSL2

### Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd hayleys-bitchin-kitchen
   ```

2. Start the application in development mode:
   ```bash
   ./start.sh  # Development mode with hot-reload (default)
   ```

3. Open your browser and navigate to:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Database: localhost:5432 (accessible via tools like pgAdmin)

### Development vs Production

This project supports two modes:

**Development Mode (Default):**
- Code changes are reflected immediately without rebuilding containers
- Frontend runs on port 3000 with hot reloading
- Backend runs on port 8000 with auto-restart
- Database data persists in a Docker volume

**Production Mode:**
- Optimized for deployment with code baked into containers
- Frontend serves static files via nginx on port 80
- Use when deploying to production environments

```bash
./start.sh --prod  # Production mode
```

### Rebuilding Containers

In development mode, most code changes are reflected immediately. However, rebuild when dependencies change:

**Rebuild Frontend (when package.json changes):**
```bash
docker-compose build frontend && docker-compose up -d
```

**Rebuild Backend (when requirements.txt changes):**
```bash
docker-compose build backend && docker-compose up -d
```

**Rebuild Both:**
```bash
docker-compose build && docker-compose up -d
```

For production mode, containers are always rebuilt on start.

### API Endpoints

- `GET /recipes` - Fetch all recipes (paginated)
- `POST /recipes` - Create a new recipe
- `GET /recipes/{id}` - Fetch a single recipe
- `PUT /recipes/{id}` - Update a recipe
- `DELETE /recipes/{id}` - Delete a recipe

## Project Structure

```
.
├── backend/              # FastAPI backend
│   ├── main.py           # API routes
│   ├── models.py         # SQLAlchemy models
│   ├── database.py       # Database configuration
│   ├── Dockerfile        # Backend container
│   └── requirements.txt
├── frontend/             # Vue.js frontend
│   ├── src/
│   │   ├── components/
│   │   ├── views/
│   │   └── router/
│   ├── Dockerfile        # Production container
│   ├── Dockerfile.dev    # Development container
│   └── package.json
├── docker-compose.yml    # Development compose file (with volumes)
├── docker-compose.prod.yml # Production compose file (no volumes)
├── .env                  # Environment variables
└── README.md
```

## Environment Variables

Configure the following in `.env`:

- `POSTGRES_USER` - Database username
- `POSTGRES_PASSWORD` - Database password
- `POSTGRES_DB` - Database name
- `DATABASE_URL` - Full database connection string
- `BACKEND_PORT` - Backend port (default: 8000)
- `FRONTEND_PORT` - Frontend port (default: 3000)
- `DB_PORT` - Database port (default: 5432)

## Production Deployment

For production deployment, use the production mode which builds optimized containers:

```bash
./start.sh --prod  # Builds and starts production containers
```

Key differences in production:
- Frontend serves static files via nginx on port 80
- Code is baked into containers (no volume mounts)
- Optimized for performance and security

### Production Configuration

1. Update environment variables for production URLs
2. Configure nginx to proxy API calls to the backend
3. Set up proper CORS origins
4. Secure database credentials
5. Use environment-specific .env files

The production compose file (`docker-compose.prod.yml`) uses the production Dockerfile for the frontend, which builds the Vue.js app and serves it with nginx.

## Testing

### Backend Tests

```bash
cd backend
docker-compose run --rm backend pytest
```

### Frontend Tests

Add tests in `frontend/` as needed (e.g., with Vitest).

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3000, 8000, 5432 are available
2. **Database connection**: Check DATABASE_URL in .env
3. **CORS errors**: Backend allows all origins in dev; restrict in production
4. **Volume permissions**: If issues with postgres_data volume, remove and recreate
5. **Frontend 404 error**: Ensure `index.html` is in the `frontend/` root directory (not in `public/`)
6. **Docker credential errors in WSL2**: If you see "error getting credentials", clear `~/.docker/config.json` by running `echo '{}' > ~/.docker/config.json`
7. **Port access in WSL2**: If `localhost` doesn't work, use the host IP (usually `172.26.128.1`) or access from Windows browser
8. **Database startup issues**: Healthchecks ensure services start in correct order; wait for containers to be healthy

### Logs

View logs for specific services:

**Development mode:**
```bash
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db
```

**Production mode:**
```bash
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs frontend
docker-compose -f docker-compose.prod.yml logs db
```

Or use the stop script: `./stop.sh` or `./stop.sh --prod`

### Scripts

- `./start.sh` - Start all services in development mode with health checks
- `./start.sh --prod` - Start all services in production mode
- `./stop.sh` - Stop development services and clean up containers
- `./stop.sh --prod` - Stop production services and clean up containers

### Reset Database

To reset the database:

**Development mode:**
```bash
docker-compose down -v  # Remove volumes
docker-compose up --build
```

**Production mode:**
```bash
docker-compose -f docker-compose.prod.yml down -v  # Remove volumes
docker-compose -f docker-compose.prod.yml up --build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and test
4. Submit a pull request

## License

This project is licensed under the MIT License.