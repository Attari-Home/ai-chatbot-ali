import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SitemapService {
  constructor() { }

  generateSitemap(): string {
    const baseUrl = 'https://alirobotics.edu';
    const currentDate = new Date().toISOString().split('T')[0];
    
    const staticPages = [
      { url: '', priority: '1.0', changefreq: 'daily' },
      { url: '/about', priority: '0.9', changefreq: 'monthly' },
      { url: '/team', priority: '0.8', changefreq: 'weekly' },
      { url: '/projects', priority: '0.8', changefreq: 'weekly' },
      { url: '/news', priority: '0.7', changefreq: 'daily' },
      { url: '/events', priority: '0.7', changefreq: 'weekly' },
      { url: '/sponsors', priority: '0.6', changefreq: 'monthly' },
      { url: '/contact', priority: '0.6', changefreq: 'monthly' },
      { url: '/privacy', priority: '0.3', changefreq: 'yearly' },
      { url: '/support', priority: '0.5', changefreq: 'monthly' }
    ];

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    staticPages.forEach(page => {
      sitemap += `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    });

    sitemap += `
</urlset>`;

    return sitemap;
  }

  generateDynamicSitemap(newsArticles: any[], projects: any[], events: any[]): string {
    const baseUrl = 'https://alirobotics.edu';
    const currentDate = new Date().toISOString().split('T')[0];
    
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Add news articles
    newsArticles?.forEach(article => {
      const lastmod = article.updatedDate ? 
        new Date(article.updatedDate).toISOString().split('T')[0] : currentDate;

      sitemap += `
  <url>
    <loc>${baseUrl}/news/${article.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
    });

    // Add projects
    projects?.forEach(project => {
      sitemap += `
  <url>
    <loc>${baseUrl}/projects/${project.id}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    // Add events
    events?.forEach(event => {
      const eventDate = event.startDate ? 
        new Date(event.startDate).toISOString().split('T')[0] : currentDate;

      sitemap += `
  <url>
    <loc>${baseUrl}/events/${event.id}</loc>
    <lastmod>${eventDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
    });

    sitemap += `
</urlset>`;

    return sitemap;
  }

  generateRobotsTxt(): string {
    const baseUrl = 'https://alirobotics.edu';
    
    return `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/sitemap-dynamic.xml

# Crawl-delay for educational content
Crawl-delay: 1

# Disallow admin and private areas
Disallow: /admin/
Disallow: /private/
Disallow: /_internal/
Disallow: /api/auth/

# Allow important directories
Allow: /assets/
Allow: /images/
Allow: /docs/

# Cache policy for bots
Cache-directive: max-age=3600`;
  }
}