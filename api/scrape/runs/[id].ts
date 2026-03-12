import { MemStorage } from "../../_lib/storage";

const storage = new MemStorage();

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

  try {
    const id = parseInt(req.query.id as string);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid run ID" });

    const run = await storage.getScrapeRun(id);
    if (!run) return res.status(404).json({ message: "Run not found" });
    res.json(run);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}
