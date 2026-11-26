// Single source of truth for content used by interactive features (terminal, flows).
// Static page copy lives in index.html so it renders without JavaScript and stays crawlable.

const CAREER_START = new Date(2022, 5, 1); // Joined Infosys in June 2022
const YEAR_MS = 365.25 * 24 * 60 * 60 * 1000;

/** Years since CAREER_START, rounded to one decimal (e.g. "4.5"). */
export function yearsOfExperience(now = new Date()) {
  return (Math.round(((now - CAREER_START) / YEAR_MS) * 10) / 10).toFixed(1);
}

export const profile = {
  name: "Praveen Isukapalli",
  role: "Backend Engineer",
  company: "Infosys",
  email: "praveen22801@gmail.com",
  // Formspree form endpoint (form ID from formspree.io)
  contactEndpoint: "https://formspree.io/f/xeagdpzq",
  resume: "assets/Praveen_Isukapalli_Resume.pdf",
  links: {
    github: "https://github.com/praveenisukapalli",
    linkedin: "https://in.linkedin.com/in/praveen-isukapalli",
  },
  summary:
    "Backend Engineer at Infosys building scalable Node.js, GraphQL and AWS cloud-native systems for Toyota Motor North America: vehicle ordering, packaging and supply chain platforms.",
};

export const typingPhrases = [
  "scalable APIs",
  "GraphQL services",
  "serverless workflows on AWS",
  "event-driven systems",
  "well-tested backends",
];

export const sections = [
  { id: "home", label: "Home", icon: "i-terminal" },
  { id: "about", label: "About", icon: "i-user" },
  { id: "systems", label: "Systems", icon: "i-layers" },
  { id: "skills", label: "Skills", icon: "i-code" },
  { id: "experience", label: "Experience", icon: "i-briefcase" },
  { id: "projects", label: "Projects", icon: "i-rocket" },
  { id: "achievements", label: "Achievements", icon: "i-trophy" },
  { id: "contact", label: "Contact", icon: "i-mail" },
];

export const skills = {
  Languages: ["JavaScript", "TypeScript", "Python", "SQL"],
  Backend: ["Node.js", "Express.js", "REST APIs", "GraphQL", "Apollo GraphQL", "Microservices", "TypeORM"],
  "AWS Cloud": ["Lambda", "ECS", "Step Functions", "S3", "API Gateway", "RDS", "EventBridge", "CloudWatch", "IAM", "Secrets Manager", "Parameter Store", "SNS", "SES"],
  Databases: ["PostgreSQL", "MySQL", "MS SQL Server"],
  "DevOps & Testing": ["Docker", "Jenkins", "CI/CD", "JFrog", "Mocha", "Chai"],
  "Tools & AI": ["Git", "Postman", "pgAdmin", "VS Code", "GitHub Copilot", "Claude"],
};

export const experience = [
  {
    role: "Digital Specialist Engineer (L0 → L1)",
    company: "Infosys Ltd.",
    client: "Toyota Motor Sales, U.S.A., Inc.",
    period: "Jun 2022 – Present",
    highlights: [
      "Serverless Express + Apollo GraphQL APIs on Lambda for the enterprise web application",
      "Scheduled Lambda/ECS batches with Step Functions that cut manual intervention by 75%",
      "Bulk CSV imports from S3 into PostgreSQL instead of row-by-row inserts",
      "Mocha & Chai regression suites that raised test coverage to 85%",
      "Promoted L0 → L1, won the Insta Raise Award twice and earned multiple client appreciations",
    ],
  },
];

export const projects = [
  {
    name: "HabitTwin",
    blurb: "AI habit intelligence platform with forecasting and proactive alerts",
    stack: "TypeScript · Node.js · Express",
  },
  {
    name: "Roommate Recommender",
    blurb: "ML roommate matching with Decision Trees and cosine similarity",
    stack: "Python · Machine Learning",
    url: "https://youtu.be/SyNRKl84N1o",
  },
  {
    name: "This Portfolio",
    blurb: "Dependency-free site with an interactive terminal and a small Node server",
    stack: "HTML · CSS · JavaScript · Node.js",
    url: "https://github.com/praveenisukapalli/portfolio",
  },
];

