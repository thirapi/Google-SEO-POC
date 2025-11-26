// src/app/seo/route.ts
import { type NextRequest } from 'next/server'

// Function to get the base URL from the request
function getBaseUrl(req: NextRequest): string {
    const host = req.headers.get('host');
    if (!host) {
        return 'http://localhost:9003';
    }
    const protocol = host.startsWith('localhost') ? 'http' : 'https';
    return `${protocol}://${host}`;
}

export async function GET(request: NextRequest) {
  const { pathname } = request.nextUrl; // ✅ gunakan pathname asli
  const baseUrl = getBaseUrl(request);

  console.log('[SEO ROUTE] pathname:', pathname);

  // Sitemap
  if (pathname === '/sitemap.xml') {
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
    const robotsContent = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
`;
    return new Response(robotsContent, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  // Google Site Verification
  const googleMatch = pathname.match(/^\/google([a-zA-Z0-9_-]+)\.html$/);
  if (googleMatch) { 
    const fileName = pathname.slice(1); // ambil nama file
    const htmlContent = `<html><head><title></title></head><body>google-site-verification: ${fileName}</body></html>`;
    return new Response(htmlContent, {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    });
  }

  // Default: 404
  return new Response('Not Found from seo', { status: 404 });
}
