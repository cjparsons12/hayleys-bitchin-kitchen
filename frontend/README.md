# Hayley's Bitchin' Kitchen - Frontend

This is the Vue.js frontend for Hayley's Bitchin' Kitchen, a recipe tracking app.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```
   The app will be available at http://localhost:3000

3. For production build:
   ```bash
   npm run build
   npm run preview
   ```

## Project Structure

- `src/`
  - `components/` - Reusable Vue components
    - `RecipeCard.vue` - Individual recipe preview
    - `RecipeForm.vue` - Form for adding recipes
    - `RecipeList.vue` - List of recipe cards
  - `views/` - Page components
    - `Home.vue` - Home page with recipe list
    - `AddRecipe.vue` - Add recipe page
    - `RecipeDetail.vue` - Single recipe detail view
  - `router/` - Vue Router configuration
  - `App.vue` - Main app component
  - `main.js` - App entry point

## API Integration

The frontend integrates with the FastAPI backend at `http://localhost:8000`. Make sure the backend is running before using the frontend.

## Docker

To build and run with Docker:

```bash
docker build -t hbk-frontend .
docker run -p 80:80 hbk-frontend
```

For development with Docker Compose, see the root docker-compose.yml file.