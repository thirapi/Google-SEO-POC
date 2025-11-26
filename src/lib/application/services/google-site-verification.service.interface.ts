// src/lib/application/services/google-site-verification.service.interface.ts

export interface IGoogleSiteVerificationService {
  requestVerificationToken(siteUrl: string): Promise<{ fileName: string; fileContent: string }>;
  confirmVerification(siteUrl: string): Promise<boolean>;
}
