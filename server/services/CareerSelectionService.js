const mongoose = require("mongoose");

const User = require("../models/User");
const Career = require("../models/Career");
const CareerExplorerService = require("../services/CareerExploreService");

class CareerSelectionService {
  normalize(value) {
    return String(value || "")
      .trim()
      .toLowerCase();
  }

  normalizeArray(values = []) {
    if (!Array.isArray(values)) {
      return [];
    }

    return values.map((value) => this.normalize(value)).filter(Boolean);
  }

  getCareerIdentifier(career) {
    return {
      id: career?._id?.toString() || career?.id || "",
      name: career?.name || "",
      slug: career?.slug || "",
    };
  }

  buildCareerSelectionSummary(career, explorerData = {}) {
    const selectedCareer = explorerData?.career || career;

    const match = explorerData?.match || {};
    const skillMatch = match?.skillMatch || {};

    const readiness =
      typeof explorerData?.readiness === "number" ? explorerData.readiness : 0;

    const roadmapProgress = explorerData?.roadmapProgress || {};

    const requiredSkills = Array.isArray(selectedCareer?.skills)
      ? selectedCareer.skills
      : [];

    const missingSkills = Array.isArray(skillMatch?.missingSkills)
      ? skillMatch.missingSkills
      : [];

    const matchedSkills = Array.isArray(skillMatch?.matchedSkills)
      ? skillMatch.matchedSkills
      : [];

    return {
      career: {
        ...this.getCareerIdentifier(selectedCareer),
        category: selectedCareer?.category || null,
        description: selectedCareer?.description || "",
        requiredSkills,
        eligibility: selectedCareer?.eligibility || [],
        averageSalary: selectedCareer?.averageSalary || "",
        growthRate: selectedCareer?.growthRate || "",
        demand: selectedCareer?.demand || "",
        tags: selectedCareer?.tags || [],
        roadmap: selectedCareer?.roadmap || [],
      },

      decisionSupport: {
        matchScore: match?.score || 0,
        matchLevel: match?.level || "Needs Exploration",

        confidence:
          typeof match?.score === "number"
            ? Math.min(100, Math.max(0, match.score))
            : 0,

        goalMatch: match?.goalMatch || 0,
        interestMatch: match?.interestMatch || 0,

        eligibilityMatch: {
          score: match?.eligibilityMatch?.score || 0,
          matched: Boolean(match?.eligibilityMatch?.matched),
          reason: match?.eligibilityMatch?.reason || "",
        },

        explanation: match?.reason || "",
      },

      skillTransformation: {
        totalRequiredSkills: requiredSkills.length,
        matchedSkills,
        missingSkills,
        skillMatchPercentage: skillMatch?.skillMatchPercentage || 0,
      },

      readiness: {
        score: readiness,
        roadmapCompletion: roadmapProgress?.completion || 0,
        completedPhases: roadmapProgress?.completedPhases || 0,
        totalPhases: roadmapProgress?.totalPhases || 0,
        currentPhase: roadmapProgress?.currentPhase || 0,
      },

      nextAction: explorerData?.nextAction || null,

      journey: {
        roadmap: selectedCareer?.roadmap || [],
        totalPhases: Array.isArray(selectedCareer?.roadmap)
          ? selectedCareer.roadmap.length
          : 0,
      },
    };
  }

  async findCareer(careerIdentifier) {
    if (!careerIdentifier) {
      throw new Error("Career identifier is required.");
    }

    const identifier = String(careerIdentifier).trim();

    let career = null;

    if (mongoose.Types.ObjectId.isValid(identifier)) {
      career = await Career.findById(identifier).populate(
        "category",
        "name slug icon",
      );
    }

    if (!career) {
      career = await Career.findOne({
        $or: [{ careerId: identifier }, { slug: identifier.toLowerCase() }],
        isActive: true,
      }).populate("category", "name slug icon");
    }

    if (!career) {
      throw new Error("Career not found.");
    }

    if (career.isActive === false) {
      throw new Error("This career is currently unavailable.");
    }

    return career;
  }

  async getCareerSelection(userId, careerIdentifier = null) {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found.");
    }

    const selectedCareerIdentifier =
      careerIdentifier || user?.selectedCareer?.toString() || null;

    if (!selectedCareerIdentifier) {
      const recommendations = await CareerExplorerService.getRecommendedCareers(
        userId,
        {
          limit: 3,
        },
      );

      return {
        hasSelectedCareer: false,
        career: null,
        decisionSupport: null,
        skillTransformation: null,
        readiness: null,
        nextAction: null,
        recommendations,
      };
    }

    const career = await this.findCareer(selectedCareerIdentifier);

    const explorerData = await CareerExplorerService.getCareerDetails(
      userId,
      career._id.toString(),
    );

    return {
      hasSelectedCareer:
        user?.selectedCareer?.toString() === career._id.toString(),

      careerStatus: user?.careerStatus || "not_selected",

      selection: this.buildCareerSelectionSummary(career, explorerData),
    };
  }

  async selectCareer(userId, careerIdentifier) {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found.");
    }

    const career = await this.findCareer(careerIdentifier);

    user.selectedCareer = career._id;
    user.careerStatus = "selected";

    await user.save();

    const explorerData = await CareerExplorerService.getCareerDetails(
      userId,
      career._id.toString(),
    );

    return {
      message: "Career selected successfully.",

      careerStatus: "selected",

      selectedCareer: {
        ...this.getCareerIdentifier(career),
        category: career?.category || null,
        description: career?.description || "",
      },

      selection: this.buildCareerSelectionSummary(career, explorerData),
    };
  }

  async changeCareer(userId, careerIdentifier) {
    return await this.selectCareer(userId, careerIdentifier);
  }

  async getAvailableCareerOptions(userId, limit = 5) {
    const safeLimit = Math.min(Math.max(Number(limit) || 5, 1), 10);

    const recommendations = await CareerExplorerService.getRecommendedCareers(
      userId,
      {
        limit: safeLimit,
      },
    );

    return recommendations;
  }
}

module.exports = new CareerSelectionService();
