# Hayley's Bitchin Kitchen - Project Specification

**Project Type:** Recipe Link Aggregator Blog  
**Target Platform:** AWS Lightsail  
**Last Updated:** February 4, 2026

---

## Executive Summary

A simple, mobile-friendly blog website where authorized users can post recipe links. The site automatically scrapes recipe metadata (image, title, description) and displays them in a clean feed format. Features minimal admin functionality with shared password authentication.

---

## Tech Stack Recommendation

### **Recommended Stack:**
- **Frontend:** Vue 3 with Vite
- **Backend:** Node.js with Express
- **Database:** SQLite (file-based, no separate DB server needed)
- **Scraping:** Metascraper or similar Open Graph scraping library
- **Containerization:** Docker with Docker Compose
- **Hosting:** AWS Lightsail (Docker on Ubuntu instance)
- **Cost:** ~$3.50-$5/month

**Why Node.js instead of Python?**
- Easier deployment to Lightsail
- Better Vue.js ecosystem integration
- Metascraper handles recipe site scraping excellently
- Can serve both frontend and backend from single process
- SQLite eliminates need for separate database server

### Alternative (Your Original Preference):
- Frontend: Vue 3
- Backend: Python Flask
- Database: SQLite
- Scraping: Beautiful Soup + requests
- Cost: Same ~$3.50-$5/month

---

## Core Features

### 1. Public Recipe Feed (Home Page)
**Path:** `/`

**Requirements:**
- Display all posted recipes in reverse chronological order (newest first)
- Mobile-responsive grid/card layout
- Each recipe card shows:
  - Recipe image (scraped from link)
  - Recipe title (scraped from link)
  - Short description/excerpt (scraped from link)
  - Source domain (e.g., "allrecipes.com")
  - Date posted
- Click card to open original recipe link in new tab
- Clean, modern, fun design with warm colors
- No pagination needed initially (load all recipes)

**UI/UX Guidelines:**
- Card-based layout (2 columns on mobile, 3-4 on desktop)
- Smooth hover effects on cards
- Hero banner with site title: "Hayley's Bitchin Kitchen"
- Tagline: "Recipes worth sharing" (or similar fun text)
- Color scheme: Warm tones (coral, cream, soft orange, mint green accents)
- Readable fonts (e.g., Inter for body, Playfair Display for headings)

### 2. Admin Page
**Path:** `/admin`

**Requirements:**
- Protected by simple password authentication
- Single shared password stored as environment variable
- Simple form with:
  - Recipe URL input field
  - Submit button
  - Loading indicator while scraping
- After submission:
  - Show success message with preview
  - Clear form for next entry
  - Option to "View Feed" button
- List of recent posts (last 10) with delete option
- No user accounts, no sessions (password check on each action)

**Authentication:**
- Password prompt on page load
- Store auth state in session storage (expires on tab close)
- Password: environment variable `ADMIN_PASSWORD`

### 3. Link Scraping
**Requirements:**
- Automatically extract on URL submission:
  - Open Graph image (`og:image`)
  - Title (`og:title` or `<title>`)
  - Description (`og:description` or meta description)
  - Site name/domain
- Handle scraping failures gracefully:
  - Use placeholder image if no image found
  - Use domain name as title if scraping fails
  - Store URL regardless of scraping success
- Scraping timeout: 10 seconds max
- User-Agent: Set proper user agent to avoid blocks

---

## Data Model

### Recipe Table (SQLite)

```sql
CREATE TABLE recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL,
    title TEXT,
    description TEXT,
    image_url TEXT,
    site_name TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Field Details:**
- `id`: Auto-incrementing primary key
- `url`: Original recipe URL (required)
- `title`: Scraped title (nullable)
- `description`: Scraped description (nullable)
- `image_url`: Scraped image URL (nullable)
- `site_name`: Extracted domain name (nullable)
- `created_at`: Timestamp of post

---

## API Endpoints

### Public Endpoints

**GET `/api/recipes`**
- Returns all recipes ordered by `created_at DESC`
- Response:
  ```json
  {
    "recipes": [
      {
        "id": 1,
        "url": "https://example.com/recipe",
        "title": "Amazing Pasta",
        "description": "Delicious homemade pasta...",
        "image_url": "https://example.com/image.jpg",
        "site_name": "example.com",
        "created_at": "2026-02-04T10:30:00Z"
      }
    ]
  }
  ```

### Admin Endpoints

**POST `/api/admin/auth`**
- Request body: `{ "password": "secret123" }`
- Returns: `{ "success": true }` or `{ "error": "Invalid password" }`

**POST `/api/admin/recipes`**
- Headers: `Authorization: Bearer <password>`
- Request body: `{ "url": "https://recipe-url.com" }`
- Process:
  1. Validate password
  2. Scrape URL metadata
  3. Save to database
  4. Return saved recipe object
- Response: Same as recipe object above

**DELETE `/api/admin/recipes/:id`**
- Headers: `Authorization: Bearer <password>`
- Deletes recipe by ID
- Response: `{ "success": true }`

---

## Frontend Structure

### Pages/Components

```
src/
├── App.vue (main layout)
├── views/
│   ├── Home.vue (recipe feed)
│   └── Admin.vue (admin panel)
├── components/
│   ├── RecipeCard.vue (individual recipe card)
│   ├── Header.vue (site header)
│   └── AdminAuth.vue (password prompt)
└── router/
    └── index.js (Vue Router config)
