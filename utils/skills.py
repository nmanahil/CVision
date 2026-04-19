SKILL_CATEGORIES = {
    # --- TECH ---
    "programming": [
        "python", "java", "c", "c++", "c#", "javascript", "typescript", "r", "scala",
        "go", "ruby", "php", "swift", "kotlin", "matlab", "bash", "shell scripting",
    ],
    "web": [
        "html", "css", "react", "angular", "vue", "node", "django", "flask",
        "rest api", "graphql", "next.js", "tailwind", "bootstrap", "wordpress",
    ],
    "cloud_devops": [
        "aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "git",
        "ci/cd", "terraform", "linux", "devops", "jenkins", "github actions",
    ],
    "data_tech": [
        "sql", "nosql", "mongodb", "postgresql", "mysql", "data analysis",
        "data science", "machine learning", "deep learning", "ai", "nlp",
        "power bi", "tableau", "looker", "pandas", "numpy", "matplotlib",
        "data visualization", "big data", "spark", "hadoop",
    ],
    "cybersecurity": [
        "cybersecurity", "network security", "penetration testing", "ethical hacking",
        "siem", "firewalls", "vulnerability assessment", "iam", "identity management",
        "access control", "soc", "incident response", "compliance",
    ],
    "design_ux": [
        "figma", "adobe xd", "sketch", "ui design", "ux design", "user research",
        "wireframing", "prototyping", "adobe photoshop", "adobe illustrator",
        "adobe indesign", "canva", "graphic design", "motion graphics", "video editing",
        "after effects", "premiere pro", "3d modelling", "autocad", "solidworks",
    ],

    # --- FINANCE & ACCOUNTING ---
    "finance_accounting": [
        "accounting", "finance", "financial analysis", "financial reporting",
        "financial modelling", "budgeting", "forecasting", "auditing", "tax",
        "taxation", "bookkeeping", "payroll", "cost accounting", "management accounting",
        "accounts payable", "accounts receivable", "ap", "ar", "general ledger",
        "balance sheet", "account reconciliation", "reconciliation", "balance clearing",
        "expense accounting", "expense management", "travel and expense", "t&e",
        "invoice processing", "overdue balances", "cash flow", "treasury",
        "investment analysis", "portfolio management", "risk management",
        "financial planning", "ifrs", "gaap", "cpa", "cfa", "acca", "cima",
    ],
    "erp_finance_tools": [
        "sap", "oracle", "microsoft dynamics", "netsuite", "workday", "certify",
        "concur", "quickbooks", "xero", "sage", "erp", "excel", "pivot tables",
        "vlookup", "power query", "bloomberg terminal",
    ],

    # --- BUSINESS & MANAGEMENT ---
    "business_management": [
        "project management", "product management", "business analysis",
        "business development", "operations management", "supply chain",
        "logistics", "procurement", "vendor management", "contract management",
        "change management", "process improvement", "lean", "six sigma",
        "agile", "scrum", "kanban", "pmp", "prince2", "strategic planning",
        "business strategy", "kpi", "okr", "business administration",
        "office administration", "executive assistant", "office management",
    ],
    "sales_marketing": [
        "sales", "b2b sales", "b2c sales", "account management", "crm",
        "salesforce", "hubspot", "digital marketing", "seo", "sem", "ppc",
        "google ads", "facebook ads", "social media marketing", "content marketing",
        "email marketing", "marketing strategy", "brand management", "market research",
        "copywriting", "content creation", "influencer marketing", "growth hacking",
        "marketing analytics", "google analytics", "a/b testing",
    ],
    "hr_people": [
        "human resources", "hr", "recruitment", "talent acquisition", "onboarding",
        "employee relations", "performance management", "learning and development",
        "training", "compensation and benefits", "payroll", "hris", "workday",
        "succession planning", "organisational development", "employment law",
        "diversity and inclusion", "workforce planning",
    ],

    # --- HEALTHCARE & SCIENCE ---
    "healthcare": [
        "patient care", "clinical skills", "nursing", "medicine", "surgery",
        "diagnosis", "pharmacology", "medical terminology", "ehr", "emr",
        "epic", "cerner", "healthcare management", "public health", "epidemiology",
        "first aid", "cpr", "phlebotomy", "radiology", "physiotherapy",
        "occupational therapy", "mental health", "counselling", "psychology",
        "social work", "care planning", "infection control", "triage",
    ],
    "science_research": [
        "research", "laboratory skills", "data collection", "statistical analysis",
        "spss", "r", "clinical trials", "biology", "chemistry", "physics",
        "biochemistry", "microbiology", "genetics", "molecular biology",
        "scientific writing", "literature review", "grant writing",
        "qualitative research", "quantitative research", "fieldwork",
    ],

    # --- ENGINEERING ---
    "engineering": [
        "mechanical engineering", "electrical engineering", "civil engineering",
        "structural engineering", "chemical engineering", "industrial engineering",
        "autocad", "solidworks", "catia", "ansys", "matlab", "cad", "cam",
        "project engineering", "quality assurance", "quality control",
        "iso standards", "health and safety", "risk assessment",
        "manufacturing", "production planning", "maintenance", "plc programming",
        "embedded systems", "circuit design", "pcb design",
    ],

    # --- LAW & COMPLIANCE ---
    "legal": [
        "legal research", "contract drafting", "contract review", "litigation",
        "corporate law", "employment law", "intellectual property", "compliance",
        "regulatory affairs", "gdpr", "data protection", "legal writing",
        "due diligence", "mergers and acquisitions", "arbitration", "mediation",
        "paralegal", "legal advice", "case management",
    ],

    # --- EDUCATION & TRAINING ---
    "education": [
        "teaching", "lesson planning", "curriculum development", "classroom management",
        "e-learning", "instructional design", "lms", "moodle", "blackboard",
        "tutoring", "mentoring", "coaching", "training delivery", "facilitation",
        "special education", "early childhood education", "stem education",
        "academic writing", "research supervision",
    ],

    # --- HOSPITALITY, RETAIL & CUSTOMER SERVICE ---
    "hospitality_retail": [
        "customer service", "customer experience", "hospitality", "hotel management",
        "food and beverage", "event management", "event planning", "catering",
        "retail management", "merchandising", "inventory management", "pos systems",
        "cash handling", "upselling", "complaint handling", "front of house",
        "back of house", "reservations", "tourism",
    ],

    # --- CREATIVE & MEDIA ---
    "creative_media": [
        "journalism", "writing", "editing", "proofreading", "copywriting",
        "content writing", "blogging", "social media", "photography", "videography",
        "podcast production", "public relations", "pr", "media relations",
        "communications", "storytelling", "scriptwriting", "translation",
        "subtitling", "voice over",
    ],

    # --- SOFT SKILLS (universal) ---
    "soft_skills": [
        "communication", "teamwork", "leadership", "problem solving", "critical thinking",
        "time management", "organisation", "organization", "attention to detail",
        "multitasking", "adaptability", "creativity", "initiative", "proactivity",
        "independence", "stakeholder management", "negotiation", "conflict resolution",
        "decision making", "emotional intelligence", "presentation skills",
        "interpersonal skills", "analytical skills", "self-motivation",
    ],

    # --- LANGUAGES ---
    "languages": [
        "english", "spanish", "french", "german", "mandarin", "arabic", "portuguese",
        "italian", "japanese", "korean", "russian", "hindi", "dutch", "turkish",
        "hungarian", "polish", "swedish", "norwegian", "danish", "bilingual",
        "multilingual", "fluent", "native speaker",
    ],
}

