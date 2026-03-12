// Serper Google Jobs API client
// Docs: https://serper.dev/

export interface SerperJob {
  title: string;
  companyName: string;
  location: string;
  via: string;
  description: string;
  extensions: string[];
  detectedExtensions: {
    posted_at?: string;
    schedule_type?: string;
    work_from_home?: boolean;
    salary?: string;
  };
  link: string;
  applyLink?: string;
}

export interface ScrapeGoogleParams {
  query: string;
  location: string;
  country?: string;
}

export async function searchGoogleJobs(params: ScrapeGoogleParams): Promise<SerperJob[]> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) throw new Error("SERPER_API_KEY is not configured");

  const res = await fetch("https://google.serper.dev/jobs", {
    method: "POST",
    headers: {
      "X-API-KEY": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      q: params.query,
      location: params.location,
      gl: params.country || "in",
      num: 20,
    }),
  });

  if (!res.ok) throw new Error(`Serper search failed: ${res.statusText}`);
  const data = await res.json();
  return (data.jobs || []) as SerperJob[];
}

export function normalizeGoogleJob(raw: SerperJob) {
  return {
    externalId: `google-${Buffer.from(raw.title + raw.companyName).toString("base64").slice(0, 32)}`,
    title: raw.title,
    company: raw.companyName,
    companyLinkedinUrl: null,
    location: raw.location || null,
    description: raw.description || null,
    salary: raw.detectedExtensions?.salary || null,
    jobType: raw.detectedExtensions?.schedule_type || null,
    experienceLevel: null,
    source: "google_jobs" as const,
    sourceUrl: raw.link || null,
    applyUrl: raw.applyLink || raw.link || null,
    postedAt: raw.detectedExtensions?.posted_at || null,
    status: "new" as const,
    enrichmentStatus: "pending" as const,
    createdAt: new Date().toISOString(),
  };
}
