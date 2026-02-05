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
- **Authentication:** JWT (jsonwebtoken)
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
- On successful login, receive JWT token (30-day expiration)
- Store JWT in localStorage
- Include JWT in Authorization header for all admin requests
- Password: environment variable `ADMIN_PASSWORD`
- JWT secret: Uses `ADMIN_PASSWORD` as signing secret

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
- `url`: Original recipe URL (required, max 2048 chars)
- `title`: Scraped title (nullable, truncated to 200 chars)
- `description`: Scraped description (nullable, truncated to 500 chars)
- `image_url`: Scraped image URL (nullable, max 2048 chars)
- `site_name`: Extracted domain name (nullable, max 100 chars)
- `created_at`: Timestamp of post

**Validation Rules:**
- URL must start with `http://` or `https://`
- Duplicate URLs are allowed
- Title and description are automatically truncated if they exceed limits

---

## API Endpoints

### Standard Error Response Format

All API errors follow this structure:
```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE"
}
```

Common error codes:
- `INVALID_PASSWORD` - Authentication failed
- `INVALID_TOKEN` - JWT token invalid or expired
- `INVALID_URL` - URL format validation failed
- `SCRAPING_FAILED` - Could not scrape recipe metadata
- `NOT_FOUND` - Recipe not found
- `SERVER_ERROR` - Internal server error

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
- Validates password against `ADMIN_PASSWORD`
- Returns JWT token valid for 30 days
- Response (success):
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "30d"
  }
  ```
- Response (error): `{ "error": "Invalid password" }`

**POST `/api/admin/recipes`**
- Headers: `Authorization: Bearer <jwt_token>`
- Request body: `{ "url": "https://recipe-url.com" }`
- Process:
  1. Verify JWT token
  2. Validate URL format (must start with http:// or https://)
  3. Scrape URL metadata (10 second timeout)
  4. Truncate fields: title (200 chars), description (500 chars)
  5. Save to database
  6. Return saved recipe object
- Response: Same as recipe object above
- Errors:
  - (401): `{ "error": "Invalid or expired token", "code": "INVALID_TOKEN" }`
  - (400): `{ "error": "Invalid URL format", "code": "INVALID_URL" }`
  - (500): `{ "error": "Failed to scrape recipe", "code": "SCRAPING_FAILED" }`
- **Note:** Duplicate URLs are allowed (user may want to post same recipe twice)

**DELETE `/api/admin/recipes/:id`**
- Headers: `Authorization: Bearer <jwt_token>`
- Verifies JWT token
- Deletes recipe by ID
- Response: `{ "success": true }`
- Errors:
  - (401): `{ "error": "Invalid or expired token", "code": "INVALID_TOKEN" }`
  - (404): `{ "error": "Recipe not found", "code": "NOT_FOUND" }`

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
│   ├── database.js (SQLite operations)
│   └── auth.js (JWT generation and verification)
├── middleware/
│   └── verifyToken.js (JWT verification middleware)
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

**Docker Compose Configuration:**
```yaml
# docker-compose.yml example structure
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - ADMIN_PASSWORD=${ADMIN_PASSWORD}
      - NODE_ENV=production
    volumes:
      - ./data:/app/data          # SQLite database persistence
      - ./backups:/app/backups    # Backup directory
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/recipes"]
      interval: 30s
      timeout: 10s
      retries: 3
```

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
DATABASE_PATH=./data/database.sqlite
LOG_LEVEL=info                          # debug, info, warn, error
CORS_ORIGIN=https://your-domain.com     # Use * for all in dev (not recommended for prod)
RATE_LIMIT_ADMIN=10                     # Requests per minute for admin endpoints
RATE_LIMIT_PUBLIC=60                    # Requests per minute for public endpoints
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
- **No image:** `https://placehold.co/400x300/FF6B6B/FFFFFF?text=Recipe&font=quicksand`
- **No title:** Extract domain + " Recipe" (e.g., "allrecipes.com Recipe")
- **No description:** "View this delicious recipe from [domain]"
- **Timeout/Error:** Store URL anyway with fallback values
- **Invalid image URL:** Replace with placeholder on frontend if image fails to load

