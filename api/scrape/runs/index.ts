import { MemStorage } from "../../_lib/storage";

const storage = new MemStorage();

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

  try {
    const runs = await storage.getScrapeRuns();
    res.json(runs);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}
