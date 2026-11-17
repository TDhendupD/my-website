// All the words and data on the site that change often live here.
// Edit this file to update experience, projects and skills. No other JS needs to change.
// `image: null` shows a dashed placeholder. Set it to a path like "assets/img/alpha-lab.jpg" to show a photo.

export const quests = [
  {
    id: "tech-support",
    group: "Main quests",
    title: "Student Technology Support Associate",
    org: "Davidson College Technology & Innovation",
    dates: "May 2026 to August 2026",
    status: "done",
    image: null,
    imageHint: "assets/img/tech-support.jpg",
    objectives: [
      "Diagnosed, repaired and installed hardware for students, faculty and staff across campus.",
      "Securely decommissioned retired laptops and kept inventory and rental records accurate in the internal tracking database.",
      "Trained with IT staff on agentic AI workflows, learning how agents chain tools to automate multi-step tasks.",
    ],
    rewards: ["Hardware repair", "Inventory systems", "Agentic AI workflows"],
  },
  {
    id: "next-level",
    group: "Main quests",
    title: "NEXT Level Student Consultant",
    org: "The Jay Hurt Hub for Innovation and Entrepreneurship",
    dates: "February 2026 to May 2026",
    status: "done",
    image: null,
    imageHint: "assets/img/study-buddy.jpg",
    objectives: [
      "Built the React front end for an AI-powered Study Buddy tool, with LLM APIs integrated through backend services.",
      "Designed conversation flows with ethical guardrails, and ran prompt design, output schema validation and QA through demo scenarios.",
      "Delivered a working prototype to a startup client. Davidson faculty and other consultant teams asked to follow up on it.",
    ],
    rewards: ["React", "LLM APIs", "Prompt design", "QA testing"],
  },
  {
    id: "alpha-lab",
    group: "Main quests",
    title: "Undergraduate Machine Learning Researcher",
    org: "ALPhA Lab, in collaboration with FRIB at Michigan State University",
    dates: "May 2025 to August 2025",
    status: "done",
    image: null,
    imageHint: "assets/img/alpha-lab.jpg",
    objectives: [
      "Developed and evaluated deep learning architectures for high-dimensional 4D AT-TPC detector data using point-cloud representations, advised by Dr. Michelle Kuchera and Dr. Raghu Ramanujan.",
      "Implemented a contrastive learning foundation model and compared PointNet and DGCNN encoders for the embeddings that downstream nuclear physics tasks rely on.",
      "Presented the results at Michigan State University to FRIB faculty and collaborators.",
    ],
    rewards: ["Deep learning", "Contrastive learning", "PointNet and DGCNN", "Presenting research"],
  },
  {
    id: "hack-davidson",
    group: "Side quests",
    title: "Logistics Executive, Hack@Davidson",
    org: "Davidson College",
    dates: "January 2025 to present",
    status: "active",
    image: null,
    imageHint: "assets/img/hack-davidson.jpg",
    objectives: [
      "Ran sponsor, participant and judge outreach that brought in more than $10,000 in sponsorship.",
      "Grew event participation by about 25% and recruited more than 5 judges from companies in the CS industry.",
      "Managed logistics for over 100 participants and sponsors and supported operations on site.",
    ],
    rewards: ["Sponsor outreach", "Event logistics", "Judge recruiting"],
  },
];

// TODO(tenzing): the three repo links below come from your resume and point at other accounts
// (TabishNavaid, MurtazaKafka, Makoninio). Confirm they are the links you want, or swap in your own forks or live demos.
export const projects = [
  {
    id: "1stseen",
    icon: "spyglass",
    featured: true,
    name: "1stSeen",
    kind: "Forecasting tool",
    desc: "A full-stack monorepo that reconstructs recurring internship hiring cycles and forecasts when applications will open. The model is deterministic, and it lowers its confidence when a company's history is thin or unreliable.",
    fact: "Ingests six sources (Greenhouse, Lever, Ashby, SmartRecruiters, RSS and sitemaps, Wayback archives), with leakage-safe backtesting and every forecast tied to its evidence.",
    stack: ["TypeScript", "Next.js", "Python", "PostgreSQL (Supabase)", "LiteLLM", "Google Calendar API"],
    link: "https://github.com/TabishNavaid/1stseen",
    image: null,
    imageHint: "assets/img/1stseen.jpg",
  },
  {
    id: "mantra",
    icon: "quill",
    name: "Mantra",
    kind: "Form automation",
    desc: "A platform that fills in long web forms from files and structured data you upload. A browser extension talks to a central web app, which matches form fields against your profile using a schema.",
    fact: "MERN backend with user profiles and an API between the extension and the server.",
    stack: ["MongoDB", "Express", "React", "Node.js", "Browser Extension APIs"],
    link: "https://github.com/MurtazaKafka/mantra",
    image: null,
    imageHint: "assets/img/mantra.jpg",
  },
  {
    id: "budgetation",
    icon: "coins",
    name: "Budgetation",
    kind: "Finance app",
    desc: "A personal finance app with a FastAPI backend and a Next.js front end. Pandas handles the spending and subscription analytics, and a LangGraph agent answers questions from live transaction data.",
    fact: "Bank accounts link through Plaid, with encrypted tokens.",
    stack: ["Python", "FastAPI", "Next.js", "TypeScript", "LangGraph", "Plaid API", "Pandas"],
    link: "https://github.com/Makoninio/Personal-finance-assistant",
    image: null,
    imageHint: "assets/img/budgetation.jpg",
  },
];

