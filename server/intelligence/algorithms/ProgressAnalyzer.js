class ProgressAnalyzer {
  async analyze(assessment, careerAnalysis) {
    const readiness = careerAnalysis?.recommendedCareer?.matchPercentage || 0;

    let level = "Beginner";

    if (readiness >= 80) {
      level = "Advanced";
    } else if (readiness >= 60) {
      level = "Intermediate";
    }

    return {
      careerReadiness: readiness,
      level,
      completedPercentage: readiness,
      nextMilestone:
        readiness >= 80
          ? "Start Interview Preparation"
          : "Complete Missing Skills",
    };
  }
}

module.exports = new ProgressAnalyzer();
