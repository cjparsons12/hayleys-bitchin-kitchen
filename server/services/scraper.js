import metascraper from 'metascraper';
import metascraperDescription from 'metascraper-description';
import metascraperImage from 'metascraper-image';
import metascraperTitle from 'metascraper-title';
import got from 'got';
import logger from './logger.js';

const scraper = metascraper([
  metascraperDescription(),
  metascraperImage(),
  metascraperTitle()
]);

const FALLBACK_IMAGE = 'https://placehold.co/400x300/FF6B6B/FFFFFF?text=Recipe&font=quicksand';
const TIMEOUT = 10000; // 10 seconds
const USER_AGENT = 'Mozilla/5.0 (compatible; HayleysBitchinKitchen/1.0)';

export const scrapeRecipeMetadata = async (url) => {
  try {
    logger.info('Scraping URL', { url });
    
    // Fetch the HTML with timeout and user agent
    const { body: html } = await got(url, {
      timeout: { request: TIMEOUT },
      headers: { 'user-agent': USER_AGENT },
      followRedirect: true,
      maxRedirects: 3
    });
    
    // Extract metadata
    const metadata = await scraper({ html, url });
    
    // Extract site name from URL
    const urlObj = new URL(url);
    const siteName = urlObj.hostname.replace('www.', '');
    
    // Apply fallbacks
    const result = {
      url,
      title: metadata.title || `${siteName} Recipe`,
      description: metadata.description || `View this delicious recipe from ${siteName}`,
      image_url: metadata.image || FALLBACK_IMAGE,
      site_name: siteName
    };
    
    logger.info('Successfully scraped metadata', { url, title: result.title });
    
    return result;
    
  } catch (error) {
    logger.error('Scraping failed', { url, error: error.message });
    
    // Extract site name for fallback
    let siteName = '';
    try {
      const urlObj = new URL(url);
      siteName = urlObj.hostname.replace('www.', '');
    } catch {
      siteName = 'unknown';
    }
    
    // Return fallback values
    return {
      url,
      title: `${siteName} Recipe`,
      description: `View this delicious recipe from ${siteName}`,
      image_url: FALLBACK_IMAGE,
      site_name: siteName
    };
  }
};
