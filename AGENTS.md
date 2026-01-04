# Hayley's Bitchin' Kitchen - Agent Development Guide

## Overview

This is a full-stack web application for recipe management with a blog-like interface. The project consists of:

- **Backend**: FastAPI (Python) with SQLAlchemy and PostgreSQL
- **Frontend**: Vue.js 3 with Vite, Pinia for state management
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Containerization**: Docker Compose with separate dev/prod configurations

## Prerequisites for Agents

- Docker and Docker Compose
- Basic understanding of Python FastAPI, Vue.js, and PostgreSQL
- Familiarity with REST APIs and modern frontend frameworks

## Development Environment Setup

### 1. Clone and Navigate
```bash
git clone <repository-url>
cd hayleys-bitchin-kitchen
```

### 2. Environment Configuration
The project uses `.env` file for configuration. Key variables:
- Database: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `DATABASE_URL`
- Ports: `BACKEND_PORT=8000`, `FRONTEND_PORT=3000`, `DB_PORT=5432`

### 3. Start Development Environment
```bash
./start.sh  # This uses docker-compose.yml with volume mounts for hot-reload
```

**What happens:**
- Backend starts on port 8000 with code mounted as volume
- Frontend starts on port 3000 with hot-reload enabled
- Database starts on port 5432
- All services are connected via Docker network

### 4. Verify Setup
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Database: localhost:5432 (for direct connections)

## Development Workflow

### Code Changes
- **Frontend**: Changes in `frontend/src/` are reflected immediately (hot-reload)
- **Backend**: Changes in `backend/` are reflected immediately (volume mount)
- **Database**: Schema changes require migration scripts or manual updates

### Rebuilding (Only when dependencies change)
```bash
# Frontend dependencies (package.json)
docker-compose build frontend && docker-compose up -d

# Backend dependencies (requirements.txt)
docker-compose build backend && docker-compose up -d

# Full rebuild
docker-compose build && docker-compose up -d
```

### Testing Changes
```bash
# View logs
docker-compose logs -f [service]

# Restart specific service
docker-compose restart [service]

# Access containers
docker-compose exec [service] bash
```

## Project Architecture

### Backend Structure (`backend/`)
```
backend/
├── main.py          # FastAPI app, routes, CORS
├── models.py        # SQLAlchemy models (Recipe)
├── database.py      # Database connection, session management
├── requirements.txt # Python dependencies
├── Dockerfile       # Production container
└── static/uploads/  # File uploads directory
```

**Key Components:**
- FastAPI app with automatic API docs
- SQLAlchemy ORM with PostgreSQL
- File upload handling for recipe images
- RESTful endpoints for CRUD operations

### Frontend Structure (`frontend/`)
```
frontend/
├── src/
│   ├── main.js           # Vue app entry point
│   ├── App.vue           # Root component
│   ├── components/       # Reusable components
│   │   ├── RecipeCard.vue
│   │   ├── RecipeForm.vue
│   │   └── RecipeList.vue
│   ├── views/            # Page components
│   │   ├── Home.vue
│   │   ├── AddRecipe.vue
│   │   └── RecipeDetail.vue
│   ├── router/
│   │   └── index.js      # Vue Router configuration
│   └── assets/
│       └── main.css      # Global styles
├── Dockerfile.dev        # Development container
├── Dockerfile            # Production container
└── package.json
```

**Key Components:**
- Vue 3 Composition API
- Vue Router for navigation
- Pinia for state management (if implemented)
- Responsive design with CSS
- Axios for API calls

### Database Schema
```sql
-- Main Recipe table
CREATE TABLE recipes (
    id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    description TEXT,
    external_link VARCHAR,
    image_path VARCHAR,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### Recipes
- `GET /recipes` - List all recipes (paginated)
- `POST /recipes` - Create new recipe (with file upload)
- `GET /recipes/{id}` - Get single recipe
- `PUT /recipes/{id}` - Update recipe
- `DELETE /recipes/{id}` - Delete recipe

### File Upload
- `POST /upload` - Upload recipe images
- Images stored in `backend/static/uploads/`

## Common Development Tasks

### Adding New Features

1. **Backend API Changes:**
   - Add route in `main.py`
   - Update model in `models.py` if needed
   - Test with API docs at `/docs`

2. **Frontend Changes:**
   - Add component in `components/`
   - Add route in `router/index.js`
   - Update views as needed
   - Test in browser at localhost:3000

3. **Database Changes:**
   - Update model in `models.py`
   - Consider migration strategy
   - Test database connections

### Debugging

```bash
# Backend logs
docker-compose logs -f backend

# Frontend build logs
docker-compose logs -f frontend

# Database queries (connect directly)
docker-compose exec db psql -U user -d hbk

# Access backend container
docker-compose exec backend bash

# Access frontend container
docker-compose exec frontend sh
```

### Testing

```bash
# Backend tests (if implemented)
docker-compose exec backend python -m pytest

# Manual API testing
curl http://localhost:8000/recipes

# Frontend testing (add as needed)
# Consider Vitest or similar for unit tests
```

## Code Style and Conventions

### Backend (Python)
- Use FastAPI best practices
- Type hints encouraged
- SQLAlchemy ORM patterns
- RESTful API design

### Frontend (JavaScript/Vue)
- Vue 3 Composition API
- ES6+ features
- Component-based architecture
- Responsive CSS

### General
- Clear commit messages
- Feature branches for changes
- Test changes before committing

## Deployment Considerations

While agents work in development mode, note that production uses:
- `docker-compose.prod.yml` (no volumes)
- Nginx for static file serving
- Optimized builds

```bash
./start.sh --prod  # Production mode
```

## Getting Help

- Check existing issues and documentation
- Review API docs at `/docs`
- Examine existing code patterns
- Test changes incrementally

## Agent Collaboration Tips

- Use descriptive commit messages
- Document any architectural decisions
- Update this guide if adding new patterns
- Test thoroughly before proposing changes
- Consider both frontend and backend implications

---

*This guide is specifically for AI agents assisting with development. For end-user documentation, see README.md*