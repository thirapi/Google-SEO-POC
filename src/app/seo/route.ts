// src/app/seo/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { domainVerificationTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Function to get the base URL from the request
function getBaseUrl(req: NextRequest): string {
  const host = req.headers.get("host");
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || (host ? `${host.startsWith("localhost") ? "http" : "https"}://${host}` : "http://localhost:9003");
  return baseUrl;
}

export async function GET(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const baseUrl = getBaseUrl(request);

  // Sitemap
  if (pathname === "/sitemap.xml") {
    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>
</urlset>`;
    return new NextResponse(sitemapContent, {
      headers: { "Content-Type": "application/xml" },
    });
  }

  // Robots
  if (pathname === "/robots.txt") {
    const robotsContent = `User-agent: *\nAllow: /\n\nSitemap: ${baseUrl}/sitemap.xml`;
    return new NextResponse(robotsContent, {
      headers: { "Content-Type": "text/plain" },
    });
  }

  // Google Site Verification from Database
  const googleMatch = pathname.match(/^\/google([a-zA-Z0-9_-]+)\.html$/);
  if (googleMatch) {
    const token = googleMatch[1]; // Extract token from the URL
    
    if (!token) {
      return new NextResponse("Invalid token in filename", { status: 400 });
    }

    try {
      const verificationRecord = await db.query.domainVerificationTable.findFirst({
        where: eq(domainVerificationTable.token, token),
        orderBy: (table, { desc }) => desc(table.created_at), // Get the latest one
      });

      if (verificationRecord) {
        return new NextResponse(verificationRecord.content, {
          headers: { "Content-Type": "text/html" },
        });
      }
    } catch (error) {
      console.error("[SEO Route] Database query failed:", error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }

    // Fallback for the demo link on the homepage if not found in DB
    if (pathname === "/google123abc.html") {
      return new NextResponse("google-site-verification: google123abc.html", {
        headers: { "Content-Type": "text/html" },
      });
    }
    
    console.warn(`[SEO Route] Verification file not found for token: ${token}`);
    return new NextResponse("Not Found", { status: 404 });
  }

  // Default: 404 Not Found
  return new NextResponse("Not Found from seo", { status: 404 });
}
