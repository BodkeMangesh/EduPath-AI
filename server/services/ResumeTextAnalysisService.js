const SECTION_ALIASES = {
  summary: [
    "summary",
    "professional summary",
    "profile",
    "objective",
    "career objective",
  ],

  skills: [
    "skills",
    "technical skills",
    "technical skill",
    "core skills",
    "key skills",
    "technologies",
    "technical expertise",
  ],

  experience: [
    "experience",
    "work experience",
    "professional experience",
    "employment",
    "employment history",
    "work history",
  ],

  education: [
    "education",
    "academic background",
    "academic qualification",
    "qualifications",
  ],

  projects: [
    "projects",
    "academic projects",
    "personal projects",
    "key projects",
  ],

  certifications: ["certifications", "certificates", "licenses"],

  achievements: ["achievements", "accomplishments", "awards"],

  languages: ["languages", "language"],
};

const SKILL_DICTIONARY = {
  programmingLanguages: [
    "java",
    "javascript",
    "python",
    "c",
    "c++",
    "c#",
    "php",
    "typescript",
    "kotlin",
    "swift",
    "go",
    "ruby",
  ],

  frontend: [
    "html",
    "css",
    "javascript",
    "react",
    "react.js",
    "angular",
    "vue",
    "bootstrap",
    "tailwind",
    "next.js",
    "nextjs",
  ],

  backend: [
    "node.js",
    "nodejs",
    "express",
    "express.js",
    "spring",
    "spring boot",
    "django",
    "flask",
    "fastapi",
    ".net",
    "asp.net",
  ],

  databases: [
    "mysql",
    "mongodb",
    "postgresql",
    "postgres",
    "sqlite",
    "oracle",
    "sql server",
    "redis",
  ],

  dataAndAI: [
    "numpy",
    "pandas",
    "matplotlib",
    "scikit-learn",
    "machine learning",
    "deep learning",
    "artificial intelligence",
    "power bi",
    "tableau",
  ],

  tools: [
    "git",
    "github",
    "gitlab",
    "docker",
    "postman",
    "thunder client",
    "visual studio code",
    "vs code",
  ],

  concepts: [
    "oops",
    "object oriented programming",
    "data structures",
    "algorithms",
    "dsa",
    "rest api",
    "restful api",
    "api",
    "crud",
    "jdbc",
  ],

  cloud: [
    "aws",
    "azure",
    "google cloud",
    "gcp",
    "firebase",
    "vercel",
    "netlify",
  ],

  softSkills: [
    "communication",
    "leadership",
    "teamwork",
    "problem solving",
    "problem-solving",
    "time management",
    "adaptability",
    "creativity",
    "critical thinking",
  ],
};

