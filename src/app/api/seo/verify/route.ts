import { NextResponse } from "next/server";
import { GoogleSiteVerificationService } from "@/lib/service/google-site-verification.service";
import { GoogleSearchConsoleService } from "@/lib/service/google-search-console.service";
import { verificationCache } from "@/lib/verification-cache";

export async function POST() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_SITE_URL is not set in environment variables." },
      { status: 500 }
    );
  }

  try {
    const verificationService = new GoogleSiteVerificationService();
    const searchConsoleService = new GoogleSearchConsoleService();

    // 1. Request a verification token from Google
    const token = await verificationService.requestVerificationToken(siteUrl);
    
    // 2. Store the token in the shared cache
    verificationCache.set(token);

    // 3. Confirm the verification with Google. Google's server will now fetch the file.
    await verificationService.confirmVerification(siteUrl);

    // 4. Register the domain in Google Search Console.
    await searchConsoleService.registerDomain(siteUrl);

    // 5. Submit the sitemap.
    await searchConsoleService.submitSitemap(siteUrl);

    // Clean up the cache after the process is complete
    verificationCache.clear();

    return NextResponse.json({
      success: true,
      message: "Site successfully verified, registered, and sitemap submitted.",
    });

  } catch (error: any) {
    // Clean up the cache in case of an error
    verificationCache.clear();
    console.error("Verification process failed:", error);
    return NextResponse.json(
      { error: `Verification process failed: ${error.message}` },
      { status: 500 }
    );
  }
}
