import { task } from "@trigger.dev/sdk/v3";

// Trigger.dev v3 task definition for LinkedIn job scraping
// This task orchestrates the full LinkedIn scraping pipeline:
// 1. Call Apify to start the LinkedIn scraper actor
// 2. Poll for results until the run completes
// 3. Normalize and deduplicate results
// 4. Store new jobs in the database
// 5. Return a summary of results

export const scrapeLinkedInJobs = task({
  id: "scrape-linkedin-jobs",
  maxDuration: 300, // 5 minutes max
  retry: {
    maxAttempts: 2,
    factor: 2,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 10000,
  },
  run: async (payload: { query: string; location: string; limit: number; runId: number }) => {
    const { query, location, limit, runId } = payload;

    // Step 1: Start the Apify LinkedIn scraper
    const APIFY_BASE = "https://api.apify.com/v2";
    const token = process.env.APIFY_TOKEN;
    if (!token) throw new Error("APIFY_TOKEN not configured");

    const startRes = await fetch(`${APIFY_BASE}/acts/bebity~linkedin-jobs-scraper/runs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        searchQueries: [{ keyword: query, location, maxResults: limit }],
      }),
    });

    if (!startRes.ok) throw new Error(`Failed to start Apify run: ${startRes.statusText}`);
    const runData = await startRes.json();
    const apifyRunId = runData.data.id;

    // Step 2: Poll for completion (Apify runs can take minutes)
    let status = "RUNNING";
    while (status === "RUNNING" || status === "READY") {
      await new Promise((r) => setTimeout(r, 5000));
      const statusRes = await fetch(`${APIFY_BASE}/actor-runs/${apifyRunId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const statusData = await statusRes.json();
      status = statusData.data.status;
    }

    if (status !== "SUCCEEDED") {
      throw new Error(`Apify run failed with status: ${status}`);
    }

    // Step 3: Fetch results
    const resultsRes = await fetch(`${APIFY_BASE}/actor-runs/${apifyRunId}/dataset/items`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const rawJobs = await resultsRes.json();

    // Step 4: Normalize and store (would call storage layer here)
    const normalizedJobs = rawJobs.map((raw: any) => ({
      externalId: `linkedin-${Buffer.from(raw.title + raw.companyName).toString("base64").slice(0, 32)}`,
      title: raw.title,
      company: raw.companyName,
      companyLinkedinUrl: raw.companyUrl || null,
      location: raw.location || null,
      description: raw.description || null,
      salary: raw.salary || null,
      jobType: raw.jobType || null,
      experienceLevel: raw.experienceLevel || null,
      source: "linkedin",
      sourceUrl: raw.link || null,
      applyUrl: raw.link || null,
      postedAt: raw.postedAt || null,
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
