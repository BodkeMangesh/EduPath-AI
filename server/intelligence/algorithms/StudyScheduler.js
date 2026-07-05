class StudyScheduler {
  async generate(learningPath, userProfile = {}) {
    const studyHours = userProfile.dailyStudyHours || 2;

    const weekDays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    const studyPlan = [];

    const topics = [];

    // Collect all pending topics
    learningPath.phases.forEach((phase) => {
      phase.pendingTopics.forEach((topic) => {
        topics.push(topic);
      });
    });

    let topicIndex = 0;

    for (let i = 0; i < weekDays.length; i++) {
      if (i === 6) {
        studyPlan.push({
          day: weekDays[i],
          topic: "Revision & Practice",
          duration: `${studyHours} Hours`,
        });

        continue;
      }

      studyPlan.push({
        day: weekDays[i],
        topic: topics[topicIndex] || "Project Practice",
        duration: `${studyHours} Hours`,
      });

      topicIndex++;
    }

    return studyPlan;
  }
}

module.exports = new StudyScheduler();
