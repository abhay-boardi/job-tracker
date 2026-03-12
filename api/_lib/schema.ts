export interface Job {
  id: number;
  externalId: string | null;
  title: string;
  company: string;
  companyLinkedinUrl: string | null;
  location: string | null;
  description: string | null;
  salary: string | null;
  jobType: string | null;
  experienceLevel: string | null;
  source: string;
  sourceUrl: string | null;
  applyUrl: string | null;
  postedAt: string | null;
  status: string;
  enrichmentStatus: string | null;
  companyDescription: string | null;
  companySize: string | null;
  companyIndustry: string | null;
  companyWebsite: string | null;
  companyFounded: string | null;
  aiSummary: string | null;
  aiMatchScore: number | null;
  aiKeySkills: string | null;
  aiSalaryEstimate: string | null;
  tags: string | null;
  notes: string | null;
  createdAt: string;
}

export interface InsertJob {
  externalId: string | null;
  title: string;
  company: string;
  companyLinkedinUrl: string | null;
  location: string | null;
  description: string | null;
  salary: string | null;
  jobType: string | null;
  experienceLevel: string | null;
  source: string;
  sourceUrl: string | null;
  applyUrl: string | null;
  postedAt: string | null;
  status: string;
  enrichmentStatus: string | null;
  companyDescription: string | null;
  companySize: string | null;
  companyIndustry: string | null;
  companyWebsite: string | null;
  companyFounded: string | null;
  aiSummary: string | null;
  aiMatchScore: number | null;
  aiKeySkills: string | null;
  aiSalaryEstimate: string | null;
  tags: string | null;
  notes: string | null;
  createdAt: string;
}

export interface ScrapeRun {
  id: number;
  source: string;
  query: string;
  location: string | null;
  status: string;
  jobsFound: number | null;
  jobsNew: number | null;
  triggerRunId: string | null;
  error: string | null;
  startedAt: string;
  completedAt: string | null;
}

export interface InsertScrapeRun {
  source: string;
  query: string;
  location: string | null;
  status: string;
  jobsFound: number | null;
  jobsNew: number | null;
  triggerRunId: string | null;
  error: string | null;
  startedAt: string;
  completedAt: string | null;
}

export interface User {
  id: string;
  username: string;
  password: string;
}

export interface InsertUser {
  username: string;
  password: string;
}