```

### Routing
- `/` - Home feed (public)
- `/admin` - Admin panel (password protected)

---

## Backend Structure (Node.js)

```
server/
├── index.js (Express app entry)
├── routes/
│   ├── recipes.js (public API)
│   └── admin.js (admin API)
├── services/
│   ├── scraper.js (URL metadata scraping)
│   └── database.js (SQLite operations)
├── middleware/
│   └── auth.js (password verification)
└── database.sqlite (SQLite file, persisted via Docker volume)
```

---

## Deployment Plan (AWS Lightsail)

### Docker on Lightsail Instance (Recommended)
**Cost:** $3.50/month (512 MB plan) or $5/month (1 GB plan) for better performance

**Overview:**
Deploy using Docker Compose on a Lightsail Ubuntu instance. This provides the best balance of cost, simplicity, and maintainability.

**Prerequisites:**
- Docker and Docker Compose installed on Lightsail instance
- Git for code deployment

**Deployment Steps:**

1. **Create Lightsail Instance**
   - Choose Ubuntu 22.04 LTS
   - Select $3.50/month (512 MB) or $5/month (1 GB) plan
   - Open firewall ports: 80 (HTTP) and 443 (HTTPS)

2. **Install Docker & Docker Compose**
   ```bash
   # SSH into instance
   sudo apt update
   sudo apt install -y docker.io docker-compose git
   sudo usermod -aG docker ubuntu
   ```

3. **Deploy Application**
   ```bash
   # Clone repository
   git clone <your-repo-url> /home/ubuntu/hayleys-kitchen
   cd /home/ubuntu/hayleys-kitchen
   
   # Create .env file
   echo "ADMIN_PASSWORD=your-secure-password" > .env
   echo "NODE_ENV=production" >> .env
   
   # Build and start containers
   docker-compose up -d --build
   ```

4. **Configure HTTPS (Optional but Recommended)**
   - Use Caddy (included in docker-compose) for automatic HTTPS
   - Or manually configure Let's Encrypt with Certbot

5. **Set Up Auto-restart**
   ```bash
   # Ensure containers restart on reboot
   docker update --restart=unless-stopped $(docker ps -q)
   ```

**Pros:**
- Cost-effective ($3.50-5/month)
- Clean deployment with Docker
- Easy updates (rebuild image, restart)
- Consistent dev/prod environments
- Simple backup (just copy SQLite file)
- No complex server configuration needed

**Cons:**
- Initial Docker setup required
- Manual HTTPS setup (unless using Caddy)

**Updates & Maintenance:**
```bash
# Pull latest code
cd /home/ubuntu/hayleys-kitchen
git pull

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

---

## Environment Variables

```bash
# Required
ADMIN_PASSWORD=your-secure-password-here

# Optional
PORT=3000
NODE_ENV=production
DATABASE_PATH=./database.sqlite
```

---

## Design Specifications

### Color Palette
- Primary: `#FF6B6B` (coral red)
- Secondary: `#FFA07A` (light salmon)
- Accent: `#98D8C8` (mint green)
- Background: `#FFF9F5` (warm white)
- Text: `#2D3748` (dark gray)
- Card background: `#FFFFFF`

### Typography
- Headings: `'Quicksand', sans-serif` (fun, rounded)
- Body: `'Inter', sans-serif` (clean, readable)

### Spacing & Layout
- Max content width: 1200px
- Card gap: 24px
- Border radius: 12px (rounded corners)
- Box shadows: Subtle, soft shadows

### Mobile Breakpoints
- Mobile: < 768px (1 column)
- Tablet: 768px - 1024px (2 columns)
- Desktop: > 1024px (3-4 columns)

---

## Implementation Phases

