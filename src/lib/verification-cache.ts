// src/lib/verification-cache.ts

interface VerificationToken {
  fileName: string;
  fileContent: string;
}

// A simple in-memory cache for the verification token.
// This works in serverless environments for short-lived data.
let tokenCache: VerificationToken | null = null;

export const verificationCache = {
  set: (token: VerificationToken): void => {
    console.log('[Cache] Setting token:', token.fileName);
    tokenCache = token;
  },
  get: (): VerificationToken | null => {
    console.log('[Cache] Getting token:', tokenCache?.fileName ?? 'null');
    return tokenCache;
  },
  clear: (): void => {
    console.log('[Cache] Clearing token');
    tokenCache = null;
  },
};
