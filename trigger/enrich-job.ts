import { task } from "@trigger.dev/sdk/v3";

// Trigger.dev v3 task definition for job enrichment pipeline
// This task:
// 1. Fetches company data via Proxycurl (if LinkedIn URL available)
// 2. Analyzes the job with GPT-4o mini
// 3. Updates the job record with enrichment data

export const enrichJob = task({
  id: "enrich-job",
  maxDuration: 120, // 2 minutes max
  retry: {
    maxAttempts: 2,
    factor: 2,
    minTimeoutInMs: 2000,
    maxTimeoutInMs: 30000,
  },
  run: async (payload: {
    jobId: number;
    title: string;
    company: string;
    description: string;
    location?: string;
    companyLinkedinUrl?: string;
  }) => {
    const { jobId, title, company, description, location, companyLinkedinUrl } = payload;

    let companyData: any = null;

    // Step 1: Fetch company data from Proxycurl (if LinkedIn URL available)
    if (companyLinkedinUrl) {
      const proxycurlKey = process.env.PROXYCURL_API_KEY;
      if (proxycurlKey) {
        try {
          const companyRes = await fetch(
            `https://nubela.co/proxycurl/api/linkedin/company?url=${encodeURIComponent(companyLinkedinUrl)}`,
            { headers: { Authorization: `Bearer ${proxycurlKey}` } },
          );
          if (companyRes.ok) {
            companyData = await companyRes.json();
          }
        } catch (e) {
          console.warn("Proxycurl fetch failed, continuing without company data");
        }
      }
    }

    // Step 2: Analyze with OpenAI GPT-4o mini
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) throw new Error("OPENAI_API_KEY not configured");

    const analysisRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a job analysis assistant. Analyze the job posting and return a JSON object with:
1. "summary": A concise 2-3 sentence summary
2. "keySkills": Array of 5-8 key skills required
3. "salaryEstimate": Estimated salary range
4. "matchScore": A score from 0-100 based on typical Indian tech professional profile
Return ONLY valid JSON.`,
          },
          {
            role: "user",
            content: `Title: ${title}\nCompany: ${company}\nLocation: ${location || "N/A"}\nDescription: ${description}\n${companyData ? `Company Info: ${JSON.stringify(companyData)}` : ""}`,
          },
        ],
        temperature: 0.3,
      }),
    });

    if (!analysisRes.ok) throw new Error(`OpenAI request failed: ${analysisRes.statusText}`);

    const analysisData = await analysisRes.json();
    const analysis = JSON.parse(analysisData.choices[0].message.content);

    // Step 3: Return enrichment data for storage update
    return {
      jobId,
      enrichmentStatus: "completed",
      companyDescription: companyData?.description || null,
      companySize: companyData?.company_size
        ? `${companyData.company_size[0]}-${companyData.company_size[1]} employees`
        : null,
      companyIndustry: companyData?.industry || null,
      companyWebsite: companyData?.website || null,
      companyFounded: companyData?.founded_year?.toString() || null,
      aiSummary: analysis.summary,
      aiMatchScore: analysis.matchScore,
      aiKeySkills: JSON.stringify(analysis.keySkills),
      aiSalaryEstimate: analysis.salaryEstimate,
    };
  },
});
