const Career = require("../../models/Career");

class CareerMatcher {
  async match(user, skillAnalysis = {}) {
    try {
      const userSkills = this.normalizeSkills(user?.professional?.skills || []);

      const careers = await Career.find({
        isActive: true,
      }).lean();

      if (!careers.length) {
        return {
          recommendedCareer: null,
          alternativeCareers: [],
        };
      }

      const matches = careers.map((career) => {
        const requiredSkills = this.normalizeSkills(career.skills || []);

        const matchedSkills = requiredSkills.filter((skill) =>
          userSkills.includes(skill),
        );

        const missingSkills = requiredSkills.filter(
          (skill) => !userSkills.includes(skill),
        );

        const matchPercentage =
          requiredSkills.length > 0
            ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
            : 0;

        return {
          careerId: String(career._id),
          careerTitle: career.name,
          category: career.category,
          slug: career.slug,
          description: career.description || "",

          matchPercentage,

          matchedSkills,
          missingSkills,

          roadmapDuration: this.getRoadmapDuration(career.roadmap),

          recommendedStudyHours: user?.aiProfile?.dailyStudyHours || 2,

          difficulty: user?.professional?.experienceLevel || "beginner",
        };
      });

      matches.sort((a, b) => b.matchPercentage - a.matchPercentage);

      return {
        recommendedCareer: matches[0] || null,
        alternativeCareers: matches.slice(1, 4),
      };
    } catch (error) {
      console.error("Career Matcher Error:", error);
      throw new Error("Unable to match careers.");
    }
  }

  normalizeSkills(skills) {
    if (!Array.isArray(skills)) {
      return [];
    }

    return skills
      .filter(Boolean)
      .map((skill) => String(skill).trim().toLowerCase())
      .filter(Boolean);
  }

  getRoadmapDuration(roadmap) {
    if (!Array.isArray(roadmap) || roadmap.length === 0) {
      return "";
    }

    return roadmap
      .map((phase) => phase?.duration)
      .filter(Boolean)
      .join(" + ");
  }
}

module.exports = new CareerMatcher();
