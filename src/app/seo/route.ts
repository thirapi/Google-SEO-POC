// src/app/seo/route.ts
import { type NextRequest } from 'next/server';
import { verificationCache } from '@/lib/verification-cache';

// Function to get the base URL from the request
function getBaseUrl(req: NextRequest): string {
    const host = req.headers.get('host');
    // Use NEXT_PUBLIC_SITE_URL as the primary source if available
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || (host ? `${host.startsWith('localhost') ? 'http' : 'https'}://${host}` : 'http://localhost:9003');
    return baseUrl;
}

export async function GET(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const baseUrl = getBaseUrl(request);

  // Sitemap
  if (pathname === '/sitemap.xml') {
    // In a real app, you would fetch these from a CMS or generate them
    const staticUrls = ['', '/about', '/services', '/contact'];

    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticUrls.map((path) => `
  <url>
    <loc>${baseUrl}${path}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
</urlset>`;

    return new Response(sitemapContent.trim(), {
      status: 200,
      headers: { 'Content-Type': 'application/xml' },
    });
  }

  // Robots
  if (pathname === '/robots.txt') {
    const robotsContent = `User-agent: *\nAllow: /\n\nSitemap: ${baseUrl}/sitemap.xml\n`;
    return new Response(robotsContent, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  // Google Site Verification
  const googleMatch = pathname.match(/^\/google([a-zA-Z0-9_-]+)\.html$/);
  if (googleMatch) {
    const fileName = pathname.slice(1);
    const cachedToken = verificationCache.get();

    // Check if the request is for the dynamically generated token
    if (cachedToken && cachedToken.fileName === fileName) {
      console.log(`[SEO Route] Serving cached verification file: ${fileName}`);
      return new Response(cachedToken.fileContent, {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // Fallback for the demo link on the homepage
    console.log(`[SEO Route] Serving fallback verification file: ${fileName}`);
    const htmlContent = `<html><head><title></title></head><body>google-site-verification: ${fileName}</body></html>`;
    return new Response(htmlContent, {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    });
  }

  // Default: 404
  return new Response('Not Found from seo', { status: 404 });
}
