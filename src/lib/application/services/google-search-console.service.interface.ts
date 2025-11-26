// src/lib/application/services/google-search-console.service.interface.ts

export interface IGoogleSearchConsoleService {
  registerDomain(siteUrl: string): Promise<void>;
  submitSitemap(siteUrl: string): Promise<void>;
  getSeoData(siteUrl: string, startDate: string, endDate: string): Promise<any>;
}
