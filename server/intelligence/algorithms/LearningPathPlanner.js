const careerKnowledgeBase = require("../knowledge/careerKnowledgeBase");

class LearningPathPlanner {
  async generate(assessment, careerAnalysis) {
    const recommendedCareer = careerAnalysis.recommendedCareer;

    if (!recommendedCareer) {
      return {
        career: null,
        estimatedDuration: "",
        phases: [],
        nextTopic: null,
        nextProject: null,
      };
    }

    // Find career in knowledge base
    const career = careerKnowledgeBase.find(
      (item) => item.id === recommendedCareer.careerId,
    );

    if (!career) {
      throw new Error("Career roadmap not found.");
    }

    const userSkills = (assessment.technicalSkills || []).map((skill) =>
      skill.skill.toLowerCase(),
    );

    const phases = career.roadmap.map((phase) => {
      const completedTopics = [];
      const pendingTopics = [];

      phase.topics.forEach((topic) => {
        if (userSkills.includes(topic.toLowerCase())) {
          completedTopics.push(topic);
        } else {
          pendingTopics.push(topic);
        }
      });

      const completion =
        phase.topics.length === 0
          ? 0
          : Math.round((completedTopics.length / phase.topics.length) * 100);

      return {
        phase: phase.phase,
        title: phase.title,
        duration: phase.duration,
        completedTopics,
        pendingTopics,
        completion,
      };
    });

    // Find next topic
    let nextTopic = null;

    for (const phase of phases) {
      if (phase.pendingTopics.length > 0) {
        nextTopic = phase.pendingTopics[0];
        break;
      }
    }

    return {
      career: career.title,
      estimatedDuration: career.estimatedDuration,
      phases,
      nextTopic,
      nextProject: career.projects[0],
    };
  }
}

module.exports = new LearningPathPlanner();
