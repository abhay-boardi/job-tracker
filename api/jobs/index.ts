import { MemStorage } from "../_lib/storage";

const storage = new MemStorage();

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

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
}