### Phase 1: MVP (Minimum Viable Product)
- [ ] Set up Node.js + Express backend
- [ ] Implement SQLite database
- [ ] Create URL scraping service
- [ ] Build admin API endpoints
- [ ] Build public recipe API
- [ ] Create Vue 3 frontend structure
- [ ] Implement recipe feed page
- [ ] Implement admin page with auth
- [ ] Basic styling and mobile responsiveness
- [ ] Create Dockerfile and docker-compose.yml
- [ ] Local Docker testing

### Phase 2: Deployment
- [ ] Create Lightsail instance (Ubuntu 22.04)
- [ ] Install Docker and Docker Compose
- [ ] Deploy application via Docker Compose
- [ ] Configure environment variables
- [ ] Set up HTTPS with Caddy or Certbot
- [ ] Set up domain (optional)
- [ ] Test production environment
- [ ] Verify auto-restart on reboot

### Phase 3: Polish
- [ ] Refine UI/animations
- [ ] Add loading states
- [ ] Error handling improvements
- [ ] Performance optimization
- [ ] Final mobile testing

---

## Scraping Fallbacks

When scraping fails, use these fallbacks:
- **No image:** Use placeholder image (food-themed stock photo or solid color with icon)
- **No title:** Use URL domain + "Recipe"
- **No description:** Use "View this delicious recipe from [domain]"
- **Timeout/Error:** Store URL anyway with minimal data

---

## Security Considerations

1. **Password Storage:** Never commit password to git (use `.env` file)
2. **SQL Injection:** Use parameterized queries
3. **XSS:** Sanitize displayed content
4. **Rate Limiting:** Add rate limiting to admin endpoints (10 requests/minute)
5. **CORS:** Configure appropriate CORS headers
6. **HTTPS:** Use HTTPS in production (Let's Encrypt on Lightsail)

---

## Testing Requirements

### Manual Testing Checklist
- [ ] Post recipe from popular sites (AllRecipes, Food Network, NYT Cooking)
- [ ] Post recipe from personal blogs
- [ ] Test with invalid URLs
- [ ] Test with non-recipe URLs
- [ ] Verify mobile responsiveness (iOS & Android)
- [ ] Test admin password protection
- [ ] Test delete functionality
- [ ] Verify recipes display correctly
- [ ] Test with slow internet connection
- [ ] Test with 50+ recipes (performance)

---

## Future Enhancements (Not in MVP)

- Recipe categories/tags
- Search functionality
- User comments
- Recipe ratings
- Social sharing buttons
- RSS feed
- Individual user accounts
- Recipe editing
- Bulk import
- Image optimization/CDN

---

## Success Criteria

1. **Functional:** Users can view feed of posted recipes
2. **Functional:** Admin can post new recipe links
3. **Functional:** Scraping works for 80%+ of common recipe sites
4. **Performance:** Page loads in < 3 seconds on mobile
5. **Responsive:** Works well on phones, tablets, and desktop
6. **Reliable:** 99%+ uptime on Lightsail
7. **Cost:** Monthly hosting cost ≤ $5

---

## File Deliverables

The implementation should include:

```
hayleys-bitchin-kitchen/
├── README.md (setup instructions)
├── Dockerfile (Docker image configuration)
├── docker-compose.yml (Docker Compose setup)
├── .env.example (environment variables template)
├── .gitignore
├── package.json
├── server/ (backend code)
├── src/ (Vue frontend code)
├── public/ (static assets)
└── deployment/
    └── lightsail-setup.md (detailed deployment guide)
```

---

## Notes for Implementation Agent

- Prioritize simplicity over features
- Mobile-first design approach
- Use established libraries (don't reinvent scraping)
- Include detailed README with local development and Docker setup steps
- Provide comprehensive deployment guide for Docker on Lightsail
- Create production-ready Dockerfile (multi-stage build for optimization)
- Use docker-compose for easy local development and deployment
- Include volume mapping for SQLite database persistence
- Test with real recipe URLs during development
- Handle edge cases gracefully (broken images, scraping failures)
- Keep dependencies minimal
- Optimize for Lightsail's resource constraints (512 MB - 1 GB RAM)

---

## Questions to Confirm Before Starting

✅ Single shared password authentication (no user accounts)  
✅ No search, categories, or user interaction in MVP  
✅ Automatic scraping only (no manual override)  
✅ Deploy to AWS Lightsail (~$3.50-5/month)  
✅ Mobile-friendly, modern, fun design  
✅ Newest recipes first in feed  

---

**Ready for development!** This spec provides complete requirements for an agent to build the project.