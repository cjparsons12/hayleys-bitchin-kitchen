# Open Graph Meta Tags - Testing Guide

## Overview

Open Graph meta tags have been implemented to enable rich social media previews when your recipe links are shared on Instagram, Facebook, Twitter, and other platforms.

## What Was Implemented

### Server-Side Meta Tag Injection

The server now dynamically injects appropriate Open Graph tags based on the route:

- **Recipe pages** (`/recipe/[slug]`): Shows recipe-specific title, description, and image
- **Other pages** (home, admin): Shows default site-wide meta tags

### Meta Tags Included

For each recipe page, the following tags are injected:
- `og:title` - Recipe title
- `og:description` - Recipe description
- `og:image` - Recipe image URL
- `og:url` - Full recipe URL on your site
- `og:type` - Set to "website"
- `og:site_name` - "Hayley's Bitchin Kitchen"
- `twitter:card` - Set to "summary_large_image"
- Twitter-specific tags (title, description, image, URL)

## Configuration Required

### Environment Variable

Add the `DOMAIN` variable to your `.env` file:

```bash
# Production
DOMAIN=yourdomain.com

# Development
DOMAIN=localhost
```

This is already configured in `.env.production` but make sure it matches your actual domain.

## Testing Locally with Docker

If you're running with Docker Compose (which you already have), the meta tags are already working:

```bash
# If not already running
docker-compose up -d
```

Open a recipe page and **view the page source** (right-click → "View Page Source", NOT DevTools):

```
http://localhost:3000/recipe/some-recipe-slug
```

Look for meta tags in the `<head>` section that look like:

```html
<meta property="og:title" content="Recipe Name - Hayley's Bitchin Kitchen" />
<meta property="og:description" content="Recipe description here..." />
<meta property="og:image" content="https://example.com/image.jpg" />
```

**Important:** Use "View Page Source" not DevTools Elements. Social media crawlers see the raw HTML source, not the JavaScript-rendered DOM.

## Testing on Production

### 1. Deploy Your Changes

```bash
git add .
git commit -m "Add Open Graph meta tags for social sharing"
git push origin main
```

If you have GitHub Actions set up, deployment happens automatically. Otherwise, deploy manually:

```bash
cd ~/hayleys-bitchin-kitchen
git pull origin main
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
```

### 2. Verify Meta Tags in Production

Visit your recipe page and view page source:
```
https://yourdomain.com/recipe/some-recipe-slug
```

### 3. Test with Social Media Debuggers

#### Facebook Sharing Debugger
1. Go to: https://developers.facebook.com/tools/debug/
2. Enter your recipe URL: `https://yourdomain.com/recipe/some-recipe-slug`
3. Click "Debug"
4. You should see:
   - Recipe title
   - Recipe description
   - Recipe image preview
   - All Open Graph tags detected

If it shows old cached data, click "Scrape Again"

#### Twitter Card Validator
1. Go to: https://cards-dev.twitter.com/validator
2. Enter your recipe URL
3. Click "Preview card"
4. You should see the recipe preview with image

#### LinkedIn Post Inspector
1. Go to: https://www.linkedin.com/post-inspector/
2. Enter your recipe URL
3. View the preview

## Testing the Share on Instagram

Instagram doesn't have a public debugger, but you can test:

1. Share a recipe link in an Instagram DM to yourself or a friend
2. Instagram should automatically generate a preview with the recipe image and title
3. When posted to stories/feed, the link preview card should show the recipe info

## Troubleshooting

### Meta tags not appearing in page source

**Problem**: Page source shows generic "Hayley's Bitchin Kitchen" title with no Open Graph tags

**Solution**:
- Make sure you're checking "View Page Source" not DevTools Elements tab
- If using Docker: Ensure containers are running with `docker-compose ps`
- Check server logs: `docker-compose logs -f app`
- Verify you have at least one recipe in the database with a valid slug

### Image not showing in preview

**Problem**: Social media shows recipe title but no image

**Solutions**:
- Verify the image URL is publicly accessible (not localhost)
- Check that the image URL uses `https://` (not `http://`)
- Image should be at least 600x315 pixels (1200x630 recommended)
- Image must be less than 8MB
- Use Facebook Debugger to see specific image errors

### Old preview showing when sharing

**Problem**: Social media shows old cached preview

**Solution**:
- Use Facebook Sharing Debugger and click "Scrape Again"
- Social media platforms cache Open Graph data for 7-30 days
- Each platform has its own cache invalidation tool

### Domain shows as "localhost" in URLs

**Problem**: URLs in meta tags show `http://localhost/recipe/...`

**Solution**:
- Update `DOMAIN=yourdomain.com` in your production `.env` file
- Restart: `docker-compose -f docker-compose.prod.yml restart app`

### Seeing tags in DevTools but not View Source

**Difference explained:**
- **DevTools Elements tab** = Live DOM after JavaScript runs (what you see in browser)
- **View Page Source** = Raw HTML from server before JavaScript (what social crawlers see)

Social media crawlers (Instagram, Facebook, Twitter) don't run JavaScript - they only read View Page Source. The meta tags MUST appear in View Page Source to work for social sharing.

## How It Works

1. **Server startup**: In production mode, `server/index.js` reads and caches the built `dist/index.html` file
2. **Request received**: When a user (or social crawler bot) requests a URL
3. **Route detection**: Server checks if the path matches `/recipe/[slug]`
4. **Recipe lookup**: If it's a recipe route, fetch recipe data from the database
5. **Meta tag generation**: Generate Open Graph tags using recipe data
6. **HTML injection**: Inject the meta tags into the cached HTML template before `</head>`
7. **Response**: Send the modified HTML to the client/bot

The social media crawlers see the fully-populated meta tags immediately since they're in the initial HTML response (not added by JavaScript).

## Files Modified

- `server/index.js` - Added meta tag injection logic
- `.env.example` - Added `DOMAIN` variable documentation

## Next Steps

1. ✅ Add recipes to your site
2. ✅ Test sharing a recipe URL on Instagram
3. ✅ Test on Facebook/Twitter using their debugger tools
4. ✅ Optionally: Create a custom Open Graph image for your site (1200x630px)
5. ✅ Replace placeholder image URL with your custom image in `generateMetaTags()` function

## Resources

- [Open Graph Protocol](https://ogp.me/) - Official specification
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
