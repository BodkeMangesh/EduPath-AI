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

    return Math.round(Math.min(score, 100));
  }
}

module.exports = new CareerReadinessEngine();
