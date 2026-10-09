const mongoose = require("mongoose");

const User = require("../models/User");
const Career = require("../models/Career");
const Placement = require("../models/Placement");

class PlacementService {
  /**
   * ---------------------------------------------------------
   * Helper: Validate MongoDB ObjectId
   * ---------------------------------------------------------
   */
  isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
  }

  /**
   * ---------------------------------------------------------
   * Helper: Get User
   * ---------------------------------------------------------
   */
  async getUser(userId) {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found.");
    }

    return user;
  }

  /**
   * ---------------------------------------------------------
   * Helper: Resolve Selected Career
   * ---------------------------------------------------------
   */
  async getSelectedCareer(user) {
    const careerId = user?.selectedCareer;

    if (!careerId) {
      throw new Error("Please select a career before accessing placement.");
    }

    const career = await Career.findById(careerId).populate("category");

    if (!career) {
      throw new Error("Selected career not found.");
    }

    return career;
  }

  /**
   * ---------------------------------------------------------
   * Helper: Calculate Project Readiness
   * ---------------------------------------------------------
   */
  calculateProjectReadiness(user, placement) {
    const userProjects = user?.professional?.projects || [];

    const placementTotal = placement?.projects?.total || 0;
    const placementCompleted = placement?.projects?.completed || 0;

    const totalProjects =
      placementTotal > 0 ? placementTotal : userProjects.length;

    const completedProjects =
      placementCompleted > 0
        ? Math.min(placementCompleted, totalProjects)
        : userProjects.length;

    if (totalProjects === 0) {
      return 0;
    }

    return Math.min(100, Math.round((completedProjects / totalProjects) * 100));
  }

  /**
   * ---------------------------------------------------------
   * Helper: Calculate Resume Readiness
   * ---------------------------------------------------------
   */
  calculateResumeReadiness(user, placement) {
    const resumeScore = placement?.resume?.score || 0;

    if (resumeScore > 0) {
      return Math.min(100, resumeScore);
    }

    if (user?.professional?.resumeUrl) {
      return 50;
    }

    return 0;
  }

  /**
   * ---------------------------------------------------------
   * Helper: Calculate Interview Readiness
   * ---------------------------------------------------------
   */
  calculateInterviewReadiness(user, placement) {
    const storedScore = placement?.interview?.lastScore || 0;

    if (storedScore > 0) {
      return Math.min(100, storedScore);
    }

    const userReadiness = user?.placement?.interviewReadiness;

    if (typeof userReadiness === "number") {
      return Math.min(100, Math.max(0, userReadiness));
    }

    return 0;
  }

  /**
   * ---------------------------------------------------------
   * Helper: Calculate DSA Readiness
   * ---------------------------------------------------------
   */
  calculateDsaReadiness(user, placement) {
    const solved = placement?.dsa?.questionsSolved || 0;

    if (solved >= 100) {
      return 100;
    }

    if (solved > 0) {
      return Math.min(100, Math.round((solved / 100) * 100));
    }

    const dsaLevel = user?.placement?.dsaLevel;

    const levelScores = {
      not_started: 0,
      beginner: 25,
      intermediate: 60,
      advanced: 85,
    };

    return levelScores[dsaLevel] ?? 0;
  }

  /**
   * ---------------------------------------------------------
   * Helper: Calculate Technical Skill Readiness
   * ---------------------------------------------------------
   */
  calculateTechnicalReadiness(user, career, placement) {
    const requiredSkills = career?.skills || [];

    const completedSkills = placement?.skills?.completed || [];

    if (requiredSkills.length === 0) {
      return placement?.readiness?.technicalSkills || 0;
    }

    const normalizedCompleted = completedSkills.map((skill) =>
      String(skill).trim().toLowerCase(),
    );

    const userSkills = user?.professional?.skills || [];

    const normalizedUserSkills = userSkills.map((skill) =>
      String(skill).trim().toLowerCase(),
    );

    let matchedSkills = 0;

    requiredSkills.forEach((skill) => {
      const normalizedSkill = String(skill).trim().toLowerCase();

      if (
        normalizedCompleted.includes(normalizedSkill) ||
        normalizedUserSkills.includes(normalizedSkill)
      ) {
        matchedSkills += 1;
      }
    });

    return Math.min(
      100,
      Math.round((matchedSkills / requiredSkills.length) * 100),
    );
  }

  /**
   * ---------------------------------------------------------
   * Helper: Calculate Communication Readiness
   * ---------------------------------------------------------
   */
  calculateCommunicationReadiness(user, placement) {
    if (
      typeof placement?.readiness?.communication === "number" &&
      placement.readiness.communication > 0
    ) {
      return placement.readiness.communication;
    }

    return 0;
  }

  /**
   * ---------------------------------------------------------
   * Helper: Calculate Overall Placement Readiness
   * ---------------------------------------------------------
   */
  calculateOverallReadiness(readiness) {
    const values = [
      readiness.technicalSkills,
      readiness.dsa,
      readiness.projects,
      readiness.resume,
      readiness.interview,
      readiness.communication,
    ];

    const validValues = values.filter((value) => typeof value === "number");

    if (validValues.length === 0) {
      return 0;
    }

    return Math.round(
      validValues.reduce((sum, value) => sum + value, 0) / validValues.length,
    );
  }

  /**
   * ---------------------------------------------------------
   * Helper: Generate Skill Gaps
   * ---------------------------------------------------------
   */
  generateSkillGaps(career, user, placement) {
    const requiredSkills = career?.skills || [];

    const completedSkills = [
      ...(placement?.skills?.completed || []),
      ...(user?.professional?.skills || []),
    ].map((skill) => String(skill).trim().toLowerCase());

    const existingGaps = placement?.skillGaps || [];

    return requiredSkills
      .filter(
        (skill) =>
          !completedSkills.includes(String(skill).trim().toLowerCase()),
      )
      .map((skill) => {
        const existingGap = existingGaps.find(
          (gap) =>
            String(gap.skill).trim().toLowerCase() ===
            String(skill).trim().toLowerCase(),
        );

        return {
          skill,
          priority: existingGap?.priority || "medium",
          reason:
            existingGap?.reason || `This skill is required for ${career.name}.`,
          completed: false,
        };
      });
  }

  /**
   * ---------------------------------------------------------
   * Helper: Generate Placement Status
   * ---------------------------------------------------------
   */
  getPlacementStatus(overallReadiness) {
    if (overallReadiness >= 80) {
      return "ready";
    }

    if (overallReadiness > 0) {
      return "in_progress";
    }

    return "not_started";
  }

  /**
   * ---------------------------------------------------------
   * Helper: Generate Next Action
   * ---------------------------------------------------------
   */
  generateNextAction(readiness, skillGaps) {
    if (readiness.technicalSkills < 60 && skillGaps.length > 0) {
      return {
        title: `Improve ${skillGaps[0].skill}`,
        description: `Focus on ${skillGaps[0].skill} because it is currently one of your important skill gaps.`,
        category: "skills",
        priority: skillGaps[0].priority || "high",
      };
    }

    if (readiness.dsa < 60) {
      return {
        title: "Practice DSA",
        description:
          "Improve your DSA problem-solving ability by practicing arrays, strings and searching problems.",
        category: "dsa",
        priority: "high",
      };
    }

    if (readiness.projects < 60) {
      return {
        title: "Improve your projects",
        description:
          "Complete and polish projects that demonstrate your technical skills.",
        category: "projects",
        priority: "high",
      };
    }

    if (readiness.resume < 60) {
      return {
        title: "Improve your resume",
        description:
          "Analyze and improve your resume according to your target role.",
        category: "resume",
        priority: "medium",
      };
    }

    if (readiness.interview < 60) {
      return {
        title: "Start interview preparation",
        description:
          "Practice technical and HR interview questions for your target role.",
        category: "interview",
        priority: "high",
      };
    }

    if (readiness.communication < 60) {
      return {
        title: "Improve communication",
        description:
          "Practice explaining your projects, skills and technical concepts clearly.",
        category: "communication",
        priority: "medium",
      };
    }

    return {
      title: "Start applying for jobs",
      description:
        "Your basic placement preparation is progressing well. Start preparing for real job applications.",
      category: "other",
      priority: "medium",
    };
  }

  /**
   * ---------------------------------------------------------
   * Helper: Create Default Checklist
   * ---------------------------------------------------------
   */
  createDefaultChecklist() {
    return [
      {
        title: "Complete required technical skills",
        category: "skills",
        completed: false,
      },
      {
        title: "Practice DSA regularly",
        category: "dsa",
        completed: false,
      },
      {
        title: "Build placement-ready projects",
        category: "projects",
        completed: false,
      },
      {
        title: "Prepare and analyze resume",
        category: "resume",
        completed: false,
      },
      {
        title: "Practice technical interviews",
        category: "interview",
        completed: false,
      },
      {
        title: "Practice communication",
        category: "communication",
        completed: false,
      },
    ];
  }

  /**
   * ---------------------------------------------------------
   * STEP 1: Create Placement Profile
   * ---------------------------------------------------------
   */
  async createPlacementProfile(userId) {
    const user = await this.getUser(userId);
    const career = await this.getSelectedCareer(user);

    let placement = await Placement.findOne({
      user: user._id,
    });

    if (placement) {
      return placement;
    }

    const placementData = {
      user: user._id,
      targetCareer: career._id,

      targetRole: user?.placement?.targetRole || career.name || "",

      dreamCompany: user?.placement?.dreamCompany || "",

      skills: {
        required: career.skills || [],
        completed: user?.professional?.skills || [],
        missing: [],
      },

      dsa: {
        level: user?.placement?.dsaLevel || "not_started",
      },

      projects: {
        total: user?.professional?.projects?.length || 0,
        completed: user?.professional?.projects?.length || 0,
      },

      resume: {
        uploaded: Boolean(user?.professional?.resumeUrl),
      },

      interview: {
        mockInterviews: 0,
        completed: 0,
        lastScore: 0,
      },

      checklist: this.createDefaultChecklist(),
    };

    placement = await Placement.create(placementData);

    return placement;
  }

  /**
   * ---------------------------------------------------------
   * STEP 2: Get Placement Dashboard
   * ---------------------------------------------------------
   */
  async getPlacement(userId) {
    const user = await this.getUser(userId);
    const career = await this.getSelectedCareer(user);

    let placement = await Placement.findOne({
      user: user._id,
    });

    if (!placement) {
      placement = await this.createPlacementProfile(userId);
    }

    /**
     * If user changes career later,
     * keep Placement connected to the new selected career.
     */
    if (
      !placement.targetCareer ||
      String(placement.targetCareer) !== String(career._id)
    ) {
      placement.targetCareer = career._id;

      placement.targetRole = career.name || user?.placement?.targetRole || "";

      placement.skills.required = career.skills || [];

      await placement.save();
    }

    const readiness = {
      technicalSkills: this.calculateTechnicalReadiness(
        user,
        career,
        placement,
      ),

      dsa: this.calculateDsaReadiness(user, placement),

      projects: this.calculateProjectReadiness(user, placement),

      resume: this.calculateResumeReadiness(user, placement),

      interview: this.calculateInterviewReadiness(user, placement),

      communication: this.calculateCommunicationReadiness(user, placement),
    };

    readiness.overall = this.calculateOverallReadiness(readiness);

    const skillGaps = this.generateSkillGaps(career, user, placement);

    const nextAction = this.generateNextAction(readiness, skillGaps);

    const status = this.getPlacementStatus(readiness.overall);

    /**
     * Keep calculated values in MongoDB.
     */
    placement.readiness = readiness;

    placement.skills.required = career.skills || [];

    placement.skills.completed = user?.professional?.skills || [];

    placement.skills.missing = skillGaps.map((gap) => gap.skill);

    placement.skillGaps = skillGaps;

    placement.nextAction = nextAction;

    placement.status = status;

    await placement.save();

    return {
      placementId: placement._id,

      career: {
        id: career._id,
        name: career.name,
        slug: career.slug,
        description: career.description,
        skills: career.skills || [],
        category: career.category,
      },

      targetRole:
        placement.targetRole || career.name || user?.placement?.targetRole,

      dreamCompany:
        placement.dreamCompany || user?.placement?.dreamCompany || "",

      status,

      readiness,

      skills: {
        required: career.skills || [],
        completed: placement.skills.completed || [],
        missing: placement.skills.missing || [],
      },

      dsa: placement.dsa,

      projects: placement.projects,

      resume: placement.resume,

      interview: placement.interview,

      skillGaps,

      checklist: placement.checklist || [],

      nextAction,

      updatedAt: placement.updatedAt,
    };
  }

  /**
   * ---------------------------------------------------------
   * STEP 3: Update Target Role / Company
   * ---------------------------------------------------------
   */
  async updateTarget(userId, data = {}) {
    const user = await this.getUser(userId);

    let placement = await Placement.findOne({
      user: user._id,
    });

    if (!placement) {
      placement = await this.createPlacementProfile(userId);
    }

    if (typeof data.targetRole === "string") {
      placement.targetRole = data.targetRole.trim();
    }

    if (typeof data.dreamCompany === "string") {
      placement.dreamCompany = data.dreamCompany.trim();
    }

    await placement.save();

    return placement;
  }

  /**
   * ---------------------------------------------------------
   * STEP 4: Update DSA Progress
   * ---------------------------------------------------------
   */
  async updateDsa(userId, data = {}) {
    const user = await this.getUser(userId);

    let placement = await Placement.findOne({
      user: user._id,
    });

    if (!placement) {
      placement = await this.createPlacementProfile(userId);
    }

    if (data.level) {
      placement.dsa.level = data.level;
    }

    if (typeof data.questionsSolved === "number" && data.questionsSolved >= 0) {
      placement.dsa.questionsSolved = data.questionsSolved;
    }

    if (Array.isArray(data.topicsCompleted)) {
      placement.dsa.topicsCompleted = data.topicsCompleted;
    }

    await placement.save();

    return placement;
  }

  /**
   * ---------------------------------------------------------
   * STEP 5: Update Resume Readiness
   * ---------------------------------------------------------
   */
  async updateResume(userId, data = {}) {
    const user = await this.getUser(userId);

    let placement = await Placement.findOne({
      user: user._id,
    });

    if (!placement) {
      placement = await this.createPlacementProfile(userId);
    }

    if (typeof data.uploaded === "boolean") {
      placement.resume.uploaded = data.uploaded;
    }

    if (
      typeof data.score === "number" &&
      data.score >= 0 &&
      data.score <= 100
    ) {
      placement.resume.score = data.score;
    }

    placement.resume.lastAnalyzedAt = new Date();

    await placement.save();

    return placement;
  }

  /**
   * ---------------------------------------------------------
   * STEP 6: Update Interview Readiness
   * ---------------------------------------------------------
   */
  async updateInterview(userId, data = {}) {
    const user = await this.getUser(userId);

    let placement = await Placement.findOne({
      user: user._id,
    });

    if (!placement) {
      placement = await this.createPlacementProfile(userId);
    }

    if (typeof data.mockInterviews === "number" && data.mockInterviews >= 0) {
      placement.interview.mockInterviews = data.mockInterviews;
    }

    if (typeof data.completed === "number" && data.completed >= 0) {
      placement.interview.completed = data.completed;
    }

    if (
      typeof data.lastScore === "number" &&
      data.lastScore >= 0 &&
      data.lastScore <= 100
    ) {
      placement.interview.lastScore = data.lastScore;
    }

    await placement.save();

    return placement;
  }

  /**
   * ---------------------------------------------------------
   * STEP 7: Update Checklist Item
   * ---------------------------------------------------------
   */
  async updateChecklistItem(userId, checklistId, completed) {
    const user = await this.getUser(userId);

    const placement = await Placement.findOne({
      user: user._id,
    });

    if (!placement) {
      throw new Error("Placement profile not found.");
    }

    const item = placement.checklist.id(checklistId);

    if (!item) {
      throw new Error("Placement checklist item not found.");
    }

    item.completed = Boolean(completed);

    item.completedAt = item.completed ? new Date() : null;

    await placement.save();

    return item;
  }
}

module.exports = new PlacementService();
