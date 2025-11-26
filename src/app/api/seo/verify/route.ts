
// src/app/api/seo/verify/route.ts
import { NextResponse } from "next/server";
import { GoogleSiteVerificationService } from "@/lib/service/google-site-verification.service";
import { GoogleSearchConsoleService } from "@/lib/service/google-search-console.service";
import { db } from "@/lib/db"; // Import Drizzle client
import { domainVerificationTable } from "@/lib/db/schema"; // Import table schema
import { URL } from "url";

// Initialize services
const googleVerificationService = new GoogleSiteVerificationService();
const googleSearchConsoleService = new GoogleSearchConsoleService();

/**
 * API route to orchestrate the entire site verification and registration process.
 */
export async function POST() {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!siteUrl) {
        return NextResponse.json(
            { error: "NEXT_PUBLIC_SITE_URL is not set." },
            { status: 500 }
        );
    }

    try {
        const urlObject = new URL(siteUrl);
        const domain = urlObject.hostname;
        // 1. Request a verification token from Google
        console.log(`[API] Step 1: Requesting verification token for ${siteUrl}`);
        const verification =
            await googleVerificationService.requestVerificationToken(
                siteUrl
            );

        const fileName = verification.fileContent;
        console.log(`[API] Token received. Filename: ${fileName}`);

        if (!verification) {
            throw new Error("Verification token is undefined");
        }

        const token = verification.fileContent.replace(/\.html$/, "");

        await db.insert(domainVerificationTable).values({
            domain,
            token,
            content: `google-site-verification: ${verification.fileContent}`,
            is_verified: false,
            created_at: new Date(),
            verified_at: null,
        });

        console.log(`[API] Verification token for ${domain} stored in the database.`);

        // 3. Trigger Google to verify the site
        // Google will now fetch `/[fileName]` from our site.
        console.log("[API] Step 2: Triggering verification confirmation with Google.");
        await googleVerificationService.confirmVerification(siteUrl);
        console.log("[API] Verification confirmation triggered.");

        // Note: The flow continues even if confirmation throws an error,
        // as it can be asynchronous. We proceed to the next steps.

        // 4. Register the domain in Google Search Console
        try {
            console.log("[API] Step 3: Registering domain in Google Search Console.");
            await googleSearchConsoleService.registerDomain(siteUrl);
            console.log("[API] Domain registration successful.");
        } catch (gscError) {
            console.error("[API] GSC registration might have failed, but this is often non-critical (e.g., already registered). Continuing...", gscError);
        }

        // 5. Submit the sitemap
        try {
            console.log("[API] Step 4: Submitting sitemap.");
            await googleSearchConsoleService.submitSitemap(siteUrl);
            console.log("[API] Sitemap submission successful.");
        } catch (sitemapError) {
            console.error("[API] Sitemap submission might have failed, but can be retried.", sitemapError);
        }

        return NextResponse.json({
            message: "Verification process initiated successfully. Check Google Search Console for status.",
            verificationFile: fileName,
        });

    } catch (error) {
        console.error("[API] An error occurred during the verification process:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return NextResponse.json(
            { error: "Verification process failed.", details: errorMessage },
            { status: 500 }
        );
    }
}
