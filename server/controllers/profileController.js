const User = require("../models/User");

/*
|--------------------------------------------------------------------------
| Update Onboarding Profile
|--------------------------------------------------------------------------
| PUT /api/v1/profile/onboarding
|--------------------------------------------------------------------------
*/

exports.updateOnboarding = async (req, res) => {
  try {
    const userId = req.user.id;

    const { role, currentSituation, skills, interests, career, learningPlan } =
      req.body;

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Role
    |--------------------------------------------------------------------------
    */

    if (role !== undefined && role !== "") {
      user.role = role;
    }

    /*
    |--------------------------------------------------------------------------
    | Skills
    |--------------------------------------------------------------------------
    */

    if (Array.isArray(skills)) {
      user.professional.skills = skills;
    }

    /*
    |--------------------------------------------------------------------------
    | Interests
    |--------------------------------------------------------------------------
    */

    if (Array.isArray(interests)) {
      user.aiProfile.interests = interests;
    }

    /*
    |--------------------------------------------------------------------------
    | Career Information
    |--------------------------------------------------------------------------
    */

    if (career) {
      if (career.careerGoal !== undefined) {
        user.aiProfile.careerGoal = career.careerGoal;
      }

      if (career.dailyStudyHours !== undefined) {
        user.aiProfile.dailyStudyHours = Number(career.dailyStudyHours);
      }

      if (career.preferredLanguage !== undefined) {
        user.aiProfile.preferredLanguage = career.preferredLanguage;
      }

      if (career.learningStyle !== undefined) {
        user.learningStyle = career.learningStyle;
      }

      if (career.targetRole !== undefined) {
        user.placement.targetRole = career.targetRole;
      }

      if (career.dreamCompany !== undefined) {
        user.placement.dreamCompany = career.dreamCompany;
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Learning Plan
    |--------------------------------------------------------------------------
    */

    if (learningPlan) {
      if (learningPlan.experienceLevel !== undefined) {
        user.professional.experienceLevel = learningPlan.experienceLevel;
      }

      if (Array.isArray(learningPlan.learningPriority)) {
        user.aiProfile.interests = [
          ...new Set([
            ...user.aiProfile.interests,
            ...learningPlan.learningPriority,
          ]),
        ];
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Current Situation
    |--------------------------------------------------------------------------
    */

    if (currentSituation) {
      if (currentSituation.collegeName !== undefined) {
        user.education.collegeName = currentSituation.collegeName;
      }

      if (currentSituation.university !== undefined) {
        user.education.university = currentSituation.university;
      }

      if (currentSituation.degree !== undefined) {
        user.education.degree = currentSituation.degree;
      }

      if (currentSituation.branch !== undefined) {
        user.education.branch = currentSituation.branch;
      }

      if (
        currentSituation.semester !== undefined &&
        currentSituation.semester !== ""
      ) {
        user.education.semester = Number(currentSituation.semester);
      }

      if (currentSituation.graduationYear !== undefined) {
        user.education.graduationYear = Number(currentSituation.graduationYear);
      }

      if (currentSituation.cgpa !== undefined) {
        user.education.cgpa = Number(currentSituation.cgpa);
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Placement Focus
    |--------------------------------------------------------------------------
    */

    if (req.body.placementFocus !== undefined) {
      user.placementFocus = req.body.placementFocus;
    }

    /*
    |--------------------------------------------------------------------------
    | Social Links
    |--------------------------------------------------------------------------
    */

    if (req.body.socialLinks) {
      const { github, linkedin, portfolio } = req.body.socialLinks;

      if (github !== undefined) {
        user.socialLinks.github = github;
      }

      if (linkedin !== undefined) {
        user.socialLinks.linkedin = linkedin;
      }

      if (portfolio !== undefined) {
        user.socialLinks.portfolio = portfolio;
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Onboarding Completed
    |--------------------------------------------------------------------------
    */

    user.onboardingCompleted = true;

    /*
    |--------------------------------------------------------------------------
    | Save User
    |--------------------------------------------------------------------------
    */

    await user.save();

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    |
    | IMPORTANT:
    | Career matching, learning path generation and learning progress
    | initialization are NOT performed here.
    |
    | Career Explorer will use the saved onboarding data.
    |
    */

    return res.status(200).json({
      success: true,
      message: "Onboarding completed successfully.",
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,

          onboardingCompleted: user.onboardingCompleted,

          skills: user.professional.skills,

          interests: user.aiProfile.interests,

          careerGoal: user.aiProfile.careerGoal,

          targetRole: user.placement.targetRole,

          learningStyle: user.learningStyle,
        },
      },
    });
  } catch (error) {
    console.error("Onboarding Update Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to complete onboarding.",
      error: error.message,
    });
  }
};
