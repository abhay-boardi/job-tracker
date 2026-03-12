import { task } from "@trigger.dev/sdk/v3";

// Trigger.dev v3 task definition for Google Jobs scraping via Serper API
// This task calls the Serper API, normalizes results, and stores them

export const scrapeGoogleJobs = task({
  id: "scrape-google-jobs",
  maxDuration: 60, // 1 minute max (Serper is fast)
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 10000,
  },
  run: async (payload: { query: string; location: string; country?: string; runId: number }) => {
    const { query, location, country, runId } = payload;

    // Step 1: Call Serper Google Jobs API
    const apiKey = process.env.SERPER_API_KEY;
    if (!apiKey) throw new Error("SERPER_API_KEY not configured");

    const res = await fetch("https://google.serper.dev/jobs", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: query,
        location,
        gl: country || "in",
        num: 20,
      }),
    });

    if (!res.ok) throw new Error(`Serper API failed: ${res.statusText}`);
    const data = await res.json();
    const rawJobs = data.jobs || [];

    // Step 2: Normalize results
    const normalizedJobs = rawJobs.map((raw: any) => ({
      externalId: `google-${Buffer.from(raw.title + raw.companyName).toString("base64").slice(0, 32)}`,
      title: raw.title,
      company: raw.companyName,
      companyLinkedinUrl: null,
      location: raw.location || null,
      description: raw.description || null,
      salary: raw.detectedExtensions?.salary || null,
      jobType: raw.detectedExtensions?.schedule_type || null,
      experienceLevel: null,
      source: "google_jobs",
      sourceUrl: raw.link || null,
      applyUrl: raw.applyLink || raw.link || null,
      postedAt: raw.detectedExtensions?.posted_at || null,
      status: "new",
      enrichmentStatus: "pending",
      createdAt: new Date().toISOString(),
    }));

    return {
      runId,
      jobsFound: normalizedJobs.length,
      jobs: normalizedJobs,
    };
  },
});
