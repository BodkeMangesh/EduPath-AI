const mongoose = require("mongoose");

const User = require("../models/User");
const Career = require("../models/Career");
const CareerService = require("./CareerService");
const ApiError = require("../utils/ApiError");

class CareerExplorerService {
  static normalize(value) {
    if (value === null || value === undefined) {
      return "";
    }

    return String(value)
      .toLowerCase()
      .trim()
      .replace(/[\-_]+/g, " ")
      .replace(/\s+/g, " ");
  }

  /**
   * Convert a value into a clean unique string array.
   */
  static normalizeArray(value) {
    if (!Array.isArray(value)) {
      return [];
    }

    return [
      ...new Set(
        value
          .map((item) => {
            if (typeof item === "string") {
              return item.trim();
            }

            if (item && typeof item === "object") {
              return item.name || item.title || item.skill || item.value || "";
            }

            return "";
          })
          .filter(Boolean),
      ),
    ];
  }

  /**
   * Normalize user skills.
   */
  static getUserSkills(user) {
    return this.normalizeArray(user?.professional?.skills);
  }

  /**
   * Get user's interests.
   */
  static getUserInterests(user) {
    return this.normalizeArray(user?.aiProfile?.interests);
  }

  /**
   * Get user's career goal.
   */
  static getCareerGoal(user) {
    return String(user?.aiProfile?.careerGoal || "").trim();
  }

  /**
   * Get user's current situation.
   */
  static getCurrentSituation(user) {
    return String(user?.onboarding?.currentSituation || "").trim();
  }

  /**
   * Get user's target role.
   */
  static getTargetRole(user) {
    return String(user?.placement?.targetRole || "").trim();
  }

  /**
   * Get user's dream company.
   */
  static getDreamCompany(user) {
    return String(user?.placement?.dreamCompany || "").trim();
  }

  /**
   * Calculate how many required career skills the user already has.
   *
   * Matching strategy:
   * 1. Exact normalized match
   * 2. One skill contains the other
   *
   * This handles reasonable cases such as:
   * "React.js" <-> "React"
   * "REST APIs" <-> "REST API"
   */
  static calculateSkillMatch(userSkills, careerSkills) {
    const normalizedUserSkills = this.normalizeArray(userSkills).map(
      (skill) => ({
        original: skill,
        normalized: this.normalize(skill),
      }),
    );

    const normalizedCareerSkills = this.normalizeArray(careerSkills).map(
      (skill) => ({
        original: skill,
        normalized: this.normalize(skill),
      }),
    );

    const matchedSkills = [];
    const missingSkills = [];

    for (const careerSkill of normalizedCareerSkills) {
      const matched = normalizedUserSkills.find((userSkill) => {
        if (!userSkill.normalized || !careerSkill.normalized) {
          return false;
        }

        return (
          userSkill.normalized === careerSkill.normalized ||
          userSkill.normalized.includes(careerSkill.normalized) ||
          careerSkill.normalized.includes(userSkill.normalized)
        );
      });

      if (matched) {
        matchedSkills.push(careerSkill.original);
      } else {
        missingSkills.push(careerSkill.original);
      }
    }

    const totalRequiredSkills = normalizedCareerSkills.length;

    const skillMatchPercentage =
      totalRequiredSkills === 0
        ? 0
        : Math.round((matchedSkills.length / totalRequiredSkills) * 100);

    return {
      totalRequiredSkills,
      matchedSkills,
      missingSkills,
      skillMatchPercentage,
    };
  }

  /**
   * Calculate career goal relevance.
   */
  static calculateGoalMatch(user, career) {
    const careerName = this.normalize(career?.name);
    const careerId = this.normalize(career?.careerId);
    const careerSlug = this.normalize(career?.slug);

    const goal = this.normalize(this.getCareerGoal(user));
    const targetRole = this.normalize(this.getTargetRole(user));

    const combinedUserGoal = `${goal} ${targetRole}`.trim();

    if (!combinedUserGoal) {
      return 0;
    }

    if (
      combinedUserGoal.includes(careerName) ||
      combinedUserGoal.includes(careerId) ||
      combinedUserGoal.includes(careerSlug)
    ) {
      return 100;
    }

    const careerWords = [
      ...new Set(
        `${careerName} ${careerId} ${careerSlug}`
          .split(" ")
          .map((word) => word.trim())
          .filter((word) => word.length >= 3),
      ),
    ];

    const userWords = new Set(
      combinedUserGoal
        .split(" ")
        .map((word) => word.trim())
        .filter((word) => word.length >= 3),
    );

    if (!careerWords.length || !userWords.size) {
      return 0;
    }

    const matchedWords = careerWords.filter((word) => userWords.has(word));

    return Math.min(
      100,
      Math.round((matchedWords.length / careerWords.length) * 100),
    );
  }

