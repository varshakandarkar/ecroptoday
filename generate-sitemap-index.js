import fs from 'fs';
import path from 'path';

// Aapka domain name
const domain = 'https://ecroptoday.co.in';

// Function to update sitemap index
function updateSitemapIndex() {
  const publicDir = path.join(process.cwd(), 'public');
  const sitemapPath = path.join(publicDir, 'sitemap.xml');
  const sitemapIndexPath = path.join(publicDir, 'sitemap_index.xml');

  // Ensure public directory exists
  if (!fs.existsSync(publicDir)) {
    console.log('📁 "public" directory nahi mili, creating...');
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Check agar sitemap.xml exist nahi karta to warn kare
  if (!fs.existsSync(sitemapPath)) {
    console.error('sitemap.xml file nahi mili. Sitemap index update nahi ho sakta.');
    return;
  }

  // Fetch latest modified date of sitemap.xml
  const stats = fs.statSync(sitemapPath);
  const lastModified = new Date(stats.mtime).toISOString(); // Last modified time

  // Generate sitemap index content
  const sitemapIndexContent = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${domain}/sitemap.xml</loc>
    <lastmod>${lastModified}</lastmod>
  </sitemap>
</sitemapindex>`;

  try {
    // Overwrite sitemap_index.xml with updated date
    fs.writeFileSync(sitemapIndexPath, sitemapIndexContent, 'utf8');
    console.log('Sitemap index successfully updated:', sitemapIndexPath);
  } catch (error) {
    console.error('Error updating sitemap index:', error);
  }
}

// Call function
updateSitemapIndex();