export const flows = [
  {
    id: "web",
    label: "Web backend services",
    icon: "i-server",
    caption:
      "How a request from the web application travels through the serverless backend I build, from the edge down to the database.",
    nodes: [
      {
        icon: "i-user",
        title: "Web client",
        tech: ["REST", "GraphQL"],
        detail:
          "Business users work in the web application, which calls the backend over REST and GraphQL for ordering, packaging and supply chain operations.",
      },
      {
        icon: "i-shield",
        title: "API Gateway",
        tech: ["API Gateway", "Lambda authorizer"],
        detail:
          "API Gateway is the single entry point. A Lambda authorizer checks every request before it reaches the backend, so unauthorized calls are rejected at the edge.",
      },
      {
        icon: "i-zap",
        title: "Serverless API",
        tech: ["AWS Lambda", "Express", "Apollo GraphQL"],
        detail:
          "The backend runs on AWS Lambda as an Express app, with Apollo GraphQL serving queries and mutations alongside the REST routes.",
      },
      {
        icon: "i-code",
        title: "Service layer",
        tech: ["Node.js", "TypeScript", "S3", "Other teams' APIs"],
        detail:
          "Typed services hold the business rules: validation, orchestration and consistent error handling. They also read and write files in S3 and call other teams' APIs for shared data.",
      },
      {
        icon: "i-database",
        title: "Data",
        tech: ["TypeORM", "pg", "RDS PostgreSQL"],
        detail:
          "Services access Amazon RDS for PostgreSQL through TypeORM and the pg driver, with well-structured schemas and optimized queries for high-volume transactions.",
      },
    ],
  },
  {
    id: "batches",
    label: "Automated batch processing",
    icon: "i-zap",
    caption:
      "Scheduled batches that automate almost all daily business flows, cutting manual intervention by 75%. Users now only make manual adjustments for their daily needs.",
    nodes: [
      {
        icon: "i-clock",
        title: "Schedule & orchestrate",
        tech: ["EventBridge", "Step Functions"],
        detail:
          "EventBridge schedules start each batch automatically. Batches that depend on each other are chained with Step Functions, so they run in the right order.",
      },
      {
        icon: "i-cpu",
        title: "Process",
        tech: ["Lambda", "ECS", "Node.js"],
        detail:
          "Each batch runs where it fits best: lighter batches on AWS Lambda, heavier and longer-running ones on ECS. They cover vehicle and part line planning, daily order release, order summaries and business calculations.",
      },
      {
        icon: "i-database",
        title: "Bulk load",
        tech: ["S3", "PostgreSQL"],
        detail:
          "Instead of inserting rows one query at a time, results are written to CSV files in S3 and bulk-imported into PostgreSQL, which made large loads much faster.",
      },
      {
        icon: "i-send",
        title: "Deliver & notify",
        tech: ["Files", "SNS", "SES"],
        detail:
          "Results are stored in our database and delivered as generated files for downstream systems. Users are notified by email through SNS and SES.",
      },
      {
        icon: "i-activity",
        title: "Monitor",
        tech: ["CloudWatch Logs"],
        detail: "CloudWatch Logs give visibility into every run, so issues can be traced and fixed quickly during production support.",
      },
    ],
  },
  {
    id: "delivery",
    label: "Quality & delivery",
    icon: "i-check-circle",
    caption: "How every change, for web services and batches alike, gets from a commit to production.",
    nodes: [
      {
        icon: "i-git",
        title: "Code & test",
        tech: ["Git", "Mocha", "Chai"],
        detail:
          "Changes go through code review, backed by automated functional and regression tests that raised coverage to 85% and reduced production defects.",
      },
      {
        icon: "i-box",
        title: "CI/CD to QA",
        tech: ["CI/CD pipelines"],
        detail: "Every commit triggers CI/CD pipelines that build the code and deploy it to the QA environment for validation.",
      },
      {
        icon: "i-file",
        title: "Release",
        tech: ["GitHub Releases", "JFrog"],
        detail: "A versioned GitHub release is created, and the release artifacts are stored in JFrog.",
      },
      {
        icon: "i-rocket",
        title: "Deploy to production",
        tech: ["Deployment templates", "DR region"],
        detail:
          "Production deployments are requested from standard templates for serverless web services and ECS batches, pulling the latest version from JFrog. A disaster recovery (DR) region adds resilience.",
      },
    ],
  },
];