  /**
   * Calculate interest relevance.
   */
  static calculateInterestMatch(user, career) {
    const interests = this.getUserInterests(user).map((interest) =>
      this.normalize(interest),
    );

    if (!interests.length) {
      return 0;
    }

    const careerText = this.normalize(
      [
        career?.name,
        career?.description,
        ...(career?.tags || []),
        career?.category?.name,
      ].join(" "),
    );

    const matchedInterests = interests.filter((interest) => {
      if (!interest) {
        return false;
      }

      return (
        careerText.includes(interest) ||
        interest
          .split(" ")
          .filter((word) => word.length >= 3)
          .some((word) => careerText.includes(word))
      );
    });

    return Math.min(
      100,
      Math.round((matchedInterests.length / interests.length) * 100),
    );
  }

  /**
   * Calculate education eligibility match.
   *
   * Career eligibility data is stored as free-form strings,
   * so this remains intentionally conservative.
   */
  static calculateEligibilityMatch(user, career) {
    const eligibility = this.normalizeArray(career?.eligibility);

    if (!eligibility.length) {
      return {
        score: 100,
        matched: true,
        reason: "No specific eligibility requirement is defined.",
      };
    }

    const degree = this.normalize(user?.education?.degree);
    const branch = this.normalize(user?.education?.branch);

    const educationText = `${degree} ${branch}`.trim();

    if (!educationText) {
      return {
        score: 50,
        matched: false,
        reason: "Education information is incomplete.",
      };
    }

    const matchedRequirement = eligibility.some((requirement) => {
      const normalizedRequirement = this.normalize(requirement);

      if (!normalizedRequirement) {
        return false;
      }

      return (
        normalizedRequirement.includes(degree) ||
        normalizedRequirement.includes(branch) ||
        educationText.includes(normalizedRequirement)
      );
    });

    if (matchedRequirement) {
      return {
        score: 100,
        matched: true,
        reason: "User education matches at least one listed requirement.",
      };
    }

    /*
     * Do not mark the user as ineligible solely from a text comparison.
     * Eligibility strings may contain broad conditions that cannot be
     * reliably interpreted without structured eligibility data.
     */
    return {
      score: 70,
      matched: false,
      reason:
        "Education should be verified against the specific career requirements.",
    };
  }

  /**
   * Calculate overall career match score.
   *
   * Weight:
   * - Skills: 50%
   * - Career goal / target role: 25%
   * - Interests: 15%
   * - Eligibility: 10%
   */
  static calculateCareerMatch(user, career) {
    const skillMatch = this.calculateSkillMatch(
      this.getUserSkills(user),
      career?.skills,
    );

    const goalMatch = this.calculateGoalMatch(user, career);

    const interestMatch = this.calculateInterestMatch(user, career);

    const eligibilityMatch = this.calculateEligibilityMatch(user, career);

    const score = Math.round(
      skillMatch.skillMatchPercentage * 0.5 +
        goalMatch * 0.25 +
        interestMatch * 0.15 +
        eligibilityMatch.score * 0.1,
    );

    return {
      score: Math.min(100, Math.max(0, score)),
      skillMatch,
      goalMatch,
      interestMatch,
      eligibilityMatch,
    };
  }

  /**
   * Convert score into a human-readable match level.
   */
  static getMatchLevel(score) {
    if (score >= 85) {
      return "Excellent Match";
    }

    if (score >= 70) {
      return "Strong Match";
    }

    if (score >= 55) {
      return "Good Match";
    }

    if (score >= 40) {
      return "Potential Match";
    }

    return "Needs Exploration";
  }

