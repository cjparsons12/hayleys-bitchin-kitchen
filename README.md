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

2. Start the application:
   ```bash
   ./start.sh  # Convenient script to start all services
   # Or manually: docker-compose up --build -d
   ```

3. Open your browser and navigate to:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Database: localhost:5432 (accessible via tools like pgAdmin)

### Development

For development, the containers will hot-reload on code changes.

- Frontend dev server runs on port 3000 with hot reloading
- Backend runs on port 8000 with auto-restart
- Database data persists in a Docker volume

### API Endpoints

- `GET /recipes` - Fetch all recipes (paginated)
- `POST /recipes` - Create a new recipe
- `GET /recipes/{id}` - Fetch a single recipe
- `PUT /recipes/{id}` - Update a recipe
- `DELETE /recipes/{id}` - Delete a recipe

## Project Structure

```
.
├── backend/          # FastAPI backend
│   ├── main.py       # API routes
│   ├── models.py     # SQLAlchemy models
│   ├── database.py   # Database configuration
│   ├── Dockerfile    # Backend container
│   └── requirements.txt
├── frontend/         # Vue.js frontend
│   ├── src/
│   │   ├── components/
│   │   ├── views/
│   │   └── router/
│   ├── Dockerfile    # Production container
│   ├── Dockerfile.dev # Development container
│   └── package.json
├── docker-compose.yml # Main compose file
├── .env              # Environment variables
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

For production deployment:

1. Update the frontend Dockerfile to use production build
2. Configure nginx to proxy API calls to the backend
3. Use environment variables for API base URL
4. Secure database credentials
5. Set up proper CORS origins

Example production docker-compose override:

```yaml
version: '3.8'
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile  # Use production Dockerfile
    environment:
      - VITE_API_BASE=http://backend:8000
```

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

```bash
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db
# Or use the stop script: ./stop.sh
```

### Scripts

- `./start.sh` - Start all services with health checks
- `./stop.sh` - Stop and clean up containers

### Reset Database

To reset the database:

```bash
docker-compose down -v  # Remove volumes
docker-compose up --build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and test
4. Submit a pull request

## License

This project is licensed under the MIT License.