// src/components/ui/seo-dashboard.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertTriangle, Info } from "lucide-react";

interface SeoData {
  rows?: {
    keys: string[];
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }[];
}

export function SeoDashboard() {
  const [seoData, setSeoData] = useState<SeoData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const siteUrl = window.location.origin;
        const endDate = new Date().toISOString().split("T")[0];
        const startDate = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split("T")[0];

        const res = await fetch("/api/seo/dashboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ siteUrl, startDate, endDate }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to fetch SEO data");
        }

        const data: SeoData = await res.json();
        setSeoData(data);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin mb-2" />
          <p>Loading SEO Data...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-40 text-destructive">
          <AlertTriangle className="w-8 h-8 mb-2" />
          <p className="font-semibold">An Error Occurred</p>
          <p className="text-sm text-center">{error}</p>
        </div>
      );
    }

    if (seoData && seoData.rows && seoData.rows.length > 0) {
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-left table-auto">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-3">Query</th>
                <th className="p-3 text-right">Clicks</th>
                <th className="p-3 text-right">Impressions</th>
                <th className="p-3 text-right">CTR (%)</th>
                <th className="p-3 text-right">Position</th>
              </tr>
            </thead>
            <tbody>
              {seoData.rows.map((row, index) => (
                <tr key={index} className="border-b border-border/50">
                  <td className="p-3 font-medium">{row.keys ? row.keys.join(", ") : 'N/A'}</td>
                  <td className="p-3 text-right">{row.clicks}</td>
                  <td className="p-3 text-right">{row.impressions}</td>
                  <td className="p-3 text-right">{(row.ctr * 100).toFixed(2)}</td>
                  <td className="p-3 text-right">{row.position.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
        <Info className="w-8 h-8 mb-2" />
        <p className="font-semibold">No Data Available</p>
        <p className="text-sm text-center">Google has not reported any search data for this site in the last 30 days. This is common for new sites.</p>
      </div>
    );
  };

  return (
    <Card className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-border/50">
      <CardHeader>
        <CardTitle className="text-xl font-headline text-primary">SEO Performance (Last 30 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}