  /**
   * Build a career growth path from the career roadmap.
   */
  static buildGrowthPath(career) {
    if (!Array.isArray(career?.roadmap)) {
      return [];
    }

    return career.roadmap
      .sort((a, b) => Number(a.phase) - Number(b.phase))
      .map((phase) => ({
        phase: phase.phase,
        title: phase.title || "",
        duration: phase.duration || "",
        topics: this.flattenNestedArray(phase.topics),
        projects: this.flattenNestedArray(phase.projects),
        interviewTopics: this.flattenNestedArray(phase.interviewTopics),
      }));
  }

  /**
   * Flatten possible nested arrays created by the existing Career schema.
   */
  static flattenNestedArray(value) {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .flat(Infinity)
      .filter((item) => typeof item === "string" && item.trim())
      .map((item) => item.trim());
  }

  /**
   * Calculate roadmap progress for a selected career.
   */
  static calculateRoadmapProgress(user, career) {
    const completedRoadmaps = Number(user?.progress?.completedRoadmaps || 0);

    const currentProgress = Number(user?.progress?.overallProgress || 0);

    const roadmap = this.buildGrowthPath(career);

    if (!roadmap.length) {
      return {
        totalPhases: 0,
        completedPhases: 0,
        currentPhase: 0,
        completion: Math.min(100, Math.max(0, currentProgress)),
      };
    }

    const totalPhases = roadmap.length;

    const completedPhases = Math.min(
      totalPhases,
      Math.max(0, completedRoadmaps),
    );

    const currentPhase =
      completedPhases >= totalPhases ? totalPhases : completedPhases + 1;

    return {
      totalPhases,
      completedPhases,
      currentPhase,
      completion: Math.min(100, Math.max(0, currentProgress)),
    };
  }

