import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Dashboard stats
  app.get("/api/dashboard/stats", async (_req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // List jobs with filters
  app.get("/api/jobs", async (req, res) => {
    try {
      const { source, status, search, page, limit } = req.query;
      const result = await storage.getJobs({
        source: source as string | undefined,
        status: status as string | undefined,
        search: search as string | undefined,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 20,
      });
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get single job
  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const job = await storage.getJob(parseInt(req.params.id));
      if (!job) return res.status(404).json({ message: "Job not found" });
      res.json(job);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update job
  app.patch("/api/jobs/:id", async (req, res) => {
    try {
      const updated = await storage.updateJob(parseInt(req.params.id), req.body);
      if (!updated) return res.status(404).json({ message: "Job not found" });
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Delete job
  app.delete("/api/jobs/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteJob(parseInt(req.params.id));
      if (!deleted) return res.status(404).json({ message: "Job not found" });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Enrich a single job (simulated)
  app.post("/api/jobs/:id/enrich", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const job = await storage.getJob(jobId);
      if (!job) return res.status(404).json({ message: "Job not found" });

      await storage.updateJob(jobId, { enrichmentStatus: "enriching" });

      setTimeout(async () => {
        const mockSkills = ["JavaScript", "TypeScript", "React", "Node.js", "System Design", "API Development"];
        await storage.updateJob(jobId, {
          enrichmentStatus: "completed",
          companyDescription: `${job.company} is a leading technology company focused on building innovative products and services.`,
          companySize: "1,001-5,000 employees",
          companyIndustry: "Technology",
          companyWebsite: `https://${job.company.toLowerCase().replace(/\s+/g, "")}.com`,
          companyFounded: "2015",
          aiSummary: `This ${job.title} role at ${job.company} involves ${job.description?.slice(0, 100) || "building innovative products"}. The position offers competitive compensation and growth opportunities in ${job.location || "India"}.`,
          aiMatchScore: Math.floor(Math.random() * 30) + 65,
          aiKeySkills: JSON.stringify(mockSkills),
          aiSalaryEstimate: "\u20B920L - \u20B940L",
        });
      }, 2000);

      res.json({ message: "Enrichment started", jobId });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Trigger LinkedIn scrape (simulated)
  app.post("/api/scrape/linkedin", async (req, res) => {
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

      setTimeout(async () => {
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
      }, 3000);

      res.json({ message: "LinkedIn scrape started", runId: run.id });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Trigger Google Jobs scrape (simulated)
  app.post("/api/scrape/google", async (req, res) => {
    try {
      const { query, location, country } = req.body;
      if (!query) return res.status(400).json({ message: "Query is required" });

      const run = await storage.createScrapeRun({
        source: "google_jobs",
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

      setTimeout(async () => {
        const found = Math.floor(Math.random() * 15) + 5;
        const newJobs = Math.floor(found * 0.6);

        for (let i = 0; i < Math.min(newJobs, 3); i++) {
          await storage.createJob({
            externalId: `gj-sim-${Date.now()}-${i}`,
            title: `${query} Position ${i + 1}`,
            company: ["GlobalSoft", "NexGen Solutions", "CloudFirst"][i % 3],
            companyLinkedinUrl: null,
            location: location || "India",
            description: `A great ${query} position. Join a dynamic team building the future.`,
            salary: null,
            jobType: "full-time",
            experienceLevel: "mid",
            source: "google_jobs",
            sourceUrl: `https://google.com/jobs/sim-${Date.now()}-${i}`,
            applyUrl: `https://google.com/jobs/sim-${Date.now()}-${i}/apply`,
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
      }, 2000);

      res.json({ message: "Google Jobs scrape started", runId: run.id });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // List scrape runs
  app.get("/api/scrape/runs", async (_req, res) => {
    try {
      const runs = await storage.getScrapeRuns();
      res.json(runs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get single scrape run
  app.get("/api/scrape/runs/:id", async (req, res) => {
    try {
      const run = await storage.getScrapeRun(parseInt(req.params.id));
      if (!run) return res.status(404).json({ message: "Run not found" });
      res.json(run);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  return httpServer;
}
