// Apify LinkedIn Jobs Scraper client
// Actor: bebity/linkedin-jobs-scraper
// Docs: https://apify.com/bebity/linkedin-jobs-scraper

const APIFY_BASE = "https://api.apify.com/v2";

export interface ApifyLinkedInJob {
  title: string;
  companyName: string;
  companyUrl: string;
  location: string;
  description: string;
  salary?: string;
  applicationsCount?: string;
  postedAt?: string;
  link: string;
  jobType?: string;
  experienceLevel?: string;
}

export interface ScrapeLinkedInParams {
  query: string;
  location: string;
  limit: number;
}

export async function startLinkedInScrape(params: ScrapeLinkedInParams): Promise<string> {
  const token = process.env.APIFY_TOKEN;
  if (!token) throw new Error("APIFY_TOKEN is not configured");

  const res = await fetch(`${APIFY_BASE}/acts/bebity~linkedin-jobs-scraper/runs`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      searchQueries: [
        {
          keyword: params.query,
          location: params.location,
          maxResults: params.limit,
        },
      ],
    }),
  });

  if (!res.ok) throw new Error(`Apify start failed: ${res.statusText}`);
  const data = await res.json();
  return data.data.id as string;
}

export async function getLinkedInResults(runId: string): Promise<ApifyLinkedInJob[]> {
  const token = process.env.APIFY_TOKEN;
  if (!token) throw new Error("APIFY_TOKEN is not configured");

  const res = await fetch(`${APIFY_BASE}/actor-runs/${runId}/dataset/items`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error(`Apify results fetch failed: ${res.statusText}`);
  return (await res.json()) as ApifyLinkedInJob[];
}

export function normalizeLinkedInJob(raw: ApifyLinkedInJob) {
  return {
    externalId: `linkedin-${Buffer.from(raw.title + raw.companyName).toString("base64").slice(0, 32)}`,
    title: raw.title,
    company: raw.companyName,
    companyLinkedinUrl: raw.companyUrl || null,
    location: raw.location || null,
    description: raw.description || null,
    salary: raw.salary || null,
    jobType: raw.jobType || null,
    experienceLevel: raw.experienceLevel || null,
    source: "linkedin" as const,
    sourceUrl: raw.link || null,
    applyUrl: raw.link || null,
    postedAt: raw.postedAt || null,
    status: "new" as const,
    enrichmentStatus: "pending" as const,
    createdAt: new Date().toISOString(),
  };
}
