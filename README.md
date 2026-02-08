# Hayley's Bitchin Kitchen 🍳

A simple, mobile-friendly recipe link aggregator blog where you can share and discover delicious recipes from around the web.

## Features

- 📱 **Mobile-First Design** - Beautiful, responsive interface that works on all devices
- 🔗 **Automatic Metadata Scraping** - Paste a recipe URL and automatically extract title, image, and description
- 🔐 **Simple Admin Panel** - Password-protected admin interface for managing recipes
- ⚡ **Fast & Lightweight** - Built with Vue 3 and Express for optimal performance
- 🐳 **Docker Ready** - Easy deployment with Docker and Docker Compose
- 💰 **Cost-Effective** - Runs on AWS Lightsail for ~$3.50-$5/month

## Tech Stack

- **Frontend:** Vue 3, Vue Router, Vite
- **Backend:** Node.js, Express
- **Database:** SQLite (file-based, no separate DB server needed)
- **Scraping:** Metascraper (Open Graph metadata extraction)
- **Authentication:** JWT (JSON Web Tokens)
- **Deployment:** Docker, Docker Compose

## Prerequisites

- Node.js 18+ (for local development)
- Docker and Docker Compose (for containerized deployment)

## Local Development Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd hayleys-bitchin-kitchen
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create environment file

```bash
cp .env.example .env
```

Edit `.env` and set your admin password:

```env
ADMIN_PASSWORD=your-secure-password-here
```

### 4. Start development servers

```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:3000`
- Frontend dev server on `http://localhost:5173`

### 5. Access the application

- **Public Feed:** http://localhost:5173
- **Admin Panel:** http://localhost:5173/admin

## Docker Deployment

### Local Docker Testing

```bash
# Create .env file with your password
echo "ADMIN_PASSWORD=your-secure-password" > .env

# Build and start containers
docker compose up -d --build

# View logs
docker compose logs -f

# Stop containers
docker compose down
```

Access the application at `http://localhost:3000`

### Production Deployment (AWS Lightsail)

See [deployment/lightsail-setup.md](deployment/lightsail-setup.md) for detailed instructions on deploying to AWS Lightsail.

Quick overview:

1. Create a Lightsail instance (Ubuntu 22.04, $3.50-5/month plan)
2. Install Docker and Docker Compose
3. Clone your repository
4. Create `.env` file with production settings
5. Run `docker compose up -d --build`
6. Configure domain and HTTPS (optional but recommended)

## Project Structure

```
hayleys-bitchin-kitchen/
├── server/                     # Backend (Node.js/Express)
│   ├── index.js               # Server entry point
│   ├── routes/                # API routes
│   │   ├── recipes.js         # Public recipe endpoints
│   │   └── admin.js           # Admin endpoints
│   ├── services/              # Business logic
│   │   ├── database.js        # SQLite operations
│   │   ├── scraper.js         # Recipe metadata scraping
│   │   ├── auth.js            # JWT authentication
│   │   └── logger.js          # Winston logger
│   └── middleware/            # Express middleware
│       └── verifyToken.js     # JWT verification
├── src/                       # Frontend (Vue 3)
│   ├── views/                 # Page components
│   │   ├── Home.vue           # Recipe feed page
│   │   └── Admin.vue          # Admin panel
│   ├── components/            # Reusable components
│   │   ├── Header.vue         # Site header
│   │   ├── RecipeCard.vue     # Individual recipe card
│   │   └── AdminAuth.vue      # Login form
│   ├── App.vue                # Root component
│   ├── main.js                # Vue app entry
│   └── style.css              # Global styles
├── docs/                      # Documentation
│   └── hayleys-bitchin-kitchen-spec.md
├── deployment/                # Deployment guides
│   └── lightsail-setup.md
├── Dockerfile                 # Docker image definition
├── docker-compose.yml         # Docker Compose configuration
├── vite.config.js             # Vite configuration
├── package.json               # Dependencies and scripts
└── README.md                  # This file
```

## API Endpoints

### Public Endpoints

- `GET /api/recipes` - Get all recipes (newest first)

### Admin Endpoints

- `POST /api/admin/auth` - Authenticate and receive JWT token
- `POST /api/admin/recipes` - Add new recipe (requires auth)
- `DELETE /api/admin/recipes/:id` - Delete recipe (requires auth)

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ADMIN_PASSWORD` | Yes | - | Admin panel password (also used as JWT secret) |
| `PORT` | No | 3000 | Server port |
| `NODE_ENV` | No | development | Environment (development/production) |
| `DATABASE_PATH` | No | ./data/database.sqlite | SQLite database file path |
| `LOG_LEVEL` | No | info | Logging level (debug/info/warn/error) |
| `CORS_ORIGIN` | No | * | CORS allowed origin |
| `RATE_LIMIT_ADMIN` | No | 10 | Admin requests per minute |
| `RATE_LIMIT_PUBLIC` | No | 60 | Public requests per minute |

## Database Backup

### Automated Backups (Production)

Add to crontab on your Lightsail instance:

```bash
# Daily backup at 2 AM
0 2 * * * docker exec hbk-app sqlite3 /app/data/database.sqlite ".backup /app/backups/backup-$(date +\%Y\%m\%d).sqlite"

# Delete backups older than 7 days
0 3 * * * find ~/hayleys-bitchin-kitchen/backups -name "backup-*.sqlite" -mtime +7 -delete
```

### Manual Backup

```bash
# From host machine
cp ./data/database.sqlite ./backups/backup-$(date +%Y%m%d).sqlite

# From Docker container
docker exec hbk-app sqlite3 /app/data/database.sqlite ".backup /app/backups/backup-manual.sqlite"
```

### Restore from Backup

```bash
# Stop containers
docker compose down

# Replace database
cp ./backups/backup-20260204.sqlite ./data/database.sqlite

# Restart
docker compose up -d
```

## Troubleshooting

### Recipe scraping fails

- Some websites block scraping or have non-standard metadata
- The app will use fallback values (placeholder image, domain name as title)
- Check server logs for specific errors: `docker compose logs -f`

### Images not loading

- The app includes an error handler that shows a placeholder image
- Some recipe sites use dynamic image loading that may not work with Open Graph scraping

### "Invalid or expired token" error

- JWT tokens expire after 30 days
- To revoke all tokens, change `ADMIN_PASSWORD` in `.env` and restart
- Users will need to log in again

### Port already in use

```bash
# Change PORT in .env file or docker-compose.yml
PORT=3001
```

## Scripts

- `npm run dev` - Start both frontend and backend in dev mode
- `npm run dev:server` - Start backend server only (with hot reload)
- `npm run dev:client` - Start Vite dev server only
- `npm run build` - Build frontend for production
- `npm start` - Start production server (serves built frontend)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues or questions, please open an issue on GitHub.

## Acknowledgments

- Recipe scraping powered by [Metascraper](https://github.com/microlinkhq/metascraper)
- Icons and fonts from Google Fonts
- Color palette inspired by warm kitchen aesthetics

---

**Built with ❤️ for recipe lovers everywhere!**
