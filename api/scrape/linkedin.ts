import type { VercelRequest, VercelResponse } from "@vercel/node";
import { MemStorage } from "../_lib/storage";

const storage = new MemStorage();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  try {
    const { query, location, limit } = req.body;
    if (!query) return res.status(400).json({ message: "Query is required" });

    const run = await storage.createScrapeRun({
      source: "linkedin",
      query,
      location: location || null,
      status: "running",
      jobsFound: 0,
      jobsNew: 0,
      triggerRunId: `run_${Date.now().toString(36)}`,
      error: null,
      startedAt: new Date().toISOString(),
      completedAt: null,
    });

    // Synchronous mock — create jobs and complete run immediately
    const found = Math.floor(Math.random() * 10) + 5;
    const newJobs = Math.floor(found * 0.7);

    for (let i = 0; i < Math.min(newJobs, 3); i++) {
      await storage.createJob({
        externalId: `li-sim-${Date.now()}-${i}`,
        title: `${query} Role ${i + 1}`,
        company: ["TechCorp", "InnovateTech", "DataDriven"][i % 3],
        companyLinkedinUrl: null,
        location: location || "India",
        description: `Exciting ${query} opportunity. We are looking for talented professionals to join our team.`,
        salary: null,
        jobType: "full-time",
        experienceLevel: "mid",
        source: "linkedin",
        sourceUrl: `https://linkedin.com/jobs/sim-${Date.now()}-${i}`,
        applyUrl: `https://linkedin.com/jobs/sim-${Date.now()}-${i}/apply`,
        postedAt: new Date().toISOString(),
        status: "new",
        enrichmentStatus: "pending",
        companyDescription: null,
        companySize: null,
        companyIndustry: null,
        companyWebsite: null,
        companyFounded: null,
        aiSummary: null,
        aiMatchScore: null,
        aiKeySkills: null,
        aiSalaryEstimate: null,
        tags: null,
        notes: null,
        createdAt: new Date().toISOString(),
      });
    }

    await storage.updateScrapeRun(run.id, {
      status: "completed",
      jobsFound: found,
      jobsNew: newJobs,
      completedAt: new Date().toISOString(),
    });

    res.json({ message: "LinkedIn scrape completed", runId: run.id });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}
