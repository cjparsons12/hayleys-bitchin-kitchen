# Hayley's Bitchin' Kitchen Backend

This is the FastAPI backend for Hayley's Bitchin' Kitchen, a recipe tracking app.

## Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Set up the database:
   - Ensure PostgreSQL is running.
   - Set the DATABASE_URL environment variable, e.g.:
     ```bash
     export DATABASE_URL="postgresql://user:password@localhost:5432/hbk"
     ```

3. Run the application:
   ```bash
   uvicorn main:app --reload
   ```

The API will be available at http://localhost:8000.

## API Endpoints

- `GET /recipes`: Get all recipes (paginated).
- `POST /recipes`: Create a new recipe.
- `GET /recipes/{id}`: Get a single recipe.
- `PUT /recipes/{id}`: Update a recipe.
- `DELETE /recipes/{id}`: Delete a recipe.

## Docker

To run with Docker Compose:

```bash
docker-compose up --build
```

This will start the backend and PostgreSQL database.

## Testing

Run tests with:

```bash
pytest
```

## Notes

- CORS is enabled for all origins (for development).
- Database tables are created automatically on startup.
- Pagination for GET /recipes uses `skip` and `limit` query parameters.