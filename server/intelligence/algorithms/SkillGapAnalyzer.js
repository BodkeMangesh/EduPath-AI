class SkillGapAnalyzer {
  async analyze(assessment) {
    const technicalSkills = assessment.technicalSkills || [];

    const strengths = [];
    const weaknesses = [];

    technicalSkills.forEach((skill) => {
      if (skill.score >= 7) {
        strengths.push(skill.skill);
      } else {
        weaknesses.push(skill.skill);
      }
    });

    const overallScore =
      technicalSkills.length > 0
        ? Math.round(
            technicalSkills.reduce((sum, skill) => sum + skill.score, 0) /
              technicalSkills.length,
          )
        : 0;

    return {
      overallScore,
      strengths,
      weaknesses,
    };
  }
}

module.exports = new SkillGapAnalyzer();
