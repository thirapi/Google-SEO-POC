// src/app/api/seo/dashboard/route.ts
import { NextResponse } from "next/server";
import { GoogleSearchConsoleService } from "@/lib/service/google-search-console.service";

export async function POST(request: Request) {
  try {
    const { siteUrl, startDate, endDate } = await request.json();

    if (!siteUrl || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const gscService = new GoogleSearchConsoleService();
    const seoData = await gscService.getSeoData(siteUrl, startDate, endDate);

    console.log("SEO Data Response:", JSON.stringify(seoData, null, 2)); // Added for debugging

    return NextResponse.json(seoData);
  } catch (error: any) {
    console.error("Error in SEO dashboard API:", error); // Added for debugging
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
