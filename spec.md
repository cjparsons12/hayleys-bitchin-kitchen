# Hayley's Bitchin' Kitchen - Project Specification

## Overview
**Project Name:** Hayley's Bitchin' Kitchen  
**Purpose:** A web app for tracking and displaying daily recipes in a blog-like format. Users can upload recipes (title + description or link) and view them chronologically.  
**Target Users:** Primarily internal use (you and your wife), designed to scale.  
**MVP Features:**
- Upload a recipe (title, description/link).
- List/display recipes in a blog feed (newest first).
- Simple, responsive UI.

**Future Enhancements:** Search, categories, images, user accounts, ratings.

## Tech Stack
- **Backend:** Python FastAPI
- **Frontend:** Vue.js (SPA)
- **Database:** PostgreSQL
- **Containerization:** Docker (with Docker Compose for local dev)
- **Deployment:** Docker-based (e.g., via cloud registry)

## Architecture
- **Backend (FastAPI):** Handles API logic, database interactions, and serves data to the frontend.
- **Frontend (Vue.js):** Single-page app for user interactions. Uses Axios or Fetch for API calls.
- **Database (PostgreSQL):** Stores recipe data. Use SQLAlchemy for ORM.
- **Containerization:** Docker Compose for local development (services: backend, frontend, db).

## Database Schema
**Recipes Table:**
- `id` (Primary Key, Auto-Increment, Integer)
- `title` (String, Required, Max 255 chars)
- `description` (Text, Optional – for full recipe details)
- `link` (String, Optional – URL to external recipe)
- `created_at` (Timestamp, Default: Now)
- `updated_at` (Timestamp, Default: Now)

**Constraints:** At least title or link must be provided. Use indexes on `created_at` for sorting.

## API Endpoints (FastAPI)
- **GET /recipes:** Fetch all recipes (paginated, sorted by `created_at` desc). Response: List of recipes.
- **POST /recipes:** Create a new recipe. Request: JSON with title, description, link. Response: Created recipe.
- **GET /recipes/{id}:** Fetch a single recipe by ID.
- **PUT /recipes/{id}:** Update a recipe (optional for MVP).
- **DELETE /recipes/{id}:** Delete a recipe (optional for MVP).

Use Pydantic models for request/response validation. Enable CORS for frontend integration.

## Frontend Structure (Vue.js)
**Pages/Routes:**
- `/` (Home): List of recipes in a blog feed (cards with title, excerpt, date).
- `/add-recipe`: Form to upload a new recipe (title, description/link fields).
- `/recipe/{id}`: Detail view for a single recipe.

**Components:**
- `RecipeList`: Displays recipes as cards.
- `RecipeForm`: Form for adding recipes.
- `RecipeCard`: Individual recipe preview.

**Styling:** Use Vue's scoped styles or Tailwind CSS for a clean, blog-like look. Ensure mobile-responsive.

## Development Workflow
**Setup:**
- Create folders: `backend/`, `frontend/`, `docker/`.
- Use `requirements.txt` (backend) and `package.json` (frontend) for dependencies.
- Docker Compose file: Services for FastAPI (port 8000), Vue dev server (port 3000), PostgreSQL (port 5432).

**Coding:**
- Backend: Implement models, routes, and database connections.
- Frontend: Build components, integrate with API.
- Testing: Unit tests for API (Pytest), basic E2E for frontend (Cypress if needed).

**Validation:** After changes, run builds/tests. Use Docker for consistent environments.

## Dependencies & Tools
**Backend:** fastapi, uvicorn, sqlalchemy, psycopg2-binary, pydantic.  
**Frontend:** vue, vue-router, axios, vite.  
**Database:** postgres (via Docker).  
**Dev Tools:** Docker Compose, Git, VS Code extensions for Python/Vue.

## Risks & Mitigations
- **Learning Curve:** If new to FastAPI/Vue, start with tutorials. Mitigate by building incrementally.
- **Data Persistence:** Use Docker volumes for local PostgreSQL data.
- **Security:** Sanitize inputs; add auth later if public.
- **Performance:** For small scale, no issues. Monitor with FastAPI's built-in metrics.

## Feedback on Idea
The concept is fun and practical. Tech stack is well-chosen for simplicity and scalability. Start simple to avoid feature creep.