class ResumeTextAnalysisService {
  /*
  |--------------------------------------------------------------------------
  | Normalize Text
  |--------------------------------------------------------------------------
  */
  normalizeText(text = "") {
    return String(text)
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/\u00A0/g, " ")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  /*
  |--------------------------------------------------------------------------
  | Escape Regular Expression Characters
  |--------------------------------------------------------------------------
  */
  escapeRegex(value = "") {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  /*
  |--------------------------------------------------------------------------
  | Check Whether Text Contains a Keyword
  |--------------------------------------------------------------------------
  */
  containsKeyword(text, keyword) {
    if (!text || !keyword) {
      return false;
    }

    const escapedKeyword = this.escapeRegex(keyword);

    const pattern = new RegExp(
      `(^|[^a-zA-Z0-9+#.])${escapedKeyword}(?=$|[^a-zA-Z0-9+#.])`,
      "i",
    );

    return pattern.test(text);
  }

  /*
  |--------------------------------------------------------------------------
  | Find Skills in Resume Text
  |--------------------------------------------------------------------------
  */
  extractSkills(text = "") {
    const normalizedText = this.normalizeText(text);

    const result = {
      programmingLanguages: [],
      frontend: [],
      backend: [],
      databases: [],
      dataAndAI: [],
      tools: [],
      concepts: [],
      cloud: [],
      softSkills: [],
      all: [],
    };

    for (const [category, skills] of Object.entries(SKILL_DICTIONARY)) {
      for (const skill of skills) {
        if (this.containsKeyword(normalizedText, skill)) {
          if (!result[category].includes(skill)) {
            result[category].push(skill);
          }

          if (!result.all.includes(skill)) {
            result.all.push(skill);
          }
        }
      }
    }

    return result;
  }

  /*
  |--------------------------------------------------------------------------
  | Extract Resume Sections
  |--------------------------------------------------------------------------
  */
  extractSections(text = "") {
    const normalizedText = this.normalizeText(text);

    if (!normalizedText) {
      return {};
    }

    const lines = normalizedText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const sectionNames = {};

    for (const [sectionKey, aliases] of Object.entries(SECTION_ALIASES)) {
      for (const alias of aliases) {
        const normalizedAlias = alias.toLowerCase();

        const index = lines.findIndex((line) => {
          const cleanLine = line
            .toLowerCase()
            .replace(/[:\-|]+$/g, "")
            .trim();

          return (
            cleanLine === normalizedAlias || cleanLine === `${normalizedAlias}:`
          );
        });

        if (index !== -1) {
          sectionNames[sectionKey] = {
            title: lines[index],
            lineNumber: index + 1,
          };

          break;
        }
      }
    }

    return sectionNames;
  }

  /*
  |--------------------------------------------------------------------------
  | Extract Section Content
  |--------------------------------------------------------------------------
  */
  extractSectionContent(text = "", sectionKey) {
    const normalizedText = this.normalizeText(text);

    if (!normalizedText || !sectionKey) {
      return "";
    }

    const lines = normalizedText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const aliases = SECTION_ALIASES[sectionKey] || [];

    const startIndex = lines.findIndex((line) => {
      const cleanLine = line
        .toLowerCase()
        .replace(/[:\-|]+$/g, "")
        .trim();

      return aliases.some((alias) => cleanLine === alias.toLowerCase());
    });

    if (startIndex === -1) {
      return "";
    }

    const sectionKeys = Object.keys(SECTION_ALIASES);

    const endIndex = lines.findIndex((line, index) => {
      if (index <= startIndex) {
        return false;
      }

      const cleanLine = line
        .toLowerCase()
        .replace(/[:\-|]+$/g, "")
        .trim();

      return sectionKeys.some((key) =>
        SECTION_ALIASES[key].some((alias) => alias.toLowerCase() === cleanLine),
      );
    });

    const contentLines =
      endIndex === -1
        ? lines.slice(startIndex + 1)
        : lines.slice(startIndex + 1, endIndex);

    return contentLines.join("\n").trim();
  }

  /*
  |--------------------------------------------------------------------------
  | Extract Basic Keywords
  |--------------------------------------------------------------------------
  */
  extractKeywords(text = "") {
    const normalizedText = this.normalizeText(text);

    if (!normalizedText) {
      return [];
    }

    const words = normalizedText
      .toLowerCase()
      .replace(/[^\w+#.\- ]/g, " ")
      .split(/\s+/)
      .filter(Boolean);

    const stopWords = new Set([
      "the",
      "and",
      "for",
      "with",
      "from",
      "that",
      "this",
      "have",
      "has",
      "had",
      "are",
      "was",
      "were",
      "will",
      "your",
      "you",
      "our",
      "their",
      "about",
      "into",
      "using",
      "used",
      "been",
      "being",
      "through",
      "which",
      "where",
      "when",
      "while",
      "then",
      "than",
      "also",
      "such",
      "more",
      "most",
      "other",
      "some",
      "can",
      "may",
      "not",
      "but",
      "all",
      "any",
      "job",
      "work",
      "worked",
      "responsible",
      "responsibilities",
    ]);

    const frequency = {};

    for (const word of words) {
      if (word.length < 3 || stopWords.has(word) || /^[0-9]+$/.test(word)) {
        continue;
      }

      frequency[word] = (frequency[word] || 0) + 1;
    }

    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .map(([keyword, count]) => ({
        keyword,
        count,
      }));
  }

  /*
  |--------------------------------------------------------------------------
  | Extract Experience Information
  |--------------------------------------------------------------------------
  */
  extractExperience(text = "") {
    const experienceText = this.extractSectionContent(text, "experience");

    if (!experienceText) {
      return {
        sectionFound: false,
        text: "",
        yearsMentioned: [],
      };
    }

    const yearsMentioned =
      experienceText.match(
        /\b(?:19|20)\d{2}\b|\b\d+(?:\.\d+)?\+?\s*(?:years?|yrs?)\b/gi,
      ) || [];

    return {
      sectionFound: true,
      text: experienceText,
      yearsMentioned: [...new Set(yearsMentioned)],
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Extract Education Information
  |--------------------------------------------------------------------------
  */
  extractEducation(text = "") {
    const educationText = this.extractSectionContent(text, "education");

    if (!educationText) {
      return {
        sectionFound: false,
        text: "",
      };
    }

    const degreeKeywords = [
      "bsc",
      "bca",
      "b.tech",
      "btech",
      "be",
      "mca",
      "m.tech",
      "mtech",
      "msc",
      "mba",
      "phd",
      "bachelor",
      "master",
      "diploma",
      "computer science",
      "information technology",
    ];

    const detectedDegrees = degreeKeywords.filter((degree) =>
      this.containsKeyword(educationText, degree),
    );

    return {
      sectionFound: true,
      text: educationText,
      detectedDegrees: [...new Set(detectedDegrees)],
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Extract Projects
  |--------------------------------------------------------------------------
  */
  extractProjects(text = "") {
    const projectsText = this.extractSectionContent(text, "projects");

    if (!projectsText) {
      return {
        sectionFound: false,
        text: "",
        projectCount: 0,
      };
    }

    const projectLines = projectsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    return {
      sectionFound: true,
      text: projectsText,
      projectCount: projectLines.length,
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Detect Missing Important Sections
  |--------------------------------------------------------------------------
  */
  detectMissingSections(sections = {}) {
    const importantSections = [
      "summary",
      "skills",
      "experience",
      "education",
      "projects",
    ];

    return importantSections.filter((section) => !sections[section]);
  }

  /*
  |--------------------------------------------------------------------------
  | Calculate Basic Resume Metrics
  |--------------------------------------------------------------------------
  */
  calculateMetrics(text = "", sections = {}, skills = {}) {
    const normalizedText = this.normalizeText(text);

    const words = normalizedText
      ? normalizedText.split(/\s+/).filter(Boolean)
      : [];

    const lines = normalizedText
      ? normalizedText.split("\n").filter(Boolean)
      : [];

    const sectionCount = Object.keys(sections).length;
    const skillCount = skills.all ? skills.all.length : 0;

    return {
      characterCount: normalizedText.length,
      wordCount: words.length,
      lineCount: lines.length,
      sectionCount,
      skillCount,
      hasSummary: Boolean(sections.summary),
      hasSkills: Boolean(sections.skills),
      hasExperience: Boolean(sections.experience),
      hasEducation: Boolean(sections.education),
      hasProjects: Boolean(sections.projects),
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Analyze Resume Text
  |--------------------------------------------------------------------------
  */
  analyzeText(text = "") {
    const normalizedText = this.normalizeText(text);

    if (!normalizedText) {
      throw new Error("Resume text is required for analysis.");
    }

    const sections = this.extractSections(normalizedText);
    const skills = this.extractSkills(normalizedText);
    const keywords = this.extractKeywords(normalizedText);
    const experience = this.extractExperience(normalizedText);
    const education = this.extractEducation(normalizedText);
    const projects = this.extractProjects(normalizedText);
    const missingSections = this.detectMissingSections(sections);
    const metrics = this.calculateMetrics(normalizedText, sections, skills);

    return {
      textAvailable: true,

      sections,

      skills,

      keywords,

      experience,

      education,

      projects,

      missingSections,

      metrics,
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Analyze Extracted Resume Object
  |--------------------------------------------------------------------------
  */
  analyzeResume(extractedResume = {}) {
    if (!extractedResume || !extractedResume.text) {
      throw new Error("Extracted resume text is required for resume analysis.");
    }

    const analysis = this.analyzeText(extractedResume.text);

    return {
      ...analysis,

      source: {
        fileType: extractedResume.fileType || "",
        pageCount: extractedResume.pageCount || 0,
        characterCount: extractedResume.characterCount || 0,
        wordCount: extractedResume.wordCount || 0,
      },
    };
  }
}

module.exports = new ResumeTextAnalysisService();
