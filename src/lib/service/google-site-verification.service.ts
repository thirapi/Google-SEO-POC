import { IGoogleSiteVerificationService } from "@/lib/application/services/google-site-verification.service.interface";
import { JWT } from "google-auth-library";

export class GoogleSiteVerificationService
  implements IGoogleSiteVerificationService {
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
      throw new Error("Failed to get access token for Site Verification");
    }
    return tokenResponse.access_token;
  }

  async requestVerificationToken(
    siteUrl: string
  ): Promise<{ fileName: string; fileContent: string }> {
    const accessToken = await this.getAccessToken();

    const res = await fetch(
      "https://www.googleapis.com/siteVerification/v1/token",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          site: { type: "SITE", identifier: siteUrl },
          verificationMethod: "FILE",
        }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(
        `Failed to request verification token: ${res.status} ${text}`
      );
    }

    const data = await res.json();
    return {
      fileName: data.fileName, // contoh: "google5f84cf98cef09ae3.html"
      fileContent: data.token, // contoh: "google-site-verification: google5f84cf98cef09ae3.html"
    };
  }

  async confirmVerification(siteUrl: string): Promise<boolean> {
    const accessToken = await this.getAccessToken();

    const res = await fetch(
      "https://www.googleapis.com/siteVerification/v1/webResource?verificationMethod=FILE",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          site: { type: "SITE", identifier: siteUrl },
        }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to confirm verification: ${res.status} ${text}`);
    }

    console.log(`Domain verified: ${siteUrl}`);
    return true;
  }
}
