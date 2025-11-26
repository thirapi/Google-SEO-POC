import { IGoogleSearchConsoleService } from "@/lib/application/services/google-search-console.service.interface";
import { JWT } from "google-auth-library";

export class GoogleSearchConsoleService implements IGoogleSearchConsoleService {
  private jwtClient: JWT;

  constructor() {
    const email = process.env.GOOGLE_SERVICE_CLIENT_EMAIL;
    const key = process.env.GOOGLE_SERVICE_PRIVATE_KEY?.replace(/\\n/g, "\n");
    const scopes = (process.env.GOOGLE_GSC_SCOPES ?? "https://www.googleapis.com/auth/webmasters")
      .split(" ")
      .filter(Boolean);

    if (!email || !key) {
      throw new Error("Missing Google Service Account credentials in env");
    }

    this.jwtClient = new JWT({ email, key, scopes });
  }

  private async getAccessToken(): Promise<string> {
    const tokenResponse = await this.jwtClient.authorize();
    if (!tokenResponse.access_token) {
      throw new Error("Failed to get access token for GSC");
    }
    return tokenResponse.access_token;
  }

  async registerDomain(siteUrl: string): Promise<void> {
    const accessToken = await this.getAccessToken();

    const res = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to register domain: ${res.status} ${text}`);
    }

    console.log(`Domain registered: ${siteUrl}`);
  }

  async submitSitemap(siteUrl: string, sitemapPath?: string): Promise<void> {
    const accessToken = await this.getAccessToken();
    const feedUrl = sitemapPath || `${siteUrl}/sitemap.xml`;

    const res = await fetch(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps/${encodeURIComponent(feedUrl)}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to submit sitemap: ${res.status} ${text}`);
    }

    console.log(`Sitemap submitted: ${feedUrl}`);
  }

  async getSeoData(siteUrl: string, startDate: string, endDate: string): Promise<any> {
    const accessToken = await this.getAccessToken();

    const res = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: ["query"],
        searchType: "web",
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to get SEO data: ${res.status} ${text}`);
    }

    return res.json();
  }
}