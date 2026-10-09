const mongoose = require("mongoose");
const ResumeAnalysis = require("../models/ResumeAnalysis");
const User = require("../models/User");
const Career = require("../models/Career");
const ResumeTextExtractionService = require("./ResumeTextExtractionService");
const ResumeTextAnalysisService = require("./ResumeTextAnalysisService");

class ResumeAnalyzerService {
  isValidObjectId(value) {
    return mongoose.Types.ObjectId.isValid(value);
  }

  async getUser(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found.");
    }

    return user;
  }

  async getSelectedCareer(user) {
    if (!user?.selectedCareer) {
      return null;
    }

    const career = await Career.findById(user.selectedCareer);

    return career;
  }

  normalizeString(value) {
    return String(value || "")
      .trim()
      .toLowerCase();
  }

  uniqueStrings(values = []) {
    return [
      ...new Set(
        values
          .filter(Boolean)
          .map((value) => String(value).trim())
          .filter(Boolean),
      ),
    ];
  }

  calculateAverage(values = []) {
    if (!values.length) {
      return 0;
    }

    const total = values.reduce((sum, value) => sum + Number(value || 0), 0);

    return Math.round(total / values.length);
  }

  clampScore(value) {
    return Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
  }

  getCareerRequiredSkills(career) {
    return this.uniqueStrings(career?.skills || []);
  }

  getUserSkills(user) {
    return this.uniqueStrings([
      ...(user?.professional?.skills || []),
      ...(user?.placement?.completedSkills || []),
    ]);
  }

  calculateSkillAnalysis(user, career) {
    const requiredSkills = this.getCareerRequiredSkills(career);
    const userSkills = this.getUserSkills(user);

    const normalizedUserSkills = userSkills.map((skill) =>
      this.normalizeString(skill),
    );

    const matched = [];
    const missing = [];
    const extra = [...userSkills];

    requiredSkills.forEach((requiredSkill) => {
      const normalizedRequired = this.normalizeString(requiredSkill);

      const index = normalizedUserSkills.indexOf(normalizedRequired);

      if (index !== -1) {
        matched.push(requiredSkill);

        const extraIndex = extra.findIndex(
          (skill) => this.normalizeString(skill) === normalizedRequired,
        );

        if (extraIndex !== -1) {
          extra.splice(extraIndex, 1);
        }
      } else {
        missing.push(requiredSkill);
      }
    });

    const score = requiredSkills.length
      ? this.clampScore((matched.length / requiredSkills.length) * 100)
      : 0;

    return {
      detected: userSkills,
      matched,
      missing,
      extra,
      score,
    };
  }

  calculateEducationAnalysis(user) {
    const education = user?.education || {};

    const degree = education.degree || "";
    const branch = education.branch || "";
    const cgpa = typeof education.cgpa === "number" ? education.cgpa : null;

    let score = 0;

    if (degree) {
      score += 40;
    }

    if (branch) {
      score += 35;
    }

    if (cgpa !== null) {
      score += Math.min(25, cgpa * 2.5);
    }

    return {
      degree,
      branch,
      cgpa,
      relevant: Boolean(degree || branch),
      score: this.clampScore(score),
    };
  }

  calculateProjectAnalysis(user, career) {
    const projects = Array.isArray(user?.professional?.projects)
      ? user.professional.projects
      : [];

    const total = projects.length;

    const requiredSkills = this.getCareerRequiredSkills(career);

    let relevant = 0;

    projects.forEach((project) => {
      const projectText =
        typeof project === "string" ? project : JSON.stringify(project || {});

      const normalizedProject = this.normalizeString(projectText);

      const isRelevant = requiredSkills.some((skill) =>
        normalizedProject.includes(this.normalizeString(skill)),
      );

      if (isRelevant) {
        relevant += 1;
      }
    });

    let score = 0;

    if (total > 0) {
      score = Math.min(70, total * 20);

      if (relevant > 0) {
        score += Math.min(30, relevant * 15);
      }
    }

    return {
      total,
      relevant,
      strengths:
        total > 0 ? [`${total} project(s) available in your profile.`] : [],
      suggestions:
        total === 0
          ? ["Add at least one relevant project."]
          : relevant === 0
            ? ["Add projects related to your target career."]
            : [],
      score: this.clampScore(score),
    };
  }

  calculateExperienceAnalysis(user) {
    const experience = user?.professional?.experienceLevel || "";

    const normalized = this.normalizeString(experience);

    let score = 0;
    let years = 0;

    if (
      normalized.includes("experienced") ||
      normalized.includes("professional")
    ) {
      score = 85;
      years = 2;
    } else if (normalized.includes("intermediate")) {
      score = 65;
      years = 1;
    } else if (
      normalized.includes("beginner") ||
      normalized.includes("fresher") ||
      normalized.includes("student")
    ) {
      score = 35;
    }

    return {
      years,
      level: experience,
      strengths: experience ? [`Experience level: ${experience}`] : [],
      gaps: experience ? [] : ["Add your experience level."],
      score,
    };
  }

  calculateAtsAnalysis(user) {
    const education = user?.education || {};
    const skills = this.getUserSkills(user);
    const projects = Array.isArray(user?.professional?.projects)
      ? user.professional.projects
      : [];

    const issues = [];
    const suggestions = [];

    if (!skills.length) {
      issues.push("No skills found in profile.");
      suggestions.push("Add relevant technical and professional skills.");
    }

    if (!projects.length) {
      issues.push("No projects found.");
      suggestions.push("Add relevant projects to strengthen your resume.");
    }

    if (!education.degree) {
      issues.push("Degree information is missing.");
    }

    const score = this.clampScore(100 - issues.length * 20);

    return {
      compatible: score >= 70,
      score,
      issues,
      suggestions,
    };
  }

  calculateKeywordAnalysis(career, skillAnalysis) {
    const requiredSkills = this.getCareerRequiredSkills(career);

    const matched = skillAnalysis.matched;
    const missing = skillAnalysis.missing;

    return {
      matched,
      missing,
      important: requiredSkills,
      score: requiredSkills.length
        ? this.clampScore((matched.length / requiredSkills.length) * 100)
        : 0,
    };
  }

  calculateCareerAlignment(skillAnalysis) {
    const score = skillAnalysis.score;

    return {
      score,
      matchedSkills: skillAnalysis.matched,
      missingSkills: skillAnalysis.missing,
      relevantProjects: [],
      recommendation:
        score >= 70
          ? "Your current profile has a strong alignment with your selected career."
          : "Improve the missing career skills and add relevant projects to increase alignment.",
    };
  }

  generateSuggestions({
    skillAnalysis,
    projectAnalysis,
    educationAnalysis,
    experienceAnalysis,
    atsAnalysis,
    keywordAnalysis,
  }) {
    const suggestions = [];

    skillAnalysis.missing.forEach((skill) => {
      suggestions.push({
        category: "skills",
        title: `Add ${skill}`,
        description: `Develop ${skill} and include it in your resume after gaining practical knowledge.`,
        priority: "high",
        completed: false,
      });
    });

    projectAnalysis.suggestions.forEach((suggestion) => {
      suggestions.push({
        category: "projects",
        title: "Improve project section",
        description: suggestion,
        priority: "high",
        completed: false,
      });
    });

    educationAnalysis.degree || educationAnalysis.branch
      ? null
      : suggestions.push({
          category: "education",
          title: "Complete education details",
          description: "Add your degree and branch information.",
          priority: "medium",
          completed: false,
        });

    if (!experienceAnalysis.level) {
      suggestions.push({
        category: "experience",
        title: "Add experience information",
        description: "Mention your current experience level clearly.",
        priority: "medium",
        completed: false,
      });
    }

    atsAnalysis.suggestions.forEach((suggestion) => {
      suggestions.push({
        category: "ats",
        title: "Improve ATS compatibility",
        description: suggestion,
        priority: "medium",
        completed: false,
      });
    });

    if (keywordAnalysis.missing.length) {
      suggestions.push({
        category: "keywords",
        title: "Improve career keywords",
        description:
          "Add relevant keywords after developing the corresponding skills.",
        priority: "medium",
        completed: false,
      });
    }

    return suggestions;
  }

  async createAnalysis(userId) {
    const user = await this.getUser(userId);
    const career = await this.getSelectedCareer(user);

    let analysis = await ResumeAnalysis.findOne({
      user: userId,
    });

    if (!analysis) {
      analysis = await ResumeAnalysis.create({
        user: userId,
        targetCareer: career?._id || null,
        targetRole: career?.name || user?.placement?.targetRole || "",
        status: "not_analyzed",
      });
    }

    return this.buildAnalysisDashboard(analysis, career);
  }

  async getAnalysis(userId) {
    const user = await this.getUser(userId);
    const career = await this.getSelectedCareer(user);

    let analysis = await ResumeAnalysis.findOne({
      user: userId,
    });

    if (!analysis) {
      analysis = await ResumeAnalysis.create({
        user: userId,
        targetCareer: career?._id || null,
        targetRole: career?.name || user?.placement?.targetRole || "",
        status: "not_analyzed",
      });
    }

    return this.buildAnalysisDashboard(analysis, career);
  }

  async analyzeProfile(userId) {
    const user = await this.getUser(userId);
    const career = await this.getSelectedCareer(user);

    if (!career) {
      throw new Error("Please select a career before analyzing your resume.");
    }

    let analysis = await ResumeAnalysis.findOne({
      user: userId,
    });

    if (!analysis) {
      analysis = new ResumeAnalysis({
        user: userId,
      });
    }

    analysis.status = "analyzing";
    analysis.analysisError = "";

    await analysis.save();

    try {
      const skillAnalysis = this.calculateSkillAnalysis(user, career);

      const educationAnalysis = this.calculateEducationAnalysis(user);

      const projectAnalysis = this.calculateProjectAnalysis(user, career);

      const experienceAnalysis = this.calculateExperienceAnalysis(user);

      const atsAnalysis = this.calculateAtsAnalysis(user);

      const keywordAnalysis = this.calculateKeywordAnalysis(
        career,
        skillAnalysis,
      );

      const careerAlignment = this.calculateCareerAlignment(skillAnalysis);

      const suggestions = this.generateSuggestions({
        skillAnalysis,
        projectAnalysis,
        educationAnalysis,
        experienceAnalysis,
        atsAnalysis,
        keywordAnalysis,
      });

      const overall = this.calculateAverage([
        atsAnalysis.score,
        skillAnalysis.score,
        experienceAnalysis.score,
        projectAnalysis.score,
        educationAnalysis.score,
        keywordAnalysis.score,
      ]);

      analysis.targetCareer = career._id;
      analysis.targetRole = career.name || user?.placement?.targetRole || "";

      analysis.score = {
        overall: this.clampScore(overall),
        ats: atsAnalysis.score,
        skills: skillAnalysis.score,
        experience: experienceAnalysis.score,
        projects: projectAnalysis.score,
        education: educationAnalysis.score,
        formatting: atsAnalysis.score,
        keywords: keywordAnalysis.score,
      };

      analysis.skills = {
        detected: skillAnalysis.detected,
        matched: skillAnalysis.matched,
        missing: skillAnalysis.missing,
        extra: skillAnalysis.extra,
      };

      analysis.keywords = {
        matched: keywordAnalysis.matched,
        missing: keywordAnalysis.missing,
        important: keywordAnalysis.important,
      };

      analysis.experience = {
        years: experienceAnalysis.years,
        level: experienceAnalysis.level,
        strengths: experienceAnalysis.strengths,
        gaps: experienceAnalysis.gaps,
      };

      analysis.projects = {
        total: projectAnalysis.total,
        relevant: projectAnalysis.relevant,
        strengths: projectAnalysis.strengths,
        suggestions: projectAnalysis.suggestions,
      };

      analysis.education = {
        degree: educationAnalysis.degree,
        branch: educationAnalysis.branch,
        cgpa: educationAnalysis.cgpa,
        relevant: educationAnalysis.relevant,
      };

      analysis.atsAnalysis = {
        compatible: atsAnalysis.compatible,
        score: atsAnalysis.score,
        issues: atsAnalysis.issues,
        suggestions: atsAnalysis.suggestions,
      };

      analysis.careerAlignment = careerAlignment;
      analysis.suggestions = suggestions;

      analysis.strengths = [
        skillAnalysis.matched.length
          ? `Matched ${skillAnalysis.matched.length} career skill(s).`
          : null,
        projectAnalysis.total
          ? `You have ${projectAnalysis.total} project(s).`
          : null,
        educationAnalysis.degree ? `Education information is available.` : null,
      ].filter(Boolean);

      analysis.weaknesses = [
        skillAnalysis.missing.length
          ? `${skillAnalysis.missing.length} required skill(s) are missing.`
          : null,
        projectAnalysis.relevant === 0 && projectAnalysis.total > 0
          ? "Projects are not strongly aligned with the selected career."
          : null,
        !user?.professional?.experienceLevel
          ? "Experience level is not clearly specified."
          : null,
      ].filter(Boolean);

      analysis.status = "completed";
      analysis.lastAnalyzedAt = new Date();

      analysis.aiAnalysis = {
        enabled: true,
        model: analysis.aiAnalysis?.model || "",
        analyzedBy: "AI Resume Analyzer",
      };

      await analysis.save();

      return this.buildAnalysisDashboard(analysis, career);
    } catch (error) {
      analysis.status = "failed";
      analysis.analysisError = error?.message || "Resume analysis failed.";

      await analysis.save();

      throw error;
    }
  }

  async updateResume(userId, resumeData) {
    const user = await this.getUser(userId);
    const career = await this.getSelectedCareer(user);

    let analysis = await ResumeAnalysis.findOne({
      user: userId,
    });

    if (!analysis) {
      analysis = new ResumeAnalysis({
        user: userId,
      });
    }

    analysis.targetCareer = career?._id || null;
    analysis.targetRole = career?.name || user?.placement?.targetRole || "";

    analysis.resume = {
      fileName: resumeData.fileName || "",
      fileUrl: resumeData.fileUrl || "",
      fileType: resumeData.fileType || "",
      fileSize: Number(resumeData.fileSize) || 0,
      uploaded: Boolean(resumeData.uploaded),
      uploadedAt: resumeData.uploaded ? new Date() : null,

      extractedText: resumeData.extractedText || "",
      pageCount: Number(resumeData.pageCount) || 0,
      characterCount: Number(resumeData.characterCount) || 0,
      wordCount: Number(resumeData.wordCount) || 0,
    };

    await analysis.save();

    return this.buildAnalysisDashboard(analysis, career);
  }

  async uploadResume(userId, file) {
    if (!file) {
      throw new Error("Resume file is required.");
    }

    const user = await this.getUser(userId);
    const career = await this.getSelectedCareer(user);

    /*
  |--------------------------------------------------------------------------
  | Extract resume text
  |--------------------------------------------------------------------------
  */

    const extractedResume = await ResumeTextExtractionService.extractResume(
      file.path,
    );

    /*
  |--------------------------------------------------------------------------
  | Analyze extracted resume text
  |--------------------------------------------------------------------------
  */

    const textAnalysis =
      ResumeTextAnalysisService.analyzeResume(extractedResume);

    /*
  |--------------------------------------------------------------------------
  | Find or create analysis document
  |--------------------------------------------------------------------------
  */

    let analysis = await ResumeAnalysis.findOne({
      user: userId,
    });

    if (!analysis) {
      analysis = new ResumeAnalysis({
        user: userId,
      });
    }

    /*
  |--------------------------------------------------------------------------
  | Resume file information
  |--------------------------------------------------------------------------
  */

    const fileUrl = `/uploads/resumes/${file.filename}`;

    analysis.targetCareer = career?._id || null;

    analysis.targetRole = career?.name || user?.placement?.targetRole || "";

    /*
  |--------------------------------------------------------------------------
  | Save uploaded file + extracted resume data
  |--------------------------------------------------------------------------
  */

    analysis.resume = {
      fileName: file.originalname || file.filename,
      fileUrl,
      fileType: file.mimetype || "",
      fileSize: Number(file.size) || 0,
      uploaded: true,
      uploadedAt: new Date(),

      extractedText: extractedResume.text || "",
      pageCount: Number(extractedResume.pageCount) || 0,
      characterCount: Number(extractedResume.characterCount) || 0,
      wordCount: Number(extractedResume.wordCount) || 0,
    };

    /*
  |--------------------------------------------------------------------------
  | Build skill analysis from resume text
  |--------------------------------------------------------------------------
  */

    const detectedSkills = textAnalysis.skills?.all || [];

    const requiredSkills = this.getCareerRequiredSkills(career);

    const matchedSkills = requiredSkills.filter((requiredSkill) =>
      detectedSkills.some(
        (detectedSkill) =>
          this.normalizeString(detectedSkill) ===
          this.normalizeString(requiredSkill),
      ),
    );

    const missingSkills = requiredSkills.filter(
      (requiredSkill) =>
        !detectedSkills.some(
          (detectedSkill) =>
            this.normalizeString(detectedSkill) ===
            this.normalizeString(requiredSkill),
        ),
    );

    const extraSkills = detectedSkills.filter(
      (detectedSkill) =>
        !requiredSkills.some(
          (requiredSkill) =>
            this.normalizeString(requiredSkill) ===
            this.normalizeString(detectedSkill),
        ),
    );

    const skillScore = requiredSkills.length
      ? this.clampScore((matchedSkills.length / requiredSkills.length) * 100)
      : detectedSkills.length
        ? 100
        : 0;

    const skillAnalysis = {
      detected: detectedSkills,
      matched: matchedSkills,
      missing: missingSkills,
      extra: extraSkills,
      score: skillScore,
    };

    /*
  |--------------------------------------------------------------------------
  | Experience analysis from resume text
  |--------------------------------------------------------------------------
  */

    const yearsMentioned = textAnalysis.experience?.yearsMentioned || [];

    let experienceYears = 0;

    const numericYearValues = yearsMentioned
      .map((value) => {
        const match = String(value).match(
          /(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)/i,
        );

        return match ? Number(match[1]) : 0;
      })
      .filter((value) => value > 0);

    if (numericYearValues.length) {
      experienceYears = Math.max(...numericYearValues);
    }

    const experienceLevel = textAnalysis.experience?.sectionFound
      ? experienceYears > 0
        ? "experienced"
        : "beginner"
      : "beginner";

    const experienceScore =
      experienceYears > 0
        ? 85
        : textAnalysis.experience?.sectionFound
          ? 35
          : 20;

    const experienceAnalysis = {
      years: experienceYears,
      level: experienceLevel,
      strengths: textAnalysis.experience?.sectionFound
        ? ["Experience section found in resume."]
        : [],
      gaps: textAnalysis.experience?.sectionFound
        ? []
        : ["Add a clear experience section to your resume."],
      score: experienceScore,
    };

    /*
  |--------------------------------------------------------------------------
  | Project analysis from resume text
  |--------------------------------------------------------------------------
  */

    const projectTotal = Number(textAnalysis.projects?.projectCount || 0);

    const projectAnalysis = {
      total: projectTotal,
      relevant: projectTotal > 0 ? projectTotal : 0,
      strengths:
        projectTotal > 0
          ? [`${projectTotal} project section item(s) found in resume.`]
          : [],
      suggestions:
        projectTotal === 0 ? ["Add at least one relevant project."] : [],
      score: this.clampScore(
        projectTotal > 0 ? Math.min(100, projectTotal * 25) : 0,
      ),
    };

    /*
  |--------------------------------------------------------------------------
  | Education analysis from resume text
  |--------------------------------------------------------------------------
  */

    const detectedDegrees = textAnalysis.education?.detectedDegrees || [];

    const educationDegree = detectedDegrees.length
      ? detectedDegrees.join(", ")
      : "";

    const educationAnalysis = {
      degree: educationDegree,
      branch: "",
      cgpa: null,
      relevant: Boolean(
        textAnalysis.education?.sectionFound && detectedDegrees.length,
      ),
      score: textAnalysis.education?.sectionFound
        ? detectedDegrees.length
          ? 75
          : 50
        : 0,
    };

    /*
  |--------------------------------------------------------------------------
  | ATS analysis
  |--------------------------------------------------------------------------
  */

    const missingSections = textAnalysis.missingSections || [];

    const atsIssues = [];

    if (!textAnalysis.metrics?.hasSkills) {
      atsIssues.push("Skills section is missing.");
    }

    if (!textAnalysis.metrics?.hasProjects) {
      atsIssues.push("Projects section is missing.");
    }

    if (!textAnalysis.metrics?.hasEducation) {
      atsIssues.push("Education section is missing.");
    }

    if (!textAnalysis.metrics?.hasExperience) {
      atsIssues.push("Experience section is missing.");
    }

    const atsSuggestions = [];

    missingSections.forEach((section) => {
      atsSuggestions.push(`Consider adding a clear ${section} section.`);
    });

    const atsScore = this.clampScore(100 - atsIssues.length * 15);

    const atsAnalysis = {
      compatible: atsScore >= 70,
      score: atsScore,
      issues: atsIssues,
      suggestions: atsSuggestions,
    };

    /*
  |--------------------------------------------------------------------------
  | Keyword analysis
  |--------------------------------------------------------------------------
  */

    const keywordAnalysis = {
      matched: matchedSkills,
      missing: missingSkills,
      important: requiredSkills,
      score: skillScore,
    };

    /*
  |--------------------------------------------------------------------------
  | Career alignment
  |--------------------------------------------------------------------------
  */

    const careerAlignment = this.calculateCareerAlignment(skillAnalysis);

    /*
  |--------------------------------------------------------------------------
  | Suggestions
  |--------------------------------------------------------------------------
  */

    const suggestions = this.generateSuggestions({
      skillAnalysis,
      projectAnalysis,
      educationAnalysis,
      experienceAnalysis,
      atsAnalysis,
      keywordAnalysis,
    });

    /*
  |--------------------------------------------------------------------------
  | Overall score
  |--------------------------------------------------------------------------
  */

    const overallScore = this.calculateAverage([
      atsAnalysis.score,
      skillAnalysis.score,
      experienceAnalysis.score,
      projectAnalysis.score,
      educationAnalysis.score,
      keywordAnalysis.score,
    ]);

    /*
  |--------------------------------------------------------------------------
  | Save complete text-based analysis
  |--------------------------------------------------------------------------
  */

    analysis.score = {
      overall: this.clampScore(overallScore),
      ats: atsAnalysis.score,
      skills: skillAnalysis.score,
      experience: experienceAnalysis.score,
      projects: projectAnalysis.score,
      education: educationAnalysis.score,
      formatting: atsAnalysis.score,
      keywords: keywordAnalysis.score,
    };

    analysis.skills = {
      detected: skillAnalysis.detected,
      matched: skillAnalysis.matched,
      missing: skillAnalysis.missing,
      extra: skillAnalysis.extra,
    };

    analysis.keywords = {
      matched: keywordAnalysis.matched,
      missing: keywordAnalysis.missing,
      important: keywordAnalysis.important,
    };

    analysis.experience = {
      years: experienceAnalysis.years,
      level: experienceAnalysis.level,
      strengths: experienceAnalysis.strengths,
      gaps: experienceAnalysis.gaps,
    };

    analysis.projects = {
      total: projectAnalysis.total,
      relevant: projectAnalysis.relevant,
      strengths: projectAnalysis.strengths,
      suggestions: projectAnalysis.suggestions,
    };

    analysis.education = {
      degree: educationAnalysis.degree,
      branch: educationAnalysis.branch,
      cgpa: educationAnalysis.cgpa,
      relevant: educationAnalysis.relevant,
    };

    analysis.atsAnalysis = {
      compatible: atsAnalysis.compatible,
      score: atsAnalysis.score,
      issues: atsAnalysis.issues,
      suggestions: atsAnalysis.suggestions,
    };

    analysis.careerAlignment = careerAlignment;
    analysis.suggestions = suggestions;

    analysis.strengths = [
      detectedSkills.length
        ? `Detected ${detectedSkills.length} skill(s) from resume text.`
        : null,

      matchedSkills.length
        ? `Matched ${matchedSkills.length} career skill(s).`
        : null,

      projectTotal ? `${projectTotal} project section item(s) found.` : null,

      educationAnalysis.relevant ? "Education information is available." : null,

      textAnalysis.metrics?.hasExperience
        ? "Experience section is available."
        : null,
    ].filter(Boolean);

    analysis.weaknesses = [
      missingSkills.length
        ? `${missingSkills.length} required career skill(s) are missing.`
        : null,

      projectTotal === 0 ? "No projects were detected in the resume." : null,

      !textAnalysis.metrics?.hasExperience
        ? "Experience section is missing."
        : null,

      missingSections.length
        ? `${missingSections.length} important resume section(s) are missing.`
        : null,
    ].filter(Boolean);

    /*
  |--------------------------------------------------------------------------
  | Analysis completed
  |--------------------------------------------------------------------------
  */

    analysis.status = "completed";
    analysis.analysisError = "";
    analysis.lastAnalyzedAt = new Date();

    analysis.aiAnalysis = {
      enabled: false,
      model: "",
      analyzedBy: "Rule-Based Resume Text Analyzer",
    };

    await analysis.save();

    return this.buildAnalysisDashboard(analysis, career);
  }

  async updateSuggestion(userId, suggestionId, completed) {
    const analysis = await ResumeAnalysis.findOne({
      user: userId,
    });

    if (!analysis) {
      throw new Error("Resume analysis not found.");
    }

    const suggestion = analysis.suggestions.id(suggestionId);

    if (!suggestion) {
      throw new Error("Resume suggestion not found.");
    }

    suggestion.completed = Boolean(completed);

    await analysis.save();

    const career = analysis.targetCareer
      ? await Career.findById(analysis.targetCareer)
      : null;

    return this.buildAnalysisDashboard(analysis, career);
  }

  buildAnalysisDashboard(analysis, career) {
    return {
      id: analysis?._id,

      targetCareer: career
        ? {
            id: career._id,
            name: career.name,
            careerId: career.careerId,
            slug: career.slug,
          }
        : null,

      targetRole: analysis?.targetRole || career?.name || "",

      resume: {
        fileName: analysis?.resume?.fileName || "",
        fileUrl: analysis?.resume?.fileUrl || "",
        fileType: analysis?.resume?.fileType || "",
        fileSize: analysis?.resume?.fileSize || 0,
        uploaded: Boolean(analysis?.resume?.uploaded),
        uploadedAt: analysis?.resume?.uploadedAt || null,

        extracted: Boolean(analysis?.resume?.extractedText),

        pageCount: analysis?.resume?.pageCount || 0,

        characterCount: analysis?.resume?.characterCount || 0,

        wordCount: analysis?.resume?.wordCount || 0,
      },

      score: analysis?.score || {},

      skills: analysis?.skills || {},

      keywords: analysis?.keywords || {},

      experience: analysis?.experience || {},

      projects: analysis?.projects || {},

      education: analysis?.education || {},

      atsAnalysis: analysis?.atsAnalysis || {},

      strengths: analysis?.strengths || [],

      weaknesses: analysis?.weaknesses || [],

      suggestions: analysis?.suggestions || [],

      careerAlignment: analysis?.careerAlignment || {},

      status: analysis?.status || "not_analyzed",

      analysisError: analysis?.analysisError || "",

      lastAnalyzedAt: analysis?.lastAnalyzedAt || null,

      aiAnalysis: analysis?.aiAnalysis || {},
    };
  }
}

module.exports = new ResumeAnalyzerService();
