import { MemStorage } from "../../_lib/storage";

const storage = new MemStorage();

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const id = parseInt(req.query.id as string);
  if (isNaN(id)) return res.status(400).json({ message: "Invalid job ID" });

  try {
    if (req.method === "GET") {
      const job = await storage.getJob(id);
      if (!job) return res.status(404).json({ message: "Job not found" });
      return res.json(job);
    }

    if (req.method === "PATCH") {
      const updated = await storage.updateJob(id, req.body);
      if (!updated) return res.status(404).json({ message: "Job not found" });
      return res.json(updated);
    }

    if (req.method === "DELETE") {
      const deleted = await storage.deleteJob(id);
      if (!deleted) return res.status(404).json({ message: "Job not found" });
      return res.json({ success: true });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}
