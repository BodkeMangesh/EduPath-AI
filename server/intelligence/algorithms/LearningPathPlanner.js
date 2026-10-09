const Career = require("../../models/Career");

class LearningPathPlanner {
  async generate(user, careerAnalysis) {
    const recommendedCareer = careerAnalysis?.recommendedCareer;

    if (!recommendedCareer) {
      return {
        career: null,
        estimatedDuration: "",
        phases: [],
        nextTopic: null,
        nextProject: null,
      };
    }

    /*
     * ----------------------------------------------------
     * Find Career From MongoDB
     * ----------------------------------------------------
     *
     * Career can be identified by:
     * - careerId
     * - slug
     * - MongoDB _id
     *
     * The Career model/service already stores the
     * career-specific roadmap inside career.roadmap[].
     */

    const careerIdentifier =
      recommendedCareer.careerId ||
      recommendedCareer.slug ||
      recommendedCareer._id;

    if (!careerIdentifier) {
      throw new Error("Career identifier is missing.");
    }

    const careerQuery = [];

    careerQuery.push({ careerId: careerIdentifier });
    careerQuery.push({ slug: careerIdentifier });

    if (typeof careerIdentifier === "string") {
      const mongoose = require("mongoose");

      if (mongoose.Types.ObjectId.isValid(careerIdentifier)) {
        careerQuery.push({ _id: careerIdentifier });
      }
    }

    const career = await Career.findOne({
      $or: careerQuery,
      isActive: true,
    }).lean();

    if (!career) {
      throw new Error("Career roadmap not found.");
    }

    /*
     * ----------------------------------------------------
     * User Skills
     * ----------------------------------------------------
     *
     * Skills come from the user's current profile.
     */

    const userSkills = Array.isArray(user?.professional?.skills)
      ? user.professional.skills.map((skill) =>
          String(skill).trim().toLowerCase(),
        )
      : [];

    /*
     * ----------------------------------------------------
     * Build Dynamic Career Roadmap
     * ----------------------------------------------------
     *
     * The roadmap comes directly from MongoDB:
     *
     * career.roadmap[]
     *
     * No hardcoded career roadmap is used here.
     */

    const roadmap = Array.isArray(career.roadmap) ? career.roadmap : [];

    const phases = roadmap.map((phase) => {
      const topics = Array.isArray(phase.topics) ? phase.topics : [];

      const completedTopics = [];
      const pendingTopics = [];

      topics.forEach((topic) => {
        const normalizedTopic = String(topic).trim().toLowerCase();

        if (userSkills.includes(normalizedTopic)) {
          completedTopics.push(topic);
        } else {
          pendingTopics.push(topic);
        }
      });

      const completion =
        topics.length === 0
          ? 0
          : Math.round((completedTopics.length / topics.length) * 100);

      return {
        phase: phase.phase,
        title: phase.title,
        duration: phase.duration || "",
        topics,
        projects: Array.isArray(phase.projects) ? phase.projects : [],
        interviewTopics: Array.isArray(phase.interviewTopics)
          ? phase.interviewTopics
          : [],
        completedTopics,
        pendingTopics,
        completion,
      };
    });

    /*
     * ----------------------------------------------------
     * Find Next Topic
     * ----------------------------------------------------
     */

    let nextTopic = null;

    for (const phase of phases) {
      if (phase.pendingTopics.length > 0) {
        nextTopic = phase.pendingTopics[0];
        break;
      }
    }

    /*
     * ----------------------------------------------------
     * Find Next Project
     * ----------------------------------------------------
     */

    let nextProject = null;

    for (const phase of phases) {
      if (phase.projects.length > 0) {
        nextProject = phase.projects[0];
        break;
      }
    }

    /*
     * ----------------------------------------------------
     * Final Learning Path
     * ----------------------------------------------------
     */

    return {
      career: career.name,
      estimatedDuration: "",
      phases,
      nextTopic,
      nextProject,
    };
  }
}

module.exports = new LearningPathPlanner();
