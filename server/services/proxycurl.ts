// Proxycurl Company Enrichment client
// Docs: https://nubela.co/proxycurl/

export interface CompanyProfile {
  name: string;
  description: string;
  industry: string;
  company_size: number[];
  website: string;
  founded_year: number;
  specialities: string[];
  tagline: string;
  headquarters: {
    city: string;
    country: string;
  };
}

export async function getCompanyProfile(linkedinUrl: string): Promise<CompanyProfile> {
  const apiKey = process.env.PROXYCURL_API_KEY;
  if (!apiKey) throw new Error("PROXYCURL_API_KEY is not configured");

  const res = await fetch(
    `https://nubela.co/proxycurl/api/linkedin/company?url=${encodeURIComponent(linkedinUrl)}`,
    {
      headers: { Authorization: `Bearer ${apiKey}` },
    }
  );

  if (!res.ok) throw new Error(`Proxycurl request failed: ${res.statusText}`);
  return (await res.json()) as CompanyProfile;
}

export function formatCompanySize(sizeRange?: number[]): string {
  if (!sizeRange || sizeRange.length < 2) return "Unknown";
  return `${sizeRange[0]}-${sizeRange[1]} employees`;
}