  /**
   * Calculate career readiness.
   *
   * Uses the progress information already stored in User.
   */
  static calculateReadiness(user, careerMatch) {
    const skillScore = careerMatch?.skillMatch?.skillMatchPercentage || 0;

    const learningProgress = Number(user?.progress?.overallProgress || 0);

    const portfolioScore = Number(user?.progress?.portfolioScore || 0);

    const interviewReadiness = Number(user?.placement?.interviewReadiness || 0);

    const careerReadiness = Number(user?.progress?.careerReadiness || 0);

    const score = Math.round(
      skillScore * 0.35 +
        learningProgress * 0.2 +
        portfolioScore * 0.15 +
        interviewReadiness * 0.15 +
        careerReadiness * 0.15,
    );

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Generate a practical next action.
   */
  static getNextAction(user, careerMatch, roadmapProgress) {
    const skillGapCount = careerMatch?.skillMatch?.missingSkills?.length || 0;

    const learningProgress = Number(user?.progress?.overallProgress || 0);

    const portfolioScore = Number(user?.progress?.portfolioScore || 0);

    const interviewReadiness = Number(user?.placement?.interviewReadiness || 0);

    if (skillGapCount > 0 && learningProgress < 70) {
      return {
        type: "skill_gap",
        title: "Close your skill gap",
        description: `Start learning ${careerMatch.skillMatch.missingSkills[0]}.`,
      };
    }

    if (learningProgress < 70) {
      return {
        type: "learning",
        title: "Continue your learning roadmap",
        description: `Continue Phase ${roadmapProgress.currentPhase}.`,
      };
    }

    if (portfolioScore < 60) {
      return {
        type: "project",
        title: "Strengthen your portfolio",
        description: "Build or complete a career-relevant project.",
      };
    }

    if (interviewReadiness < 60) {
      return {
        type: "interview",
        title: "Start interview preparation",
        description:
          "Practice role-specific technical and interview questions.",
      };
    }

    return {
      type: "placement",
      title: "Prepare for placement",
      description:
        "Focus on applications, resume quality and interview practice.",
    };
  }

  /**
   * Build recommendation explanation.
   */
  static buildRecommendationReason(user, career, careerMatch) {
    const reasons = [];

    if (careerMatch.skillMatch.skillMatchPercentage >= 70) {
      reasons.push("your current skills align well with the required skills");
    } else if (careerMatch.skillMatch.skillMatchPercentage >= 40) {
      reasons.push("you already have some of the required skills");
    }

    if (careerMatch.goalMatch >= 70) {
      reasons.push("the career matches your stated career goal");
    }

    if (careerMatch.interestMatch >= 50) {
      reasons.push("the career aligns with your interests");
    }

    if (!reasons.length) {
      reasons.push("this career has potential based on your current profile");
    }

    return `Recommended because ${reasons.join(" and ")}.`;
  }

  /**
   * Build public career information.
   */
  static buildCareerInformation(career) {
    return {
      id: career._id,
      careerId: career.careerId,
      name: career.name,
      slug: career.slug,
      description: career.description || "",
      category: career.category || null,
      requiredSkills: this.normalizeArray(career.skills),
      eligibility: this.normalizeArray(career.eligibility),
      averageSalary: career.averageSalary || "",
      growthRate: career.growthRate || "",
      demand: career.demand || "",
      tags: this.normalizeArray(career.tags),
      roadmap: this.buildGrowthPath(career),
    };
  }

  /**
   * Build the user profile snapshot required by Career Explorer.
   */
  static buildProfileSnapshot(user) {
    return {
      careerGoal: this.getCareerGoal(user),
      currentSituation: this.getCurrentSituation(user),

      education: {
        degree: user?.education?.degree || "",
        branch: user?.education?.branch || "",
        semester: user?.education?.semester || null,
        graduationYear: user?.education?.graduationYear || null,
        cgpa: user?.education?.cgpa || null,
      },

      experienceLevel: user?.professional?.experienceLevel || "",

      skills: this.getUserSkills(user),

      interests: this.getUserInterests(user),

      learningStyle: user?.learningStyle || "",

      placementFocus: user?.placementFocus || "",

      placement: {
        targetRole: this.getTargetRole(user),
        dreamCompany: this.getDreamCompany(user),
        dsaLevel: user?.placement?.dsaLevel || "",
        interviewReadiness: Number(user?.placement?.interviewReadiness || 0),
      },

      progress: {
        overallProgress: Number(user?.progress?.overallProgress || 0),
        careerReadiness: Number(user?.progress?.careerReadiness || 0),
        portfolioScore: Number(user?.progress?.portfolioScore || 0),
        completedRoadmaps: Number(user?.progress?.completedRoadmaps || 0),
        completedAssessments: Number(user?.progress?.completedAssessments || 0),
      },
    };
  }

  /**
   * Find a career by MongoDB ObjectId or careerId/slug.
   */
  static async findCareer(identifier) {
    if (!identifier) {
      throw new ApiError(400, "Career identifier is required.");
    }

    let career = null;

    if (mongoose.Types.ObjectId.isValid(identifier)) {
      career = await Career.findOne({
        _id: identifier,
        isActive: true,
      }).populate("category", "name slug icon");
    }

    if (!career) {
      career = await Career.findOne({
        $or: [{ careerId: identifier }, { slug: identifier }],
        isActive: true,
      }).populate("category", "name slug icon");
    }

    if (!career) {
      throw new ApiError(404, "Career not found.");
    }

    return career;
  }

  /**
   * Get complete Career Explorer profile.
   *
   * This is the main method consumed by the controller.
   */
  static async getExplorerProfile(userId, options = {}) {
    if (!userId) {
      throw new ApiError(401, "User authentication is required.");
    }

    const user = await User.findById(userId).lean();

    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    let selectedCareer = null;

    if (options.careerId) {
      selectedCareer = await this.findCareer(options.careerId);
    } else if (user.selectedCareer) {
      selectedCareer = await Career.findOne({
        _id: user.selectedCareer,
        isActive: true,
      }).populate("category", "name slug icon");
    }

    const profileSnapshot = this.buildProfileSnapshot(user);

    /*
     * If the user has a selected career, build the detailed
     * Career Explorer view around that career.
     */
    if (selectedCareer) {
      const careerMatch = this.calculateCareerMatch(user, selectedCareer);

      const roadmapProgress = this.calculateRoadmapProgress(
        user,
        selectedCareer,
      );

      const readiness = this.calculateReadiness(user, careerMatch);

      return {
        profile: profileSnapshot,

        selectedCareer: {
          ...this.buildCareerInformation(selectedCareer),

          match: {
            score: careerMatch.score,
            level: this.getMatchLevel(careerMatch.score),
            skillMatch: careerMatch.skillMatch,
            goalMatch: careerMatch.goalMatch,
            interestMatch: careerMatch.interestMatch,
            eligibilityMatch: careerMatch.eligibilityMatch,
            reason: this.buildRecommendationReason(
              user,
              selectedCareer,
              careerMatch,
            ),
          },

          readiness,

          roadmapProgress,

          nextAction: this.getNextAction(user, careerMatch, roadmapProgress),
        },

        careerStatus: user.careerStatus || "not_selected",
      };
    }

    /*
     * No selected career yet.
     * Return profile information so the frontend can display
     * recommendations.
     */
    const recommendations = await this.getRecommendedCareers(userId, {
      limit: options.limit || 5,
    });

    return {
      profile: profileSnapshot,
      selectedCareer: null,
      careerStatus: user.careerStatus || "not_selected",
      recommendations,
    };
  }

  /**
   * Get recommended careers for a user.
   */
  static async getRecommendedCareers(userId, options = {}) {
    if (!userId) {
      throw new ApiError(401, "User authentication is required.");
    }

    const user = await User.findById(userId).lean();

    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    const limit = Math.min(Math.max(Number(options.limit) || 5, 1), 20);

    /*
     * Reuse CareerService for fetching active careers rather than
     * duplicating its active-career query.
     *
     * A high limit is used here because recommendation scoring
     * happens after fetching the career catalogue.
     */
    const result = await CareerService.getAllCareers({
      page: 1,
      limit: 1000,
    });

    const scoredCareers = result.careers
      .map((career) => {
        const match = this.calculateCareerMatch(user, career);

        return {
          career: this.buildCareerInformation(career),
          match: {
            score: match.score,
            level: this.getMatchLevel(match.score),
            skillMatch: match.skillMatch.skillMatchPercentage,
            goalMatch: match.goalMatch,
            interestMatch: match.interestMatch,
            missingSkills: match.skillMatch.missingSkills,
            matchedSkills: match.skillMatch.matchedSkills,
            reason: this.buildRecommendationReason(user, career, match),
          },
        };
      })
      .sort((a, b) => b.match.score - a.match.score);

    return scoredCareers.slice(0, limit);
  }

  /**
   * Get skill-gap details for a specific career.
   */
  static async getSkillGap(userId, careerIdentifier) {
    if (!userId) {
      throw new ApiError(401, "User authentication is required.");
    }

    const user = await User.findById(userId).lean();

    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    const career = await this.findCareer(careerIdentifier);

    const skillMatch = this.calculateSkillMatch(
      this.getUserSkills(user),
      career.skills,
    );

    return {
      career: {
        careerId: career.careerId,
        name: career.name,
        slug: career.slug,
      },

      currentSkills: this.getUserSkills(user),

      requiredSkills: this.normalizeArray(career.skills),

      matchedSkills: skillMatch.matchedSkills,

      missingSkills: skillMatch.missingSkills,

      skillMatchPercentage: skillMatch.skillMatchPercentage,

      totalRequiredSkills: skillMatch.totalRequiredSkills,

      nextSkills: skillMatch.missingSkills.slice(0, 5),
    };
  }

  /**
   * Get detailed information for a specific career.
   */
  static async getCareerDetails(userId, careerIdentifier) {
    if (!userId) {
      throw new ApiError(401, "User authentication is required.");
    }

    const user = await User.findById(userId).lean();

    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    const career = await this.findCareer(careerIdentifier);

    const careerMatch = this.calculateCareerMatch(user, career);

    const roadmapProgress = this.calculateRoadmapProgress(user, career);

    const readiness = this.calculateReadiness(user, careerMatch);

    return {
      profile: this.buildProfileSnapshot(user),

      career: this.buildCareerInformation(career),

      match: {
        score: careerMatch.score,
        level: this.getMatchLevel(careerMatch.score),
        skillMatch: careerMatch.skillMatch,
        goalMatch: careerMatch.goalMatch,
        interestMatch: careerMatch.interestMatch,
        eligibilityMatch: careerMatch.eligibilityMatch,
        reason: this.buildRecommendationReason(user, career, careerMatch),
      },

      readiness,

      roadmapProgress,

      nextAction: this.getNextAction(user, careerMatch, roadmapProgress),
    };
  }
}

module.exports = CareerExplorerService;
