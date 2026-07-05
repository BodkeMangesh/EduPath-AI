class ResourceRecommendationEngine {
  async recommend(assessment, careerAnalysis) {
    const missingSkills =
      careerAnalysis?.recommendedCareer?.missingSkills || [];

    const resources = missingSkills.map((skill) => ({
      skill,
      type: "Course",
      provider: "Recommended",
      priority: "High",
    }));

    return resources;
  }
}

module.exports = new ResourceRecommendationEngine();
