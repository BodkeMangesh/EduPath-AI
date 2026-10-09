class SkillGapAnalyzer {
  async analyze(user) {
    const skills = user?.professional?.skills || [];

    const normalizedSkills = skills
      .filter(Boolean)
      .map((skill) => String(skill).trim())
      .filter(Boolean);

    return {
      overallScore: 0,

      strengths: normalizedSkills,

      weaknesses: [],
    };
  }
}

module.exports = new SkillGapAnalyzer();
