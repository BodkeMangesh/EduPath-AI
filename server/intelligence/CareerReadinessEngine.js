class CareerReadinessEngine {
  calculate(progress, assessment) {
    let score = 0;

    // Learning Completion (40%)
    score += progress.overallCompletion * 0.4;

    // Study Streak (20%)
    score += Math.min(progress.currentStreak, 20);

    // Study Hours (15%)
    score += Math.min(progress.totalStudyHours / 2, 15);

    // Projects (15%)
    score += Math.min(progress.completedProjects.length * 5, 15);

    // Assessment (10%)
    score += (assessment?.score || 0) * 0.1;

    score = Math.round(Math.min(score, 100));

    let status = "";
    let message = "";

    if (score >= 80) {
      status = "Job Ready";
      message =
        "Excellent progress! Keep building projects and preparing for interviews.";
    } else if (score >= 60) {
      status = "Intermediate";
      message =
        "You are progressing well. Focus on projects and advanced concepts.";
    } else if (score >= 40) {
      status = "Learning";
      message = "Good foundation. Stay consistent and complete your roadmap.";
    } else {
      status = "Beginner";
      message =
        "Build a daily study habit and complete your current learning phase.";
    }

    const strengths = [];
    const improvements = [];

    if (progress.overallCompletion >= 50)
      strengths.push("Strong learning progress");

    if (progress.currentStreak >= 7) strengths.push("Consistent study habit");

    if (progress.totalStudyHours >= 50)
      strengths.push("Good practical experience");

    if (progress.overallCompletion < 50)
      improvements.push("Complete more learning topics");

    if (progress.currentStreak < 7)
      improvements.push("Increase your study streak");

    if (progress.totalStudyHours < 50)
      improvements.push("Spend more time on practical coding");

    return {
      score,
      status,
      message,
      strengths,
      improvements,
    };
  }
}

module.exports = new CareerReadinessEngine();