**Scraping Configuration:**
- Timeout: 10 seconds
- User-Agent: `Mozilla/5.0 (compatible; HayleysBitchinKitchen/1.0)`
- Follow redirects: Yes (max 3)
- Accept invalid SSL certificates: No

---

## Security Considerations

1. **Password Storage:** Never commit password to git (use `.env` file)
2. **JWT Authentication:**
   - Use ADMIN_PASSWORD as JWT signing secret
   - 30-day token expiration for balance of security/convenience
   - Tokens stored in localStorage (cleared on logout)
   - **HTTPS is mandatory** - prevents token/password interception
   - To revoke all tokens: change ADMIN_PASSWORD (forces re-login)
3. **SQL Injection:** Use parameterized queries (SQLite supports `?` placeholders)
4. **XSS:** Sanitize displayed content (especially recipe titles/descriptions)
5. **Rate Limiting:**
   - `/api/admin/*` endpoints: 10 requests per minute per IP
   - `/api/recipes` endpoint: 60 requests per minute per IP
   - Use `express-rate-limit` package
6. **CORS Configuration:**
   - Development: Allow `http://localhost:5173` (Vite dev server)
   - Production: Allow your domain only (e.g., `https://hayleys-kitchen.com`)
   - Credentials: Allow (needed for auth headers)
7. **HTTPS:** Use HTTPS in production (Let's Encrypt on Lightsail) - **REQUIRED for JWT security**
8. **Input Validation:** Validate and sanitize all user inputs (URLs, passwords)
9. **Error Messages:** Don't leak sensitive information in error messages

---

## Authentication Implementation Details

### JWT Token Generation (Login)
```javascript
const jwt = require('jsonwebtoken');

// On successful password validation
const token = jwt.sign(
  { admin: true },
  process.env.ADMIN_PASSWORD,
  { expiresIn: '30d' }
);
```

### JWT Token Verification (Protected Routes)
```javascript
const jwt = require('jsonwebtoken');

try {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
  const decoded = jwt.verify(token, process.env.ADMIN_PASSWORD);
  next(); // Valid token, proceed
} catch (error) {
  res.status(401).json({ error: 'Invalid or expired token' });
}
```

### Frontend Token Storage
```javascript
// After successful login
localStorage.setItem('adminToken', token);

// On admin API requests
headers: {
  'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
}

// On logout
localStorage.removeItem('adminToken');
```

---

## Logging & Monitoring

### Logging Requirements
- Use `winston` or `pino` for structured logging
- Log levels: ERROR, WARN, INFO, DEBUG
- Log to: Console (Docker captures this)

**What to log:**
- All admin actions (POST/DELETE recipes) with timestamp
- Authentication attempts (success/failure)
- Scraping errors with URL
- Server startup/shutdown
- Rate limit violations

**Log format:**
```json
{
  "timestamp": "2026-02-04T10:30:00Z",
  "level": "info",
  "action": "recipe_created",
  "url": "https://example.com/recipe",
  "ip": "192.168.1.1"
}
```

**Production:**
- View logs: `docker-compose logs -f`
- Rotate logs: Docker handles rotation (max 10 files, 10MB each)

### Monitoring
- Monitor disk space (SQLite database growth)
- Monitor container health (Docker healthcheck)
- Basic uptime monitoring (optional: UptimeRobot free tier)

---

## Backup & Maintenance

### Database Backup
**Automated daily backups:**
```bash
# Add to crontab on Lightsail instance
0 2 * * * docker exec hbk-backend sqlite3 /app/database.sqlite ".backup /app/backups/backup-$(date +\%Y\%m\%d).sqlite"

# Retain last 7 days
0 3 * * * find /home/ubuntu/hayleys-kitchen/backups -name "backup-*.sqlite" -mtime +7 -delete
```

**Manual backup:**
```bash
# From Lightsail instance
cp /home/ubuntu/hayleys-kitchen/data/database.sqlite ~/backup-$(date +%Y%m%d).sqlite

# Download to local machine
scp ubuntu@YOUR_IP:~/backup-*.sqlite ./
```

### Restore from Backup
```bash
# Stop containers
docker-compose down

# Replace database file
cp backup-20260204.sqlite /home/ubuntu/hayleys-kitchen/data/database.sqlite

# Restart
docker-compose up -d
```

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