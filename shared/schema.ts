import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Jobs table
export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  externalId: text("external_id").unique(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  companyLinkedinUrl: text("company_linkedin_url"),
  location: text("location"),
  description: text("description"),
  salary: text("salary"),
  jobType: text("job_type"),
  experienceLevel: text("experience_level"),
  source: text("source").notNull(),
  sourceUrl: text("source_url"),
  applyUrl: text("apply_url"),
  postedAt: text("posted_at"),
  status: text("status").notNull().default("new"),
  enrichmentStatus: text("enrichment_status").default("pending"),
  companyDescription: text("company_description"),
  companySize: text("company_size"),
  companyIndustry: text("company_industry"),
  companyWebsite: text("company_website"),
  companyFounded: text("company_founded"),
  aiSummary: text("ai_summary"),
  aiMatchScore: integer("ai_match_score"),
  aiKeySkills: text("ai_key_skills"),
  aiSalaryEstimate: text("ai_salary_estimate"),
  tags: text("tags"),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
});

export const insertJobSchema = createInsertSchema(jobs).omit({ id: true });
export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;

// Scrape runs table
export const scrapeRuns = pgTable("scrape_runs", {
  id: serial("id").primaryKey(),
  source: text("source").notNull(),
  query: text("query").notNull(),
  location: text("location"),
  status: text("status").notNull().default("pending"),
  jobsFound: integer("jobs_found").default(0),
  jobsNew: integer("jobs_new").default(0),
  triggerRunId: text("trigger_run_id"),
  error: text("error"),
  startedAt: text("started_at").notNull(),
  completedAt: text("completed_at"),
});

export const insertScrapeRunSchema = createInsertSchema(scrapeRuns).omit({ id: true });
export type ScrapeRun = typeof scrapeRuns.$inferSelect;
export type InsertScrapeRun = z.infer<typeof insertScrapeRunSchema>;
