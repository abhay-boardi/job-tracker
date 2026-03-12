// OpenAI GPT-4o mini Enrichment client

export interface JobAnalysis {
  summary: string;
  keySkills: string[];
  salaryEstimate: string;
  matchScore: number;
}

export async function analyzeJob(params: {
  title: string;
  company: string;
  description: string;
  location?: string;
  companyInfo?: string;
}): Promise<JobAnalysis> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a job analysis assistant. Analyze the job posting and return a JSON object with:
1. "summary": A concise 2-3 sentence summary of the role
2. "keySkills": Array of 5-8 key skills required
3. "salaryEstimate": Estimated salary range (e.g., "₹15L - ₹25L" or "$120K - $160K")
4. "matchScore": A score from 0-100 based on typical Indian tech professional profile

Return ONLY valid JSON, no other text.`,
        },
        {
          role: "user",
          content: `Title: ${params.title}\nCompany: ${params.company}\nLocation: ${params.location || "Not specified"}\nDescription: ${params.description}\n${params.companyInfo ? `Company Info: ${params.companyInfo}` : ""}`,
        },
      ],
      temperature: 0.3,
    }),
  });

  if (!res.ok) throw new Error(`OpenAI request failed: ${res.statusText}`);

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || "{}";
  return JSON.parse(content) as JobAnalysis;
}