SKILL_ALIASES = {
    # Excel
    "ms excel": "excel",
    "microsoft excel": "excel",
    "pivot table": "pivot tables",
    "v-lookup": "vlookup",
    "xlookup": "vlookup",
    # Finance
    "accounts payable": "ap",
    "accounts receivable": "ar",
    "travel & expense": "t&e",
    "travel and expense": "t&e",
    "erp system": "erp",
    "erp systems": "erp",
    "account reconciliations": "account reconciliation",
    "balance reconciliation": "account reconciliation",
    "financial modelling": "financial modelling",
    "financial modeling": "financial modelling",
    "p&l": "financial reporting",
    "profit and loss": "financial reporting",
    # ERP
    "ms dynamics": "microsoft dynamics",
    "dynamics 365": "microsoft dynamics",
    "dynamics nav": "microsoft dynamics",
    # Soft skills
    "problem-solving": "problem solving",
    "detail oriented": "attention to detail",
    "detail-oriented": "attention to detail",
    "proactive": "proactivity",
    "independent": "independence",
    "self-motivated": "self-motivation",
    "team player": "teamwork",
    "team work": "teamwork",
    "time-management": "time management",
    "stakeholder": "stakeholder management",
    "interpersonal": "interpersonal skills",
    # Languages
    "fluent english": "english",
    "fluent hungarian": "hungarian",
    "fluent german": "german",
    "fluent french": "french",
    "fluent spanish": "spanish",
    "native english": "english",
    # Data
    "data analytics": "data analysis",
    "business intelligence": "data visualization",
    "bi": "data visualization",
    # Design
    "photoshop": "adobe photoshop",
    "illustrator": "adobe illustrator",
    "indesign": "adobe indesign",
    "after effects": "after effects",
    "premiere": "premiere pro",
    "3d modeling": "3d modelling",
    # HR
    "talent management": "talent acquisition",
    "l&d": "learning and development",
    "d&i": "diversity and inclusion",
    # Healthcare
    "electronic health records": "ehr",
    "electronic medical records": "emr",
    "counseling": "counselling",
    # Engineering
    "quality assurance": "quality assurance",
    "qa": "quality assurance",
    "qc": "quality control",
    # Legal
    "data privacy": "gdpr",
    "m&a": "mergers and acquisitions",
    # Marketing
    "search engine optimisation": "seo",
    "search engine optimization": "seo",
    "pay per click": "ppc",
    "google analytics 4": "google analytics",
    "ga4": "google analytics",
    # Agile
    "agile methodology": "agile",
    "scrum master": "scrum",
    # Cloud
    "amazon web services": "aws",
    "google cloud platform": "gcp",
    "microsoft azure": "azure",
    "continuous integration": "ci/cd",
    "continuous deployment": "ci/cd",
}


def extract_skills(text):
    text_lower = text.lower()

    for alias, canonical in SKILL_ALIASES.items():
        if alias in text_lower:
            text_lower = text_lower.replace(alias, canonical)

    found = set()
    for category, skills in SKILL_CATEGORIES.items():
        for skill in skills:
            if skill in text_lower:
                found.add(skill)

    return list(found)
