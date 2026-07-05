class AIMentorEngine {
  async generate(progress, dashboard) {
    let greeting = "Welcome back!";
    let motivation = "";
    let focus = "";
    let warning = "";
    let careerTip = "";
    let nextAction = "";

    // Motivation
    if (progress.overallCompletion < 25) {
      motivation =
        "You're just getting started. Consistency matters more than speed.";
    } else if (progress.overallCompletion < 60) {
      motivation = "You're making solid progress. Keep building momentum.";
    } else {
      motivation = "Excellent work! You're getting close to your career goal.";
    }

    // Focus
    focus = progress.nextMilestone
      ? `Focus on "${progress.nextMilestone}" next.`
      : "Complete your remaining learning path.";

    // Study streak
    if (progress.currentStreak >= 7) {
      warning = "Fantastic! You're maintaining a great study streak.";
    } else if (progress.currentStreak === 0) {
      warning = "Start your study streak today.";
    } else {
      warning = `Current study streak: ${progress.currentStreak} day(s). Keep it going!`;
    }

    // Career readiness
    if (dashboard.careerReadiness >= 80) {
      careerTip =
        "Start solving interview questions and building portfolio projects.";
    } else if (dashboard.careerReadiness >= 50) {
      careerTip = "Strengthen your core skills before applying for jobs.";
    } else {
      careerTip =
        "Build a strong foundation by completing your roadmap consistently.";
    }

    // Next action
    nextAction =
      progress.pendingTopics.length > 0
        ? `Study "${progress.pendingTopics[0]}" today for at least 2 hours.`
        : "Congratulations! You've completed your roadmap.";

    return {
      greeting,
      motivation,
      focus,
      warning,
      careerTip,
      nextAction,
    };
  }
}

module.exports = new AIMentorEngine();