// `usedIn` is what the skill tree shows on hover. Only projects and roles that name the skill on the resume are listed.
// TODO(tenzing): add `usedIn` to more skills (for example PyTorch or Slurm) where you can point to real work.
export const skills = [
  {
    name: "Languages",
    items: [
      { name: "Python", usedIn: ["1stSeen", "Budgetation"] },
      { name: "TypeScript", usedIn: ["1stSeen", "Budgetation"] },
      { name: "JavaScript", usedIn: ["Mantra"] },
      { name: "Java" },
      { name: "C" },
      { name: "R" },
      { name: "SQL" },
      { name: "Bash" },
      { name: "HTML / CSS" },
    ],
  },
  {
    name: "Web and backend",
    items: [
      { name: "React", usedIn: ["Mantra", "Study Buddy"] },
      { name: "Next.js", usedIn: ["1stSeen", "Budgetation"] },
      { name: "Node.js", usedIn: ["Mantra"] },
      { name: "Express", usedIn: ["Mantra"] },
      { name: "FastAPI", usedIn: ["Budgetation"] },
      { name: "REST APIs" },
      { name: "PostgreSQL", usedIn: ["1stSeen"] },
      { name: "MongoDB", usedIn: ["Mantra"] },
    ],
  },
  {
    name: "Data and ML",
    items: [
      { name: "PyTorch" },
      { name: "TensorFlow" },
      { name: "scikit-learn" },
      { name: "LLM APIs", usedIn: ["1stSeen", "Study Buddy"] },
      { name: "LangGraph", usedIn: ["Budgetation"] },
      { name: "Pandas", usedIn: ["Budgetation"] },
      { name: "PySpark" },
      { name: "NumPy" },
      { name: "Matplotlib" },
    ],
  },
  {
    name: "Tools",
    items: [
      { name: "Git" },
      { name: "GitHub Actions" },
      { name: "Supabase", usedIn: ["1stSeen"] },
      { name: "Databricks" },
      { name: "Unix" },
      { name: "Jupyter" },
      { name: "Slurm" },
      { name: "VS Code" },
      { name: "Cursor" },
      { name: "Adobe Creative Cloud" },
    ],
  },
];

// Places on the quest log map. `quests` lists quest ids that happened there.
// TODO(tenzing): write your own line for each place.
export const places = [
  { id: "bhutan", name: "Bhutan", role: "Home", text: "Where I'm from.", quests: [] },
  {
    id: "nc",
    name: "North Carolina, USA",
    role: "Davidson College",
    text: "Where most of my quests so far have happened.",
    quests: ["tech-support", "next-level", "alpha-lab", "hack-davidson"],
  },
];

// The Tools pouch of the inventory. `icon` is a name from js/icons.js.
// TODO(tenzing): set `note` on each tool to one line about how you actually use it (it shows a dashed placeholder until you do).
export const tools = [
  { id: "git", icon: "branch", name: "Git", kind: "Version control", desc: "Tracks every change to a codebase and lets a team work on separate branches.", note: null },
  { id: "gh-actions", icon: "play", name: "GitHub Actions", kind: "CI and automation", desc: "Runs tests and deployments automatically when code is pushed.", note: null },
  { id: "supabase", icon: "database", name: "Supabase", kind: "Backend platform", desc: "Hosted PostgreSQL with authentication and APIs on top.", usedIn: ["1stSeen"], note: null },
  { id: "databricks", icon: "layers", name: "Databricks", kind: "Data platform", desc: "Notebooks and Spark clusters for building data pipelines.", note: null },
  { id: "unix", icon: "terminal", name: "Unix", kind: "Command line", desc: "The shell environment behind most development and server work.", note: null },
  { id: "jupyter", icon: "notebook", name: "Jupyter", kind: "Notebooks", desc: "Interactive notebooks for data analysis and experiments.", note: null },
  { id: "slurm", icon: "servers", name: "Slurm", kind: "Job scheduler", desc: "Queues and runs jobs on shared compute clusters.", note: null },
  { id: "vscode", icon: "brackets", name: "VS Code", kind: "Editor", desc: "A general purpose code editor.", note: null },
  { id: "cursor", icon: "pointer", name: "Cursor", kind: "AI code editor", desc: "A code editor with AI assistance built in.", note: null },
  { id: "adobe", icon: "brush", name: "Adobe Creative Cloud", kind: "Design suite", desc: "Design, photo and video tools.", note: null },
];
