import type { VercelRequest, VercelResponse } from "@vercel/node";
import { MemStorage } from "../../_lib/storage";

const storage = new MemStorage();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  try {
    const jobId = parseInt(req.query.id as string);
    if (isNaN(jobId)) return res.status(400).json({ message: "Invalid job ID" });

    const job = await storage.getJob(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

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

    res.json({ message: "Enrichment completed", jobId });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}
