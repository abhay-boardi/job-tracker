import { type User, type InsertUser, type Job, type InsertJob, type ScrapeRun, type InsertScrapeRun } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Jobs
  getJobs(filters?: {
    source?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ jobs: Job[]; total: number }>;
  getJob(id: number): Promise<Job | undefined>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: number, updates: Partial<Job>): Promise<Job | undefined>;
  deleteJob(id: number): Promise<boolean>;

  // Scrape Runs
  getScrapeRuns(): Promise<ScrapeRun[]>;
  getScrapeRun(id: number): Promise<ScrapeRun | undefined>;
  createScrapeRun(run: InsertScrapeRun): Promise<ScrapeRun>;
  updateScrapeRun(id: number, updates: Partial<ScrapeRun>): Promise<ScrapeRun | undefined>;

  // Dashboard
  getDashboardStats(): Promise<{
    totalJobs: number;
    newJobs: number;
    enrichedJobs: number;
    sources: { source: string; count: number }[];
    statuses: { status: string; count: number }[];
    recentJobs: Job[];
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private jobsMap: Map<number, Job>;
  private runsMap: Map<number, ScrapeRun>;
  private nextJobId: number;
  private nextRunId: number;

  constructor() {
    this.users = new Map();
    this.jobsMap = new Map();
    this.runsMap = new Map();
    this.nextJobId = 1;
    this.nextRunId = 1;
    this.seedData();
  }

  private seedData() {
    const now = new Date();
    const today = now.toISOString();
    const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString();

    const seedJobs: InsertJob[] = [
      {
        externalId: "li-001",
        title: "Senior Product Manager - EdTech",
        company: "Byju's",
        companyLinkedinUrl: "https://linkedin.com/company/byjus",
        location: "Bangalore, India",
        description: "We're looking for a Senior Product Manager to lead our EdTech product strategy. You'll work with cross-functional teams to define product roadmap, conduct user research, and drive product launches. The ideal candidate has 5+ years in product management with experience in education technology.\n\nResponsibilities:\n- Define and execute product strategy for K-12 learning modules\n- Conduct user research and analyze product metrics\n- Collaborate with engineering, design, and content teams\n- Drive A/B testing and data-driven decision making\n- Present product roadmap to leadership",
        salary: "₹35L - ₹50L",
        jobType: "full-time",
        experienceLevel: "senior",
        source: "linkedin",
        sourceUrl: "https://linkedin.com/jobs/view/001",
        applyUrl: "https://linkedin.com/jobs/view/001/apply",
        postedAt: daysAgo(1),
        status: "new",
        enrichmentStatus: "completed",
        companyDescription: "Byju's is India's largest edtech company, offering learning programs for students from K-12 to competitive exams.",
        companySize: "10,001+ employees",
        companyIndustry: "Education Technology",
        companyWebsite: "https://byjus.com",
        companyFounded: "2011",
        aiSummary: "Senior PM role at India's largest edtech company focused on K-12 learning products. Strong emphasis on data-driven product decisions and cross-functional collaboration. Ideal for experienced PMs passionate about education.",
        aiMatchScore: 88,
        aiKeySkills: JSON.stringify(["Product Strategy", "User Research", "A/B Testing", "EdTech", "Agile", "Data Analytics", "Roadmap Planning"]),
        aiSalaryEstimate: "₹35L - ₹50L",
        tags: JSON.stringify(["edtech", "product", "bangalore"]),
        notes: "Great opportunity, strong culture fit",
        createdAt: daysAgo(1),
      },
      {
        externalId: "li-002",
        title: "Staff Software Engineer - Backend",
        company: "Razorpay",
        companyLinkedinUrl: "https://linkedin.com/company/razorpay",
        location: "Bangalore, India",
        description: "Join Razorpay's core payments team as a Staff Engineer. You'll architect and build highly scalable payment processing systems handling millions of transactions daily. We need someone who can lead technical design, mentor engineers, and drive engineering excellence.\n\nRequirements:\n- 8+ years of backend development experience\n- Expert in Go, Java, or Python\n- Strong understanding of distributed systems\n- Experience with payment/fintech systems\n- Track record of leading technical initiatives",
        salary: "₹50L - ₹80L",
        jobType: "full-time",
        experienceLevel: "senior",
        source: "linkedin",
        sourceUrl: "https://linkedin.com/jobs/view/002",
        applyUrl: "https://linkedin.com/jobs/view/002/apply",
        postedAt: daysAgo(2),
        status: "shortlisted",
        enrichmentStatus: "completed",
        companyDescription: "Razorpay is India's leading full-stack financial solutions company, powering payments for millions of businesses.",
        companySize: "3,001-5,000 employees",
        companyIndustry: "Financial Technology",
        companyWebsite: "https://razorpay.com",
        companyFounded: "2014",
        aiSummary: "High-impact staff engineer role at India's top fintech. Focus on scalable payment infrastructure processing millions of daily transactions. Requires deep distributed systems expertise.",
        aiMatchScore: 92,
        aiKeySkills: JSON.stringify(["Go", "Distributed Systems", "Payment Processing", "System Design", "Technical Leadership", "Microservices", "PostgreSQL"]),
        aiSalaryEstimate: "₹50L - ₹80L",
        tags: JSON.stringify(["fintech", "backend", "staff"]),
        notes: null,
        createdAt: daysAgo(2),
      },
      {
        externalId: "gj-001",
        title: "Frontend Engineer - React",
        company: "Flipkart",
        companyLinkedinUrl: "https://linkedin.com/company/flipkart",
        location: "Bangalore, India",
        description: "Flipkart is hiring a Frontend Engineer to build next-generation e-commerce experiences. You'll work on the customer-facing web app used by 400M+ users, focusing on performance, accessibility, and delightful UX.\n\nWhat you'll do:\n- Build responsive and performant web experiences\n- Optimize Core Web Vitals across product pages\n- Implement design system components\n- Collaborate with product and design teams",
        salary: "₹25L - ₹40L",
        jobType: "full-time",
        experienceLevel: "mid",
        source: "google_jobs",
        sourceUrl: "https://google.com/jobs/result/001",
        applyUrl: "https://flipkart.com/careers/frontend-engineer",
        postedAt: daysAgo(0),
        status: "new",
        enrichmentStatus: "completed",
        companyDescription: "Flipkart is India's leading e-commerce marketplace, serving over 400 million customers.",
        companySize: "10,001+ employees",
        companyIndustry: "E-Commerce",
        companyWebsite: "https://flipkart.com",
        companyFounded: "2007",
        aiSummary: "Frontend role at India's largest e-commerce platform. Focus on building performant React applications serving hundreds of millions of users. Great for mid-level engineers wanting massive scale.",
        aiMatchScore: 85,
        aiKeySkills: JSON.stringify(["React", "TypeScript", "Web Performance", "CSS", "Design Systems", "Core Web Vitals", "Accessibility"]),
        aiSalaryEstimate: "₹25L - ₹40L",
        tags: JSON.stringify(["frontend", "react", "ecommerce"]),
        notes: null,
        createdAt: daysAgo(0),
      },
      {
        externalId: "li-003",
        title: "Data Scientist - ML Platform",
        company: "Swiggy",
        companyLinkedinUrl: "https://linkedin.com/company/swiggy",
        location: "Bangalore, India",
        description: "Swiggy is looking for a Data Scientist to work on our ML platform team. You'll build and improve recommendation systems, demand prediction models, and delivery time estimations that power the Swiggy experience for millions.\n\nExpected skills:\n- Strong ML fundamentals (regression, classification, deep learning)\n- Python, SQL, Spark\n- Experience with recommendation systems\n- MLOps and model deployment experience",
        salary: "₹30L - ₹45L",
        jobType: "full-time",
        experienceLevel: "mid",
        source: "linkedin",
        sourceUrl: "https://linkedin.com/jobs/view/003",
        applyUrl: "https://linkedin.com/jobs/view/003/apply",
        postedAt: daysAgo(3),
        status: "reviewed",
        enrichmentStatus: "completed",
        companyDescription: "Swiggy is India's leading on-demand delivery platform for food, groceries, and more.",
        companySize: "5,001-10,000 employees",
        companyIndustry: "Food Technology",
        companyWebsite: "https://swiggy.com",
        companyFounded: "2014",
        aiSummary: "ML-focused data science role at a leading food delivery platform. Building recommendation and prediction systems at massive scale. Strong focus on applied ML with real business impact.",
        aiMatchScore: 78,
        aiKeySkills: JSON.stringify(["Python", "Machine Learning", "Recommendation Systems", "SQL", "Spark", "Deep Learning", "MLOps"]),
        aiSalaryEstimate: "₹30L - ₹45L",
        tags: JSON.stringify(["ml", "data-science", "foodtech"]),
        notes: "Interesting ML problems at scale",
        createdAt: daysAgo(3),
      },
      {
        externalId: "gj-002",
        title: "DevOps Engineer - Cloud Infrastructure",
        company: "Zerodha",
        companyLinkedinUrl: "https://linkedin.com/company/zerodha",
        location: "Bangalore, India",
        description: "Zerodha, India's largest stock broker, is looking for a DevOps Engineer to manage and scale our cloud infrastructure. You'll work on Kubernetes clusters, CI/CD pipelines, and monitoring systems that power real-time stock trading.\n\nKey Requirements:\n- 4+ years DevOps/SRE experience\n- Expert in Kubernetes, Docker, Terraform\n- AWS or GCP experience\n- Strong Linux fundamentals\n- Experience with monitoring (Prometheus, Grafana)",
        salary: null,
        jobType: "full-time",
        experienceLevel: "mid",
        source: "google_jobs",
        sourceUrl: "https://google.com/jobs/result/002",
        applyUrl: "https://zerodha.com/careers",
        postedAt: daysAgo(1),
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
        tags: JSON.stringify(["devops", "cloud"]),
        notes: null,
        createdAt: daysAgo(1),
      },
      {
        externalId: "li-004",
        title: "Engineering Manager - Mobile",
        company: "PhonePe",
        companyLinkedinUrl: "https://linkedin.com/company/phonepe",
        location: "Bangalore, India",
        description: "PhonePe is looking for an Engineering Manager to lead our mobile engineering team. You'll manage a team of 10+ Android and iOS engineers, drive architectural decisions, and ensure high-quality mobile releases.\n\nYou should have:\n- 10+ years software engineering experience\n- 3+ years managing engineering teams\n- Deep mobile development expertise (Android/iOS)\n- Experience with CI/CD for mobile",
        salary: "₹55L - ₹75L",
        jobType: "full-time",
        experienceLevel: "senior",
        source: "linkedin",
        sourceUrl: "https://linkedin.com/jobs/view/004",
        applyUrl: "https://linkedin.com/jobs/view/004/apply",
        postedAt: daysAgo(4),
        status: "applied",
        enrichmentStatus: "completed",
        companyDescription: "PhonePe is India's leading digital payments platform with over 500M registered users.",
        companySize: "5,001-10,000 employees",
        companyIndustry: "Financial Technology",
        companyWebsite: "https://phonepe.com",
        companyFounded: "2015",
        aiSummary: "Engineering leadership role at India's top UPI payments platform. Managing mobile teams building products used by 500M+ users. Excellent for senior engineers transitioning to management.",
        aiMatchScore: 72,
        aiKeySkills: JSON.stringify(["Engineering Management", "Mobile Development", "Android", "iOS", "Team Leadership", "System Architecture", "CI/CD"]),
        aiSalaryEstimate: "₹55L - ₹75L",
        tags: JSON.stringify(["management", "mobile", "fintech"]),
        notes: "Applied on March 8",
        createdAt: daysAgo(4),
      },
      {
        externalId: "gj-003",
        title: "Full Stack Developer",
        company: "Freshworks",
        companyLinkedinUrl: "https://linkedin.com/company/freshworks",
        location: "Chennai, India",
        description: "Freshworks is hiring Full Stack Developers to build our next-gen SaaS platform. Work with React, Node.js, and Ruby on Rails to create customer engagement tools used by 60,000+ businesses worldwide.\n\nRequirements:\n- 3-5 years full stack experience\n- Proficiency in React and Node.js\n- Database design skills (PostgreSQL, Redis)\n- API design and REST principles",
        salary: "₹18L - ₹30L",
        jobType: "full-time",
        experienceLevel: "mid",
        source: "google_jobs",
        sourceUrl: "https://google.com/jobs/result/003",
        applyUrl: "https://freshworks.com/careers/fullstack",
        postedAt: daysAgo(2),
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
        createdAt: daysAgo(2),
      },
      {
        externalId: "li-005",
        title: "Product Designer - Growth",
        company: "CRED",
        companyLinkedinUrl: "https://linkedin.com/company/cred-club",
        location: "Bangalore, India",
        description: "CRED is looking for a Product Designer to join our Growth team. You'll design experiments, optimize conversion funnels, and create delightful experiences for our premium user base.\n\nWhat we look for:\n- 4+ years product design experience\n- Strong portfolio demonstrating growth design\n- Figma expertise\n- Data-informed design approach\n- Understanding of behavioral psychology",
        salary: "₹25L - ₹40L",
        jobType: "full-time",
        experienceLevel: "mid",
        source: "linkedin",
        sourceUrl: "https://linkedin.com/jobs/view/005",
        applyUrl: "https://linkedin.com/jobs/view/005/apply",
        postedAt: daysAgo(0),
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
        tags: JSON.stringify(["design", "growth"]),
        notes: null,
        createdAt: daysAgo(0),
      },
      {
        externalId: "gj-004",
        title: "Backend Engineer - Rust",
        company: "Ather Energy",
        companyLinkedinUrl: "https://linkedin.com/company/ather-energy",
        location: "Bangalore, India",
        description: "Ather Energy is looking for a Backend Engineer proficient in Rust to build our connected vehicle platform. You'll work on real-time telemetry systems, OTA updates, and fleet management services.\n\nRequirements:\n- 3+ years backend development\n- Experience with Rust or Go\n- Real-time systems experience\n- IoT/connected devices background is a plus",
        salary: "₹20L - ₹35L",
        jobType: "full-time",
        experienceLevel: "mid",
        source: "google_jobs",
        sourceUrl: "https://google.com/jobs/result/004",
        applyUrl: "https://ather.com/careers",
        postedAt: daysAgo(5),
        status: "rejected",
        enrichmentStatus: "completed",
        companyDescription: "Ather Energy is an Indian electric vehicle company designing and manufacturing smart electric scooters.",
        companySize: "1,001-5,000 employees",
        companyIndustry: "Electric Vehicles",
        companyWebsite: "https://atherenergy.com",
        companyFounded: "2013",
        aiSummary: "Interesting backend role at an EV startup building connected vehicle platform. Rust focus is unique in Indian market. IoT and real-time systems provide distinctive challenges.",
        aiMatchScore: 65,
        aiKeySkills: JSON.stringify(["Rust", "Backend Development", "IoT", "Real-time Systems", "OTA Updates", "Distributed Systems"]),
        aiSalaryEstimate: "₹20L - ₹35L",
        tags: JSON.stringify(["rust", "iot", "ev"]),
        notes: "Position filled",
        createdAt: daysAgo(5),
      },
      {
        externalId: "li-006",
        title: "Site Reliability Engineer",
        company: "Atlassian",
        companyLinkedinUrl: "https://linkedin.com/company/atlassian",
        location: "Bangalore, India",
        description: "Atlassian is hiring SREs to ensure the reliability and performance of products used by millions of teams worldwide. You'll work on Jira, Confluence, and Bitbucket infrastructure.\n\nResponsibilities:\n- Design and implement SLOs and SLIs\n- Build automated incident response systems\n- Manage Kubernetes clusters at scale\n- Drive reliability improvements across services",
        salary: "₹40L - ₹60L",
        jobType: "full-time",
        experienceLevel: "senior",
        source: "linkedin",
        sourceUrl: "https://linkedin.com/jobs/view/006",
        applyUrl: "https://linkedin.com/jobs/view/006/apply",
        postedAt: daysAgo(1),
        status: "shortlisted",
        enrichmentStatus: "completed",
        companyDescription: "Atlassian creates collaboration and productivity tools like Jira, Confluence, and Bitbucket used by millions of teams globally.",
        companySize: "10,001+ employees",
        companyIndustry: "Software Development",
        companyWebsite: "https://atlassian.com",
        companyFounded: "2002",
        aiSummary: "SRE role at a global leader in developer and collaboration tools. Work on world-class infrastructure serving millions of teams. Excellent compensation and engineering culture.",
        aiMatchScore: 82,
        aiKeySkills: JSON.stringify(["Kubernetes", "SRE", "Incident Response", "Monitoring", "Automation", "Distributed Systems", "Terraform"]),
        aiSalaryEstimate: "₹40L - ₹60L",
        tags: JSON.stringify(["sre", "infrastructure"]),
        notes: "Second round scheduled",
        createdAt: daysAgo(1),
      },
      {
        externalId: "gj-005",
        title: "AI/ML Engineer - NLP",
        company: "Haptik",
        companyLinkedinUrl: "https://linkedin.com/company/haptik",
        location: "Mumbai, India",
        description: "Haptik is building the future of conversational AI. We need an ML Engineer to improve our NLP models, fine-tune LLMs, and build conversational AI systems for enterprise clients.\n\nSkills needed:\n- Strong NLP background\n- Experience fine-tuning LLMs (GPT, BERT, LLaMA)\n- Python, PyTorch\n- Production ML experience",
        salary: "₹25L - ₹45L",
        jobType: "full-time",
        experienceLevel: "mid",
        source: "google_jobs",
        sourceUrl: "https://google.com/jobs/result/005",
        applyUrl: "https://haptik.ai/careers",
        postedAt: daysAgo(3),
        status: "reviewed",
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
        tags: JSON.stringify(["ai", "nlp", "llm"]),
        notes: null,
        createdAt: daysAgo(3),
      },
      {
        externalId: "li-007",
        title: "Principal Architect - Cloud",
        company: "Infosys",
        companyLinkedinUrl: "https://linkedin.com/company/infosys",
        location: "Hyderabad, India",
        description: "Infosys is hiring a Principal Architect to lead cloud transformation initiatives for global enterprises. You'll design multi-cloud architectures and guide engineering teams through large-scale migrations.\n\nRequirements:\n- 12+ years software architecture experience\n- Multi-cloud expertise (AWS, Azure, GCP)\n- Enterprise architecture frameworks\n- Strong communication and stakeholder management",
        salary: "₹60L - ₹90L",
        jobType: "full-time",
        experienceLevel: "senior",
        source: "linkedin",
        sourceUrl: "https://linkedin.com/jobs/view/007",
        applyUrl: "https://linkedin.com/jobs/view/007/apply",
        postedAt: daysAgo(6),
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
        tags: JSON.stringify(["cloud", "architecture"]),
        notes: null,
        createdAt: daysAgo(6),
      },
      {
        externalId: "gj-006",
        title: "QA Automation Engineer",
        company: "Meesho",
        companyLinkedinUrl: "https://linkedin.com/company/meesho",
        location: "Bangalore, India",
        description: "Meesho is looking for a QA Automation Engineer to build and maintain our test automation framework. You'll work on web and mobile testing across our social commerce platform.\n\nSkills:\n- 3+ years QA automation\n- Selenium, Appium, Cypress\n- API testing (Postman, REST Assured)\n- CI/CD integration for tests",
        salary: "₹12L - ₹22L",
        jobType: "full-time",
        experienceLevel: "mid",
        source: "google_jobs",
        sourceUrl: "https://google.com/jobs/result/006",
        applyUrl: "https://meesho.com/careers",
        postedAt: daysAgo(0),
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
        createdAt: daysAgo(0),
      },
      {
        externalId: "li-008",
        title: "Security Engineer",
        company: "Zomato",
        companyLinkedinUrl: "https://linkedin.com/company/zomato",
        location: "Gurugram, India",
        description: "Zomato is looking for a Security Engineer to strengthen our application and infrastructure security. You'll conduct penetration testing, implement security automation, and establish security best practices.\n\nRequirements:\n- 4+ years application security experience\n- OWASP Top 10 expertise\n- Penetration testing skills\n- Security automation tools (SAST, DAST)\n- Cloud security (AWS)",
        salary: "₹28L - ₹42L",
        jobType: "full-time",
        experienceLevel: "mid",
        source: "linkedin",
        sourceUrl: "https://linkedin.com/jobs/view/008",
        applyUrl: "https://linkedin.com/jobs/view/008/apply",
        postedAt: daysAgo(2),
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
        tags: JSON.stringify(["security"]),
        notes: null,
        createdAt: daysAgo(2),
      },
      {
        externalId: "gj-007",
        title: "iOS Developer - SwiftUI",
        company: "Dream11",
        companyLinkedinUrl: "https://linkedin.com/company/dream11",
        location: "Mumbai, India",
        description: "Dream11 is looking for an iOS Developer skilled in SwiftUI to build engaging fantasy sports experiences. You'll work on real-time features during live matches used by 200M+ users.\n\nRequirements:\n- 3+ years iOS development\n- SwiftUI and UIKit expertise\n- Real-time data handling\n- Performance optimization for high-traffic events",
        salary: "₹22L - ₹38L",
        jobType: "full-time",
        experienceLevel: "mid",
        source: "google_jobs",
        sourceUrl: "https://google.com/jobs/result/007",
        applyUrl: "https://dream11.com/careers",
        postedAt: daysAgo(4),
        status: "reviewed",
        enrichmentStatus: "completed",
        companyDescription: "Dream11 is India's biggest fantasy sports platform with over 200 million users.",
        companySize: "1,001-5,000 employees",
        companyIndustry: "Sports Technology",
        companyWebsite: "https://dream11.com",
        companyFounded: "2008",
        aiSummary: "iOS role at India's largest fantasy sports platform. Unique challenge of building real-time features for massive concurrent user loads during live matches.",
        aiMatchScore: 70,
        aiKeySkills: JSON.stringify(["SwiftUI", "iOS", "UIKit", "Real-time Systems", "Performance Optimization", "Mobile Architecture"]),
        aiSalaryEstimate: "₹22L - ₹38L",
        tags: JSON.stringify(["ios", "mobile", "sports"]),
        notes: null,
        createdAt: daysAgo(4),
      },
      {
        externalId: "li-009",
        title: "Platform Engineer - Kubernetes",
        company: "Walmart Global Tech",
        companyLinkedinUrl: "https://linkedin.com/company/walmart-global-tech-india",
        location: "Bangalore, India",
        description: "Walmart Global Tech India is hiring Platform Engineers to build and operate our internal developer platform serving 10,000+ engineers. You'll work on Kubernetes, service mesh, and observability.\n\nKey Skills:\n- 5+ years platform/infrastructure engineering\n- Kubernetes administration and custom controllers\n- Istio or similar service mesh\n- Go programming\n- Terraform and infrastructure as code",
        salary: "₹35L - ₹55L",
        jobType: "full-time",
        experienceLevel: "senior",
        source: "linkedin",
        sourceUrl: "https://linkedin.com/jobs/view/009",
        applyUrl: "https://linkedin.com/jobs/view/009/apply",
        postedAt: daysAgo(0),
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
        tags: JSON.stringify(["platform", "kubernetes"]),
        notes: null,
        createdAt: daysAgo(0),
      },
      {
        externalId: "gj-008",
        title: "Data Engineer - Spark",
        company: "OLA",
        companyLinkedinUrl: "https://linkedin.com/company/olacabs",
        location: "Bangalore, India",
        description: "OLA is hiring Data Engineers to build scalable data pipelines processing billions of ride events daily. You'll work with Spark, Kafka, and Airflow to power analytics and ML workflows.\n\nRequirements:\n- 3+ years data engineering\n- Apache Spark and Kafka expertise\n- SQL and data modeling\n- Airflow or similar workflow orchestration\n- Python or Scala",
        salary: "₹20L - ₹35L",
        jobType: "full-time",
        experienceLevel: "mid",
        source: "google_jobs",
        sourceUrl: "https://google.com/jobs/result/008",
        applyUrl: "https://ola.com/careers",
        postedAt: daysAgo(3),
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
        tags: JSON.stringify(["data-engineering", "spark"]),
        notes: null,
        createdAt: daysAgo(3),
      },
      {
        externalId: "li-010",
        title: "Technical Program Manager",
        company: "Google",
        companyLinkedinUrl: "https://linkedin.com/company/google",
        location: "Hyderabad, India",
        description: "Google is looking for a Technical Program Manager to drive complex cross-team projects in our Cloud division. You'll coordinate engineering teams across time zones and manage critical launches.\n\nRequirements:\n- 6+ years TPM or similar role\n- Strong technical background (CS degree preferred)\n- Excellent stakeholder management\n- Experience with cloud services\n- Track record of delivering complex programs",
        salary: null,
        jobType: "full-time",
        experienceLevel: "senior",
        source: "linkedin",
        sourceUrl: "https://linkedin.com/jobs/view/010",
        applyUrl: "https://careers.google.com/jobs/tpm",
        postedAt: daysAgo(1),
        status: "shortlisted",
        enrichmentStatus: "completed",
        companyDescription: "Google LLC is an American multinational technology company focusing on search engine technology, online advertising, cloud computing, and AI.",
        companySize: "10,001+ employees",
        companyIndustry: "Technology",
        companyWebsite: "https://google.com",
        companyFounded: "1998",
        aiSummary: "Prestigious TPM role at Google Cloud India. Combines technical depth with program management across global teams. Top-tier compensation and career growth potential.",
        aiMatchScore: 90,
        aiKeySkills: JSON.stringify(["Program Management", "Cloud Computing", "Stakeholder Management", "Cross-functional Leadership", "Agile", "Risk Management"]),
        aiSalaryEstimate: "₹50L - ₹80L",
        tags: JSON.stringify(["tpm", "google", "cloud"]),
        notes: "Referral from college friend",
        createdAt: daysAgo(1),
      },
    ];

    for (const job of seedJobs) {
      const id = this.nextJobId++;
      this.jobsMap.set(id, { ...job, id } as Job);
    }

    // Seed scrape runs
    const seedRuns: InsertScrapeRun[] = [
      {
        source: "linkedin",
        query: "Product Manager EdTech India",
        location: "Bangalore",
        status: "completed",
        jobsFound: 12,
        jobsNew: 8,
        triggerRunId: "run_abc123",
        error: null,
        startedAt: new Date(now.getTime() - 2 * 86400000).toISOString(),
        completedAt: new Date(now.getTime() - 2 * 86400000 + 180000).toISOString(),
      },
      {
        source: "google_jobs",
        query: "Frontend Engineer React",
        location: "Bangalore",
        status: "completed",
        jobsFound: 15,
        jobsNew: 10,
        triggerRunId: "run_def456",
        error: null,
        startedAt: new Date(now.getTime() - 86400000).toISOString(),
        completedAt: new Date(now.getTime() - 86400000 + 120000).toISOString(),
      },
      {
        source: "linkedin",
        query: "Staff Engineer Backend",
        location: "India",
        status: "completed",
        jobsFound: 8,
        jobsNew: 6,
        triggerRunId: "run_ghi789",
        error: null,
        startedAt: new Date(now.getTime() - 43200000).toISOString(),
        completedAt: new Date(now.getTime() - 43200000 + 240000).toISOString(),
      },
      {
        source: "google_jobs",
        query: "DevOps Kubernetes",
        location: "India",
        status: "failed",
        jobsFound: 0,
        jobsNew: 0,
        triggerRunId: "run_jkl012",
        error: "API rate limit exceeded. Try again in 60 seconds.",
        startedAt: new Date(now.getTime() - 7200000).toISOString(),
        completedAt: new Date(now.getTime() - 7200000 + 5000).toISOString(),
      },
      {
        source: "linkedin",
        query: "Data Scientist ML",
        location: "Mumbai",
        status: "completed",
        jobsFound: 10,
        jobsNew: 7,
        triggerRunId: "run_mno345",
        error: null,
        startedAt: new Date(now.getTime() - 3600000).toISOString(),
        completedAt: new Date(now.getTime() - 3600000 + 200000).toISOString(),
      },
    ];

    for (const run of seedRuns) {
      const id = this.nextRunId++;
      this.runsMap.set(id, { ...run, id } as ScrapeRun);
    }
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Job methods
  async getJobs(filters?: {
    source?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ jobs: Job[]; total: number }> {
    let result = Array.from(this.jobsMap.values());

    if (filters?.source) {
      result = result.filter((j) => j.source === filters.source);
    }
    if (filters?.status) {
      result = result.filter((j) => j.status === filters.status);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          (j.location && j.location.toLowerCase().includes(q)),
      );
    }

    // Sort by createdAt desc
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = result.length;
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const offset = (page - 1) * limit;
    result = result.slice(offset, offset + limit);

    return { jobs: result, total };
  }

  async getJob(id: number): Promise<Job | undefined> {
    return this.jobsMap.get(id);
  }

  async createJob(insertJob: InsertJob): Promise<Job> {
    const id = this.nextJobId++;
    const job: Job = { ...insertJob, id } as Job;
    this.jobsMap.set(id, job);
    return job;
  }

  async updateJob(id: number, updates: Partial<Job>): Promise<Job | undefined> {
    const existing = this.jobsMap.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates, id };
    this.jobsMap.set(id, updated);
    return updated;
  }

  async deleteJob(id: number): Promise<boolean> {
    return this.jobsMap.delete(id);
  }

  // Scrape run methods
  async getScrapeRuns(): Promise<ScrapeRun[]> {
    return Array.from(this.runsMap.values()).sort(
      (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
    );
  }

  async getScrapeRun(id: number): Promise<ScrapeRun | undefined> {
    return this.runsMap.get(id);
  }

  async createScrapeRun(insertRun: InsertScrapeRun): Promise<ScrapeRun> {
    const id = this.nextRunId++;
    const run: ScrapeRun = { ...insertRun, id } as ScrapeRun;
    this.runsMap.set(id, run);
    return run;
  }

  async updateScrapeRun(id: number, updates: Partial<ScrapeRun>): Promise<ScrapeRun | undefined> {
    const existing = this.runsMap.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates, id };
    this.runsMap.set(id, updated);
    return updated;
  }

  // Dashboard stats
  async getDashboardStats() {
    const allJobs = Array.from(this.jobsMap.values());

    const sourceMap: Record<string, number> = {};
    const statusMap: Record<string, number> = {};
    let newJobs = 0;
    let enrichedJobs = 0;

    for (const job of allJobs) {
      sourceMap[job.source] = (sourceMap[job.source] || 0) + 1;
      statusMap[job.status] = (statusMap[job.status] || 0) + 1;
      if (job.status === "new") newJobs++;
      if (job.enrichmentStatus === "completed") enrichedJobs++;
    }

    const sources = Object.entries(sourceMap).map(([source, count]) => ({ source, count }));
    const statuses = Object.entries(statusMap).map(([status, count]) => ({ status, count }));
    const recentJobs = [...allJobs]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 8);

    return {
      totalJobs: allJobs.length,
      newJobs,
      enrichedJobs,
      sources,
      statuses,
      recentJobs,
    };
  }
}

export const storage = new MemStorage();
