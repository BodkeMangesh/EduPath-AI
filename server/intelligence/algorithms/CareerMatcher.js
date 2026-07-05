const careerKnowledgeBase = require("../knowledge/careerKnowledgeBase");

class CareerMatcher {
  async match(assessment, skillAnalysis) {
    const userSkills = (assessment.technicalSkills || []).map((skill) =>
      skill.skill.toLowerCase(),
    );

    const matches = careerKnowledgeBase.map((career) => {
      const requiredSkills = career.requiredSkills.map((skill) =>
        skill.toLowerCase(),
      );

      const matchedSkills = requiredSkills.filter((skill) =>
        userSkills.includes(skill),
      );

      const missingSkills = requiredSkills.filter(
        (skill) => !userSkills.includes(skill),
      );

      const matchPercentage = Math.round(
        (matchedSkills.length / requiredSkills.length) * 100,
      );

      return {
        careerId: career.id,
        careerTitle: career.title,
        category: career.category,
        matchPercentage,
        matchedSkills,
        missingSkills,
        roadmapDuration: career.roadmapDuration,
        recommendedStudyHours: career.recommendedStudyHours,
        difficulty: career.difficulty,
      };
    });

    // Sort by best match
    matches.sort((a, b) => b.matchPercentage - a.matchPercentage);

    return {
      recommendedCareer: matches[0],
      alternativeCareers: matches.slice(1, 4),
    };
  }
}

module.exports = new CareerMatcher();
