import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

import "./Onboarding.css";

const USER_ROLES = [
  {
    value: "student",
    label: "Student",
    icon: "🎓",
    description: "I am currently studying.",
  },
  {
    value: "professional",
    label: "Working Professional",
    icon: "💼",
    description: "I am currently working.",
  },
  {
    value: "career_switcher",
    label: "Career Switcher",
    icon: "🔄",
    description: "I want to move into a new career.",
  },
  {
    value: "job_seeker",
    label: "Job Seeker",
    icon: "🔍",
    description: "I am looking for a job.",
  },
  {
    value: "entrepreneur",
    label: "Entrepreneur",
    icon: "🚀",
    description: "I am building a business.",
  },
  {
    value: "freelancer",
    label: "Freelancer",
    icon: "💻",
    description: "I work independently.",
  },
  {
    value: "researcher",
    label: "Researcher",
    icon: "🔬",
    description: "I work in research.",
  },
  {
    value: "educator",
    label: "Educator",
    icon: "👨‍🏫",
    description: "I teach or train others.",
  },
  {
    value: "mentor",
    label: "Mentor",
    icon: "🧑‍💼",
    description: "I guide other people.",
  },
  {
    value: "content_creator",
    label: "Content Creator",
    icon: "🎥",
    description: "I create digital content.",
  },
];

const INITIAL_DATA = {
  // Student
  collegeName: "",
  university: "",
  degree: "",
  branch: "",
  semester: "",
  graduationYear: "",
  cgpa: "",

  // Professional
  currentRole: "",
  company: "",
  experienceYears: "",
  industry: "",

  // Career switcher
  currentCareer: "",
  targetCareer: "",
  reasonForSwitch: "",

  // Job seeker
  targetRole: "",
  preferredIndustry: "",
  targetLocation: "",

  // Entrepreneur
  businessStage: "",
  businessIndustry: "",

  // Freelancer
  freelanceArea: "",
  freelanceExperience: "",

  // Researcher
  researchArea: "",
  researchExperience: "",

  // Educator
  teachingArea: "",
  teachingExperience: "",

  // Mentor
  mentoringArea: "",
  mentoringExperience: "",

  // Content creator
  contentType: "",
  contentExperience: "",
};

/*
|--------------------------------------------------------------------------
| Default skill suggestions
|--------------------------------------------------------------------------
*/

const DEFAULT_SKILLS = [
  "Communication",
  "Problem Solving",
  "Leadership",
  "Teamwork",
  "Time Management",
  "Critical Thinking",
];

/*
|--------------------------------------------------------------------------
| Role based skills
|--------------------------------------------------------------------------
*/

const ROLE_SKILLS = {
  student: [
    "HTML",
    "CSS",
    "JavaScript",
    "Java",
    "Python",
    "C",
    "C++",
    "SQL",
    "React",
    "Node.js",
    "Git",
    "GitHub",
  ],

  professional: [
    "Java",
    "Python",
    "JavaScript",
    "React",
    "Node.js",
    "SQL",
    "MongoDB",
    "REST API",
    "Git",
    "GitHub",
    "Docker",
    "AWS",
  ],

  career_switcher: [
    "Communication",
    "Problem Solving",
    "Excel",
    "SQL",
    "Python",
    "JavaScript",
    "Project Management",
    "Data Analysis",
    "Leadership",
    "Teamwork",
  ],

  job_seeker: [
    "Communication",
    "Problem Solving",
    "Java",
    "Python",
    "JavaScript",
    "SQL",
    "React",
    "Node.js",
    "Git",
    "Interview Preparation",
    "Resume Building",
  ],

  entrepreneur: [
    "Business Strategy",
    "Leadership",
    "Marketing",
    "Sales",
    "Communication",
    "Financial Planning",
    "Product Management",
    "Project Management",
    "Market Research",
    "Negotiation",
  ],

  freelancer: [
    "Communication",
    "Client Management",
    "HTML",
    "CSS",
    "JavaScript",
    "React",
    "WordPress",
    "Graphic Design",
    "UI/UX",
    "Digital Marketing",
    "Project Management",
  ],

  researcher: [
    "Research Methodology",
    "Data Analysis",
    "Python",
    "Statistics",
    "Machine Learning",
    "Academic Writing",
    "Literature Review",
    "Critical Thinking",
    "Problem Solving",
    "Presentation",
  ],

  educator: [
    "Teaching",
    "Communication",
    "Presentation",
    "Leadership",
    "Curriculum Design",
    "Public Speaking",
    "Subject Expertise",
    "Classroom Management",
    "Content Creation",
  ],

  mentor: [
    "Communication",
    "Leadership",
    "Coaching",
    "Problem Solving",
    "Career Guidance",
    "Public Speaking",
    "Active Listening",
    "Emotional Intelligence",
    "Networking",
  ],

  content_creator: [
    "Content Writing",
    "Video Editing",
    "Graphic Design",
    "Communication",
    "Storytelling",
    "Social Media",
    "SEO",
    "YouTube",
    "Instagram",
    "Digital Marketing",
  ],
};

/*
|--------------------------------------------------------------------------
| Role based interests
|--------------------------------------------------------------------------
*/

const ROLE_INTERESTS = {
  student: [
    "Web Development",
    "Software Development",
    "Artificial Intelligence",
    "Data Science",
    "Cyber Security",
    "Cloud Computing",
    "Mobile Development",
    "UI/UX Design",
  ],

  professional: [
    "Career Growth",
    "Leadership",
    "Technology",
    "Management",
    "Cloud Computing",
    "Artificial Intelligence",
    "Data Science",
    "Entrepreneurship",
  ],

  career_switcher: [
    "Software Development",
    "Data Science",
    "Artificial Intelligence",
    "Cyber Security",
    "Cloud Computing",
    "Digital Marketing",
    "Product Management",
    "Business",
  ],

  job_seeker: [
    "Software Development",
    "Web Development",
    "Data Science",
    "Artificial Intelligence",
    "Cyber Security",
    "Cloud Computing",
    "Government Jobs",
    "Private Jobs",
  ],

  entrepreneur: [
    "Startups",
    "Business",
    "Technology",
    "Marketing",
    "Finance",
    "Product Development",
    "Innovation",
    "Leadership",
  ],

  freelancer: [
    "Web Development",
    "Graphic Design",
    "UI/UX Design",
    "Content Writing",
    "Digital Marketing",
    "Video Editing",
    "Photography",
    "Consulting",
  ],

  researcher: [
    "Artificial Intelligence",
    "Machine Learning",
    "Data Science",
    "Scientific Research",
    "Technology",
    "Statistics",
    "Innovation",
    "Academic Research",
  ],

  educator: [
    "Teaching",
    "Technology",
    "Online Education",
    "Content Creation",
    "Research",
    "EdTech",
    "Public Speaking",
    "Leadership",
  ],

  mentor: [
    "Career Development",
    "Leadership",
    "Technology",
    "Education",
    "Coaching",
    "Personal Development",
    "Networking",
    "Entrepreneurship",
  ],

  content_creator: [
    "YouTube",
    "Instagram",
    "Blogging",
    "Podcasting",
    "Video Creation",
    "Photography",
    "Digital Marketing",
    "Personal Branding",
  ],
};

/*
|--------------------------------------------------------------------------
| Context based suggestions
|--------------------------------------------------------------------------
*/

const CONTEXT_SKILLS = [
  {
    keywords: ["computer", "software", "developer", "development", "coding"],
    skills: [
      "Programming",
      "Data Structures",
      "Algorithms",
      "Git",
      "Problem Solving",
    ],
  },

  {
    keywords: ["web", "frontend", "backend", "full stack"],
    skills: ["HTML", "CSS", "JavaScript", "React", "Node.js", "REST API"],
  },

  {
    keywords: ["data", "analytics", "analysis"],
    skills: ["Python", "SQL", "Statistics", "Data Analysis", "Excel"],
  },

  {
    keywords: ["ai", "artificial intelligence", "machine learning", "ml"],
    skills: [
      "Python",
      "Machine Learning",
      "Deep Learning",
      "Statistics",
      "Data Analysis",
    ],
  },

  {
    keywords: ["business", "startup", "entrepreneur"],
    skills: [
      "Business Strategy",
      "Marketing",
      "Sales",
      "Leadership",
      "Financial Planning",
    ],
  },

  {
    keywords: ["design", "ui", "ux"],
    skills: [
      "UI/UX",
      "Figma",
      "Graphic Design",
      "Prototyping",
      "User Research",
    ],
  },
];

const CONTEXT_INTERESTS = [
  {
    keywords: ["computer", "software", "developer", "coding"],
    interests: [
      "Software Development",
      "Web Development",
      "Artificial Intelligence",
      "Cyber Security",
    ],
  },

  {
    keywords: ["data", "analytics", "analysis"],
    interests: [
      "Data Science",
      "Business Intelligence",
      "Artificial Intelligence",
      "Statistics",
    ],
  },

  {
    keywords: ["business", "startup", "entrepreneur"],
    interests: [
      "Entrepreneurship",
      "Startups",
      "Marketing",
      "Business Strategy",
    ],
  },

  {
    keywords: ["design", "ui", "ux"],
    interests: [
      "UI/UX Design",
      "Graphic Design",
      "Product Design",
      "Creative Design",
    ],
  },
];

function Onboarding() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [role, setRole] = useState("");

  const [customRole, setCustomRole] = useState("");

  const [currentSituation, setCurrentSituation] = useState(INITIAL_DATA);

  const [additionalNotes, setAdditionalNotes] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Step 3 state
  |--------------------------------------------------------------------------
  */

  const [selectedSkills, setSelectedSkills] = useState([]);

  const [customSkill, setCustomSkill] = useState("");

  const [selectedInterests, setSelectedInterests] = useState([]);

  /*
|--------------------------------------------------------------------------
| Step 4 state
|--------------------------------------------------------------------------
*/

  const [careerGoal, setCareerGoal] = useState("");

  const [targetRole, setTargetRole] = useState("");

  const [dailyStudyHours, setDailyStudyHours] = useState("");

  const [learningStyle, setLearningStyle] = useState("mixed");

  const [preferredLanguage, setPreferredLanguage] = useState("English");

  const [careerGoalDescription, setCareerGoalDescription] = useState("");

  const [customInterest, setCustomInterest] = useState("");

  /*
|--------------------------------------------------------------------------
| Step 5 state
|--------------------------------------------------------------------------
*/

  const [roadmapDuration, setRoadmapDuration] = useState("");
  const [weeklyStudyDays, setWeeklyStudyDays] = useState("");
  const [learningPriority, setLearningPriority] = useState([]);
  const [experienceLevel, setExperienceLevel] = useState("beginner");
  const [preferredLearningMode, setPreferredLearningMode] =
    useState("projects");

  const [additionalGoal, setAdditionalGoal] = useState("");

  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Step 1
  |--------------------------------------------------------------------------
  */

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setCustomRole("");
    setError("");
  };

  const handleCustomRoleChange = (e) => {
    const value = e.target.value;

    setCustomRole(value);

    if (value.trim()) {
      setRole("");
    }

    setError("");
  };

  /*
  |--------------------------------------------------------------------------
  | Step 2
  |--------------------------------------------------------------------------
  */

  const handleSituationChange = (e) => {
    const { name, value } = e.target;

    setCurrentSituation((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const getSelectedRole = () => {
    return role || customRole.trim();
  };

  /*
  |--------------------------------------------------------------------------
  | Step 1 validation
  |--------------------------------------------------------------------------
  */

  const validateStepOne = () => {
    if (!getSelectedRole()) {
      setError("Please select an option or enter your own role.");
      return false;
    }

    return true;
  };

  /*
  |--------------------------------------------------------------------------
  | Step 2 validation
  |--------------------------------------------------------------------------
  */

  const validateStepTwo = () => {
    if (role === "student") {
      if (
        !currentSituation.collegeName.trim() ||
        !currentSituation.degree.trim() ||
        !currentSituation.branch.trim()
      ) {
        setError("Please enter your college, degree and branch.");
        return false;
      }
    }

    if (role === "professional") {
      if (
        !currentSituation.currentRole.trim() ||
        !currentSituation.experienceYears
      ) {
        setError("Please enter your current role and experience.");
        return false;
      }
    }

    if (role === "career_switcher") {
      if (
        !currentSituation.currentCareer.trim() ||
        !currentSituation.targetCareer.trim()
      ) {
        setError("Please enter your current and target career.");
        return false;
      }
    }

    if (role === "job_seeker") {
      if (!currentSituation.targetRole.trim()) {
        setError("Please enter your target job role.");
        return false;
      }
    }

    if (role === "entrepreneur") {
      if (
        !currentSituation.businessStage.trim() ||
        !currentSituation.businessIndustry.trim()
      ) {
        setError("Please enter your business stage and industry.");
        return false;
      }
    }

    if (role === "freelancer") {
      if (!currentSituation.freelanceArea.trim()) {
        setError("Please enter your freelancing area.");
        return false;
      }
    }

    if (role === "researcher") {
      if (!currentSituation.researchArea.trim()) {
        setError("Please enter your research area.");
        return false;
      }
    }

    if (role === "educator") {
      if (!currentSituation.teachingArea.trim()) {
        setError("Please enter your teaching area.");
        return false;
      }
    }

    if (role === "mentor") {
      if (!currentSituation.mentoringArea.trim()) {
        setError("Please enter your mentoring area.");
        return false;
      }
    }

    if (role === "content_creator") {
      if (!currentSituation.contentType.trim()) {
        setError("Please enter your content type.");
        return false;
      }
    }

    return true;
  };

  /*
  |--------------------------------------------------------------------------
  | Context text
  |--------------------------------------------------------------------------
  */

  const getContextText = () => {
    return Object.values(currentSituation)
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
  };

  /*
  |--------------------------------------------------------------------------
  | Step 3 suggestions
  |--------------------------------------------------------------------------
  */

  const getSuggestedSkills = () => {
    const roleSkills = ROLE_SKILLS[role] || [];

    const contextText = getContextText();

    const contextSkills = [];

    CONTEXT_SKILLS.forEach((item) => {
      const matched = item.keywords.some((keyword) =>
        contextText.includes(keyword),
      );

      if (matched) {
        contextSkills.push(...item.skills);
      }
    });

    return [...new Set([...roleSkills, ...contextSkills, ...DEFAULT_SKILLS])];
  };

  const getSuggestedInterests = () => {
    const roleInterests = ROLE_INTERESTS[role] || [];

    const contextText = getContextText();

    const contextInterests = [];

    CONTEXT_INTERESTS.forEach((item) => {
      const matched = item.keywords.some((keyword) =>
        contextText.includes(keyword),
      );

      if (matched) {
        contextInterests.push(...item.interests);
      }
    });

    return [...new Set([...roleInterests, ...contextInterests])];
  };

  /*
  |--------------------------------------------------------------------------
  | Skill selection
  |--------------------------------------------------------------------------
  */

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) => {
      if (prev.includes(skill)) {
        return prev.filter((item) => item !== skill);
      }

      return [...prev, skill];
    });

    setError("");
  };

  const addCustomSkill = () => {
    const skill = customSkill.trim();

    if (!skill) {
      return;
    }

    const alreadyExists = selectedSkills.some(
      (item) => item.toLowerCase() === skill.toLowerCase(),
    );

    if (!alreadyExists) {
      setSelectedSkills((prev) => [...prev, skill]);
    }

    setCustomSkill("");
    setError("");
  };

  const removeSkill = (skill) => {
    setSelectedSkills((prev) => prev.filter((item) => item !== skill));
  };

  /*
  |--------------------------------------------------------------------------
  | Interest selection
  |--------------------------------------------------------------------------
  */

  const toggleInterest = (interest) => {
    setSelectedInterests((prev) => {
      if (prev.includes(interest)) {
        return prev.filter((item) => item !== interest);
      }

      return [...prev, interest];
    });

    setError("");
  };

  const addCustomInterest = () => {
    const interest = customInterest.trim();

    if (!interest) {
      return;
    }

    const alreadyExists = selectedInterests.some(
      (item) => item.toLowerCase() === interest.toLowerCase(),
    );

    if (!alreadyExists) {
      setSelectedInterests((prev) => [...prev, interest]);
    }

    setCustomInterest("");
    setError("");
  };

  const removeInterest = (interest) => {
    setSelectedInterests((prev) => prev.filter((item) => item !== interest));
  };

  /*
  |--------------------------------------------------------------------------
  | Step 3 validation
  |--------------------------------------------------------------------------
  */

  const validateStepThree = () => {
    if (selectedSkills.length === 0) {
      setError("Please select or add at least one skill.");
      return false;
    }

    if (selectedInterests.length === 0) {
      setError("Please select or add at least one interest.");
      return false;
    }

    return true;
  };

  const saveOnboardingProfile = async (finalOnboardingData) => {
    try {
      console.log("📤 SAVING ONBOARDING DATA:", finalOnboardingData);

      const response = await api.put(
        "/profile/onboarding",
        finalOnboardingData,
      );

      console.log("✅ ONBOARDING SAVED TO DATABASE:", response.data);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error(
        "❌ ONBOARDING SAVE ERROR:",
        error.response?.data || error.message,
      );

      return {
        success: false,
        message:
          error.response?.data?.message || "Unable to save onboarding profile.",
      };
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Continue
  |--------------------------------------------------------------------------
  */

  const handleContinue = async () => {
    setError("");

    if (step === 1) {
      if (!validateStepOne()) {
        return;
      }

      setStep(2);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    if (step === 2) {
      if (!validateStepTwo()) {
        return;
      }

      setStep(3);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    if (step === 3) {
      if (!validateStepThree()) {
        return;
      }

      const onboardingData = {
        role: getSelectedRole(),

        currentSituation,

        skills: selectedSkills,

        interests: selectedInterests,
      };

      console.log("STEP 3 COMPLETED - ONBOARDING DATA:", onboardingData);

      setStep(4);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      return;
    }

    if (step === 4) {
      if (!validateStepFour()) {
        return;
      }

      const stepFourData = {
        careerGoal,
        targetRole,
        dailyStudyHours: Number(dailyStudyHours),
        learningStyle,
        preferredLanguage,
        careerGoalDescription: careerGoalDescription.trim(),
      };

      console.log("STEP 4 COMPLETED - CAREER DATA:", stepFourData);

      setStep(5);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    if (step === 5) {
      if (!validateStepFive()) {
        return;
      }

      const stepFiveData = {
        roadmapDuration,
        weeklyStudyDays: Number(weeklyStudyDays),
        experienceLevel,
        learningPriority,
        preferredLearningMode,
        additionalGoal: additionalGoal.trim(),
      };

      console.log("STEP 5 COMPLETED - LEARNING PLAN:", stepFiveData);

      setStep(6);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    if (step === 6) {
      if (!validateStepSix()) {
        return;
      }

      const finalOnboardingData = {
        role: getSelectedRole(),

        currentSituation,

        skills: selectedSkills,

        interests: selectedInterests,

        career: {
          careerGoal,
          careerGoalDescription,
          targetRole,
          dailyStudyHours: Number(dailyStudyHours),
          learningStyle,
          preferredLanguage,
        },

        learningPlan: {
          roadmapDuration,
          weeklyStudyDays: Number(weeklyStudyDays),
          experienceLevel,
          learningPriority,
          preferredLearningMode,
          additionalNotes: "",
        },
      };

      console.log(
        "STEP 6 COMPLETED - FINAL ONBOARDING DATA:",
        finalOnboardingData,
      );

      try {
        setError("");

        // Save to backend
        const result = await saveOnboardingProfile(finalOnboardingData);

        // ❌ API failed
        if (!result.success) {
          setError(result.message);
          return;
        }

        console.log("✅ PROFILE SAVED SUCCESSFULLY:", result);

        console.log("🎉 ONBOARDING COMPLETED SUCCESSFULLY");

        // Go to dashboard
        navigate("/dashboard");
      } catch (error) {
        console.error("❌ PROFILE SAVE FAILED:", error);

        setError(
          error.response?.data?.message ||
            "Unable to save your profile. Please try again.",
        );
      }

      return;
    }
    setError("");

    console.log("🎉 ONBOARDING COMPLETED SUCCESSFULLY");

    return;
  };

  /*
  |--------------------------------------------------------------------------
  | Back
  |--------------------------------------------------------------------------
  */

  const handleBack = () => {
    setError("");

    if (step === 1) {
      navigate("/login");
      return;
    }

    setStep((prev) => prev - 1);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Student form
  |--------------------------------------------------------------------------
  */

  const renderStudentForm = () => (
    <div className="situation-grid">
      <div className="form-group">
        <label>College / Institute *</label>

        <input
          type="text"
          name="collegeName"
          placeholder="Enter your college or institute"
          value={currentSituation.collegeName}
          onChange={handleSituationChange}
        />
      </div>

      <div className="form-group">
        <label>University</label>

        <input
          type="text"
          name="university"
          placeholder="Enter your university"
          value={currentSituation.university}
          onChange={handleSituationChange}
        />
      </div>

      <div className="form-group">
        <label>Degree *</label>

        <input
          type="text"
          name="degree"
          placeholder="e.g. BSc Computer Science"
          value={currentSituation.degree}
          onChange={handleSituationChange}
        />
      </div>

      <div className="form-group">
        <label>Branch / Specialization *</label>

        <input
          type="text"
          name="branch"
          placeholder="e.g. Computer Science"
          value={currentSituation.branch}
          onChange={handleSituationChange}
        />
      </div>

      <div className="form-group">
        <label>Current Semester</label>

        <input
          type="number"
          name="semester"
          min="1"
          max="12"
          placeholder="e.g. 6"
          value={currentSituation.semester}
          onChange={handleSituationChange}
        />
      </div>

      <div className="form-group">
        <label>Graduation Year</label>

        <input
          type="number"
          name="graduationYear"
          placeholder="e.g. 2027"
          value={currentSituation.graduationYear}
          onChange={handleSituationChange}
        />
      </div>

      <div className="form-group">
        <label>CGPA</label>

        <input
          type="number"
          name="cgpa"
          min="0"
          max="10"
          step="0.01"
          placeholder="e.g. 8.2"
          value={currentSituation.cgpa}
          onChange={handleSituationChange}
        />
      </div>
    </div>
  );

  /*
  |--------------------------------------------------------------------------
  | Professional form
  |--------------------------------------------------------------------------
  */

  const renderProfessionalForm = () => (
    <div className="situation-grid">
      <div className="form-group">
        <label>Current Job Role *</label>

        <input
          type="text"
          name="currentRole"
          placeholder="e.g. Frontend Developer"
          value={currentSituation.currentRole}
          onChange={handleSituationChange}
        />
      </div>

      <div className="form-group">
        <label>Company</label>

        <input
          type="text"
          name="company"
          placeholder="Enter your company"
          value={currentSituation.company}
          onChange={handleSituationChange}
        />
      </div>

      <div className="form-group">
        <label>Years of Experience *</label>

        <input
          type="number"
          name="experienceYears"
          min="0"
          step="0.5"
          placeholder="e.g. 2"
          value={currentSituation.experienceYears}
          onChange={handleSituationChange}
        />
      </div>

      <div className="form-group">
        <label>Industry</label>

        <input
          type="text"
          name="industry"
          placeholder="e.g. IT / Finance / Healthcare"
          value={currentSituation.industry}
          onChange={handleSituationChange}
        />
      </div>
    </div>
  );

  /*
  |--------------------------------------------------------------------------
  | Career switcher
  |--------------------------------------------------------------------------
  */

  const renderCareerSwitcherForm = () => (
    <div className="situation-grid">
      <div className="form-group">
        <label>Current Career / Role *</label>

        <input
          type="text"
          name="currentCareer"
          placeholder="What do you currently do?"
          value={currentSituation.currentCareer}
          onChange={handleSituationChange}
        />
      </div>

      <div className="form-group">
        <label>Target Career *</label>

        <input
          type="text"
          name="targetCareer"
          placeholder="What career do you want?"
          value={currentSituation.targetCareer}
          onChange={handleSituationChange}
        />
      </div>

      <div className="form-group full-width">
        <label>Why do you want to switch?</label>

        <textarea
          name="reasonForSwitch"
          placeholder="Tell EduPath AI about your reason..."
          value={currentSituation.reasonForSwitch}
          onChange={handleSituationChange}
          rows="4"
        />
      </div>
    </div>
  );

  /*
  |--------------------------------------------------------------------------
  | Job seeker
  |--------------------------------------------------------------------------
  */

  const renderJobSeekerForm = () => (
    <div className="situation-grid">
      <div className="form-group">
        <label>Target Job Role *</label>

        <input
          type="text"
          name="targetRole"
          placeholder="e.g. Java Developer"
          value={currentSituation.targetRole}
          onChange={handleSituationChange}
        />
      </div>

      <div className="form-group">
        <label>Preferred Industry</label>

        <input
          type="text"
          name="preferredIndustry"
          placeholder="e.g. Software / Banking"
          value={currentSituation.preferredIndustry}
          onChange={handleSituationChange}
        />
      </div>

      <div className="form-group">
        <label>Preferred Location</label>

        <input
          type="text"
          name="targetLocation"
          placeholder="e.g. Pune / Mumbai / Remote"
          value={currentSituation.targetLocation}
          onChange={handleSituationChange}
        />
      </div>

      <div className="form-group">
        <label>Experience</label>

        <input
          type="number"
          name="experienceYears"
          min="0"
          step="0.5"
          placeholder="Years of experience"
          value={currentSituation.experienceYears}
          onChange={handleSituationChange}
        />
      </div>
    </div>
  );

  /*
  |--------------------------------------------------------------------------
  | Entrepreneur
  |--------------------------------------------------------------------------
  */

  const renderEntrepreneurForm = () => (
    <div className="situation-grid">
      <div className="form-group">
        <label>Business Stage *</label>

        <input
          type="text"
          name="businessStage"
          placeholder="Idea / Startup / Growing"
          value={currentSituation.businessStage}
          onChange={handleSituationChange}
        />
      </div>

      <div className="form-group">
        <label>Business / Industry *</label>

        <input
          type="text"
          name="businessIndustry"
          placeholder="e.g. EdTech / FinTech"
          value={currentSituation.businessIndustry}
          onChange={handleSituationChange}
        />
      </div>
    </div>
  );

  /*
  |--------------------------------------------------------------------------
  | Freelancer
  |--------------------------------------------------------------------------
  */

  const renderFreelancerForm = () => (
    <div className="situation-grid">
      <div className="form-group">
        <label>Freelancing Area *</label>

        <input
          type="text"
          name="freelanceArea"
          placeholder="e.g. Web Development"
          value={currentSituation.freelanceArea}
          onChange={handleSituationChange}
        />
      </div>

      <div className="form-group">
        <label>Freelancing Experience</label>

        <textarea
          name="freelanceExperience"
          placeholder="Tell us about your freelancing experience..."
          value={currentSituation.freelanceExperience}
          onChange={handleSituationChange}
          rows="4"
        />
      </div>
    </div>
  );

  /*
  |--------------------------------------------------------------------------
  | Researcher
  |--------------------------------------------------------------------------
  */

  const renderResearcherForm = () => (
    <div className="situation-grid">
      <div className="form-group">
        <label>Research Area *</label>

        <input
          type="text"
          name="researchArea"
          placeholder="e.g. AI / Computer Science / Physics"
          value={currentSituation.researchArea}
          onChange={handleSituationChange}
        />
      </div>

      <div className="form-group">
        <label>Research Experience</label>

        <textarea
          name="researchExperience"
          placeholder="Describe your research experience..."
          value={currentSituation.researchExperience}
          onChange={handleSituationChange}
          rows="4"
        />
      </div>
    </div>
  );

  /*
  |--------------------------------------------------------------------------
  | Educator
  |--------------------------------------------------------------------------
  */

  const renderEducatorForm = () => (
    <div className="situation-grid">
      <div className="form-group">
        <label>Teaching Area *</label>

        <input
          type="text"
          name="teachingArea"
          placeholder="e.g. Computer Science"
          value={currentSituation.teachingArea}
          onChange={handleSituationChange}
        />
      </div>

      <div className="form-group">
        <label>Teaching Experience</label>

        <textarea
          name="teachingExperience"
          placeholder="Tell us about your teaching experience..."
          value={currentSituation.teachingExperience}
          onChange={handleSituationChange}
          rows="4"
        />
      </div>
    </div>
  );

  /*
  |--------------------------------------------------------------------------
  | Mentor
  |--------------------------------------------------------------------------
  */

  const renderMentorForm = () => (
    <div className="situation-grid">
      <div className="form-group">
        <label>Mentoring Area *</label>

        <input
          type="text"
          name="mentoringArea"
          placeholder="e.g. Career / Technology"
          value={currentSituation.mentoringArea}
          onChange={handleSituationChange}
        />
      </div>

      <div className="form-group">
        <label>Mentoring Experience</label>

        <textarea
          name="mentoringExperience"
          placeholder="Tell us about your mentoring experience..."
          value={currentSituation.mentoringExperience}
          onChange={handleSituationChange}
          rows="4"
        />
      </div>
    </div>
  );

  /*
  |--------------------------------------------------------------------------
  | Content creator
  |--------------------------------------------------------------------------
  */

  const renderContentCreatorForm = () => (
    <div className="situation-grid">
      <div className="form-group">
        <label>Content Type *</label>

        <input
          type="text"
          name="contentType"
          placeholder="YouTube / Blog / Instagram / Podcast"
          value={currentSituation.contentType}
          onChange={handleSituationChange}
        />
      </div>

      <div className="form-group">
        <label>Content Creation Experience</label>

        <textarea
          name="contentExperience"
          placeholder="Tell us about your content creation experience..."
          value={currentSituation.contentExperience}
          onChange={handleSituationChange}
          rows="4"
        />
      </div>
    </div>
  );

  /*
  |--------------------------------------------------------------------------
  | Situation renderer
  |--------------------------------------------------------------------------
  */

  const renderSituationForm = () => {
    switch (role) {
      case "student":
        return renderStudentForm();

      case "professional":
        return renderProfessionalForm();

      case "career_switcher":
        return renderCareerSwitcherForm();

      case "job_seeker":
        return renderJobSeekerForm();

      case "entrepreneur":
        return renderEntrepreneurForm();

      case "freelancer":
        return renderFreelancerForm();

      case "researcher":
        return renderResearcherForm();

      case "educator":
        return renderEducatorForm();

      case "mentor":
        return renderMentorForm();

      case "content_creator":
        return renderContentCreatorForm();

      default:
        return (
          <div className="custom-situation-box">
            <label>Tell us about your current situation</label>

            <textarea
              placeholder="Describe your current situation, experience and what you are working towards..."
              rows="6"
            />
          </div>
        );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Step 3 renderer
  |--------------------------------------------------------------------------
  */

  const renderStepThree = () => {
    const suggestedSkills = getSuggestedSkills();

    const suggestedInterests = getSuggestedInterests();

    return (
      <>
        <div className="onboarding-title">
          <span className="onboarding-badge">YOUR SKILLS & INTERESTS</span>

          <h1>
            Let's understand what you
            <span> already know.</span>
          </h1>

          <p>
            Based on your profile and current situation, EduPath AI has
            suggested some relevant skills and interests. Select what matches
            you, or add your own.
          </p>
        </div>

        <section className="onboarding-section">
          {/* Context summary */}

          <div className="selected-role-display">
            <span>
              {USER_ROLES.find((item) => item.value === role)?.icon || "👤"}
            </span>

            <div>
              <small>Your selected profile</small>

              <strong>
                {USER_ROLES.find((item) => item.value === role)?.label ||
                  customRole}
              </strong>
            </div>
          </div>

          {/* Skills */}

          <div className="step3-block">
            <h2>What skills do you have?</h2>

            <p className="section-description">
              Select the skills you already know or are comfortable with.
            </p>

            <div className="selection-grid">
              {suggestedSkills.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  className={`selection-chip ${
                    selectedSkills.includes(skill) ? "selected" : ""
                  }`}
                  onClick={() => toggleSkill(skill)}
                >
                  {selectedSkills.includes(skill) && <span>✓</span>}

                  {skill}
                </button>
              ))}
            </div>

            <div className="custom-selection">
              <label htmlFor="customSkill">Don't see your skill?</label>

              <div className="custom-input-row">
                <input
                  id="customSkill"
                  type="text"
                  placeholder="Type your skill..."
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomSkill();
                    }
                  }}
                />

                <button type="button" onClick={addCustomSkill}>
                  + Add
                </button>
              </div>
            </div>

            {/* Selected skills */}

            {selectedSkills.length > 0 && (
              <div className="selected-items">
                <h4>Selected Skills ({selectedSkills.length})</h4>

                <div className="selected-items-list">
                  {selectedSkills.map((skill) => (
                    <span key={skill} className="selected-item">
                      {skill}

                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        aria-label={`Remove ${skill}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Interests */}

          <div className="step3-block">
            <h2>What are you interested in?</h2>

            <p className="section-description">
              Select areas you want to explore, learn or build your career
              around.
            </p>

            <div className="selection-grid">
              {suggestedInterests.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  className={`selection-chip interest-chip ${
                    selectedInterests.includes(interest) ? "selected" : ""
                  }`}
                  onClick={() => toggleInterest(interest)}
                >
                  {selectedInterests.includes(interest) && <span>✓</span>}

                  {interest}
                </button>
              ))}
            </div>

            <div className="custom-selection">
              <label htmlFor="customInterest">Don't see your interest?</label>

              <div className="custom-input-row">
                <input
                  id="customInterest"
                  type="text"
                  placeholder="Type your interest..."
                  value={customInterest}
                  onChange={(e) => setCustomInterest(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomInterest();
                    }
                  }}
                />

                <button type="button" onClick={addCustomInterest}>
                  + Add
                </button>
              </div>
            </div>

            {/* Selected interests */}

            {selectedInterests.length > 0 && (
              <div className="selected-items">
                <h4>Selected Interests ({selectedInterests.length})</h4>

                <div className="selected-items-list">
                  {selectedInterests.map((interest) => (
                    <span
                      key={interest}
                      className="selected-item interest-item"
                    >
                      {interest}

                      <button
                        type="button"
                        onClick={() => removeInterest(interest)}
                        aria-label={`Remove ${interest}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </>
    );
  };

  /*
|--------------------------------------------------------------------------
| Step 4
|--------------------------------------------------------------------------
*/

  const getSuggestedCareerRoles = () => {
    const text = [
      role,
      customRole,
      ...selectedSkills,
      ...selectedInterests,
      ...Object.values(currentSituation),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const suggestions = [];

    if (
      text.includes("web") ||
      text.includes("frontend") ||
      text.includes("html") ||
      text.includes("css") ||
      text.includes("react")
    ) {
      suggestions.push(
        "Frontend Developer",
        "Full Stack Developer",
        "Web Developer",
      );
    }

    if (
      text.includes("backend") ||
      text.includes("node") ||
      text.includes("java") ||
      text.includes("python") ||
      text.includes("api")
    ) {
      suggestions.push(
        "Backend Developer",
        "Java Developer",
        "Python Developer",
        "Full Stack Developer",
      );
    }

    if (
      text.includes("data") ||
      text.includes("analytics") ||
      text.includes("sql") ||
      text.includes("statistics")
    ) {
      suggestions.push("Data Analyst", "Data Scientist", "Business Analyst");
    }

    if (
      text.includes("ai") ||
      text.includes("machine learning") ||
      text.includes("ml")
    ) {
      suggestions.push(
        "AI Engineer",
        "Machine Learning Engineer",
        "Data Scientist",
      );
    }

    if (text.includes("cyber") || text.includes("security")) {
      suggestions.push("Cyber Security Analyst", "Security Engineer");
    }

    if (
      text.includes("design") ||
      text.includes("ui") ||
      text.includes("ux") ||
      text.includes("figma")
    ) {
      suggestions.push("UI/UX Designer", "Product Designer");
    }

    if (
      text.includes("business") ||
      text.includes("entrepreneur") ||
      text.includes("startup") ||
      text.includes("marketing")
    ) {
      suggestions.push(
        "Entrepreneur",
        "Product Manager",
        "Business Analyst",
        "Digital Marketing Specialist",
      );
    }

    if (role === "job_seeker") {
      suggestions.push("Software Developer");
    }

    if (role === "freelancer") {
      suggestions.push(
        "Freelance Developer",
        "Freelance Designer",
        "Digital Freelancer",
      );
    }

    if (role === "researcher") {
      suggestions.push("Research Scientist", "AI Researcher", "Data Scientist");
    }

    if (role === "educator") {
      suggestions.push(
        "Technical Educator",
        "Online Instructor",
        "Course Creator",
      );
    }

    if (role === "mentor") {
      suggestions.push("Career Mentor", "Technical Mentor", "Career Coach");
    }

    if (role === "content_creator") {
      suggestions.push(
        "Content Creator",
        "Technical Content Creator",
        "YouTube Educator",
      );
    }

    return [...new Set(suggestions)].slice(0, 10);
  };

  /*
|--------------------------------------------------------------------------
| Step 4 validation
|--------------------------------------------------------------------------
*/

  const validateStepFour = () => {
    console.log("🔍 STEP 4 VALIDATION DATA:", {
      careerGoal,
      targetRole,
      dailyStudyHours,
      learningStyle,
      preferredLanguage,
    });
    if (!careerGoal) {
      setError("Please select your main career goal.");
      return false;
    }

    if (!targetRole.trim()) {
      setError("Please select or enter your target career role.");
      return false;
    }

    if (!dailyStudyHours) {
      setError("Please select your available study time.");
      return false;
    }

    if (!learningStyle) {
      setError("Please select your preferred learning style.");
      return false;
    }

    return true;
  };

  /*
|--------------------------------------------------------------------------
| Step 4 renderer
|--------------------------------------------------------------------------
*/

  const renderStepFour = () => {
    const suggestedRoles = getSuggestedCareerRoles();

    const goals = [
      {
        value: "get_job",
        label: "Get a Job",
        description: "Prepare for jobs and placements",
        icon: "💼",
      },
      {
        value: "career_switch",
        label: "Switch Career",
        description: "Move into a new career",
        icon: "🔄",
      },
      {
        value: "career_growth",
        label: "Career Growth",
        description: "Grow in your current career",
        icon: "📈",
      },
      {
        value: "freelancing",
        label: "Start Freelancing",
        description: "Build a freelance career",
        icon: "💻",
      },
      {
        value: "business",
        label: "Start a Business",
        description: "Build your own business",
        icon: "🚀",
      },
      {
        value: "higher_studies",
        label: "Higher Studies",
        description: "Prepare for further education",
        icon: "🎓",
      },
      {
        value: "learn_skills",
        label: "Learn New Skills",
        description: "Improve your knowledge",
        icon: "📚",
      },
      {
        value: "research",
        label: "Research",
        description: "Explore research opportunities",
        icon: "🔬",
      },
    ];

    const studyHours = [
      {
        value: "1",
        label: "Less than 1 hour",
        icon: "⏱️",
      },
      {
        value: "2",
        label: "1–2 hours",
        icon: "🕐",
      },
      {
        value: "4",
        label: "2–4 hours",
        icon: "🕑",
      },
      {
        value: "6",
        label: "4–6 hours",
        icon: "🕓",
      },
      {
        value: "8",
        label: "6+ hours",
        icon: "🔥",
      },
    ];

    const learningStyles = [
      {
        value: "visual",
        label: "Visual",
        description: "Videos, diagrams and visual explanations",
        icon: "🎥",
      },
      {
        value: "reading",
        label: "Reading",
        description: "Articles, notes and documentation",
        icon: "📖",
      },
      {
        value: "practical",
        label: "Practical",
        description: "Projects and hands-on learning",
        icon: "💻",
      },
      {
        value: "mixed",
        label: "Mixed",
        description: "Combination of different methods",
        icon: "🧠",
      },
    ];

    const languages = [
      {
        value: "English",
        icon: "🇬🇧",
      },
      {
        value: "Marathi",
        icon: "🇮🇳",
      },
      {
        value: "Hindi",
        icon: "🇮🇳",
      },
      {
        value: "Other",
        icon: "🌐",
      },
    ];

    return (
      <>
        {/* =====================================================
          TITLE
      ===================================================== */}

        <div className="onboarding-title step4-title">
          <span className="onboarding-badge">YOUR CAREER DIRECTION</span>

          <h1>
            Where do you want
            <span> to go?</span>
          </h1>

          <p>
            Based on your profile, situation, skills and interests, let's
            understand what you want to achieve next.
          </p>
        </div>

        <section className="onboarding-section step4-section">
          {/* =================================================
            CAREER GOAL
        ================================================= */}

          <div className="step4-block">
            <div className="step4-heading">
              <div className="step4-heading-icon">🎯</div>

              <div>
                <h2>What is your main goal?</h2>

                <p className="section-description">
                  Choose the goal that best describes what you want to achieve.
                </p>
              </div>
            </div>

            <div className="step4-goal-grid">
              {goals.map((item) => {
                const selected = careerGoal === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    className={`step4-goal-card ${selected ? "selected" : ""}`}
                    onClick={() => {
                      setCareerGoal(item.value);
                      setError("");
                    }}
                  >
                    <span className="step4-goal-icon">{item.icon}</span>

                    <span className="step4-goal-content">
                      <strong>{item.label}</strong>

                      <small>{item.description}</small>
                    </span>

                    {selected && (
                      <span className="step4-selected-check">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* =================================================
            TARGET ROLE
        ================================================= */}

          <div className="step4-block">
            <div className="step4-heading">
              <div className="step4-heading-icon">💼</div>

              <div>
                <h2>What career or role are you targeting?</h2>

                <p className="section-description">
                  These suggestions are generated using your Step 1, Step 2 and
                  Step 3 information.
                </p>
              </div>
            </div>

            {suggestedRoles.length > 0 && (
              <div className="step4-role-suggestions">
                <span className="step4-label">Suggested for you</span>

                <div className="selection-grid">
                  {suggestedRoles.map((suggestedRole) => {
                    const selected = targetRole === suggestedRole;

                    return (
                      <button
                        key={suggestedRole}
                        type="button"
                        className={`selection-chip ${
                          selected ? "selected" : ""
                        }`}
                        onClick={() => {
                          setTargetRole(suggestedRole);
                          setError("");
                        }}
                      >
                        {selected && <span>✓</span>}

                        {suggestedRole}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="custom-selection step4-custom-role">
              <label htmlFor="step4TargetRole">
                Don't see your target role?
              </label>

              <input
                id="step4TargetRole"
                type="text"
                className="step4-text-input"
                placeholder="Type your target role... e.g. Backend Developer"
                value={targetRole}
                onChange={(e) => {
                  setTargetRole(e.target.value);
                  setError("");
                }}
              />

              <small>
                You can select a suggestion or type your own career.
              </small>
            </div>
          </div>

          {/* =================================================
            STUDY HOURS
        ================================================= */}

          <div className="step4-block">
            <div className="step4-heading">
              <div className="step4-heading-icon">⏰</div>

              <div>
                <h2>How much time can you learn each day?</h2>

                <p className="section-description">
                  EduPath AI will use this to create a realistic learning
                  roadmap.
                </p>
              </div>
            </div>

            <div className="step4-hours-grid">
              {studyHours.map((item) => {
                const selected = dailyStudyHours === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    className={`step4-hours-card ${selected ? "selected" : ""}`}
                    onClick={() => {
                      setDailyStudyHours(item.value);
                      setError("");
                    }}
                  >
                    <span className="step4-hours-icon">{item.icon}</span>

                    <strong>{item.label}</strong>

                    {selected && (
                      <span className="step4-selected-check">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* =================================================
            LEARNING STYLE
        ================================================= */}

          <div className="step4-block">
            <div className="step4-heading">
              <div className="step4-heading-icon">🧠</div>

              <div>
                <h2>How do you prefer to learn?</h2>

                <p className="section-description">
                  This helps us personalize your learning experience.
                </p>
              </div>
            </div>

            <div className="step4-learning-grid">
              {learningStyles.map((item) => {
                const selected = learningStyle === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    className={`step4-learning-card ${
                      selected ? "selected" : ""
                    }`}
                    onClick={() => {
                      setLearningStyle(item.value);
                      setError("");
                    }}
                  >
                    <span className="step4-learning-icon">{item.icon}</span>

                    <span className="step4-learning-content">
                      <strong>{item.label}</strong>

                      <small>{item.description}</small>
                    </span>

                    {selected && (
                      <span className="step4-selected-check">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* =================================================
            LANGUAGE
        ================================================= */}

          <div className="step4-block">
            <div className="step4-heading">
              <div className="step4-heading-icon">🌐</div>

              <div>
                <h2>What language do you prefer?</h2>

                <p className="section-description">
                  Choose the language you are most comfortable learning in.
                </p>
              </div>
            </div>

            <div className="step4-language-grid">
              {languages.map((language) => {
                const selected = preferredLanguage === language.value;

                return (
                  <button
                    key={language.value}
                    type="button"
                    className={`step4-language-card ${
                      selected ? "selected" : ""
                    }`}
                    onClick={() => {
                      setPreferredLanguage(language.value);
                      setError("");
                    }}
                  >
                    <span className="step4-language-icon">{language.icon}</span>

                    <strong>{language.value}</strong>

                    {selected && (
                      <span className="step4-selected-check">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* =================================================
            PERSONAL GOAL DESCRIPTION
        ================================================= */}

          <div className="step4-block">
            <div className="step4-heading">
              <div className="step4-heading-icon">✨</div>

              <div>
                <h2>Tell us more about your goal</h2>

                <p className="section-description">
                  Give EduPath AI some extra context about what you want to
                  achieve.
                </p>
              </div>
            </div>

            <textarea
              className="step4-goal-textarea"
              placeholder="Example: I want to become a backend developer, improve my Java and DSA skills and get a software development job within the next 6 months..."
              value={careerGoalDescription}
              onChange={(e) => {
                setCareerGoalDescription(e.target.value);
                setError("");
              }}
              rows={5}
            />

            <small className="step4-textarea-hint">
              You can mention your target role, timeline, company preference,
              skills you want to improve, or anything important about your
              career.
            </small>
          </div>
        </section>
      </>
    );
  };

  const validateStepFive = () => {
    if (!roadmapDuration) {
      setError("Please select your roadmap duration.");
      return false;
    }

    if (!weeklyStudyDays) {
      setError("Please select how many days you can study.");
      return false;
    }

    if (!experienceLevel) {
      setError("Please select your current experience level.");
      return false;
    }

    if (learningPriority.length === 0) {
      setError("Please select at least one learning priority.");
      return false;
    }

    if (!preferredLearningMode) {
      setError("Please select your preferred learning mode.");
      return false;
    }

    return true;
  };

  /*
|--------------------------------------------------------------------------
| Step 5
|--------------------------------------------------------------------------
*/

  const renderStepFive = () => {
    const roadmapDurations = [
      {
        value: "1_month",
        label: "1 Month",
        description: "Quick focused improvement",
        icon: "⚡",
      },
      {
        value: "3_months",
        label: "3 Months",
        description: "Build strong fundamentals",
        icon: "📈",
      },
      {
        value: "6_months",
        label: "6 Months",
        description: "Job-ready preparation",
        icon: "🚀",
      },
      {
        value: "12_months",
        label: "12 Months",
        description: "Deep long-term growth",
        icon: "🏆",
      },
    ];

    const studyDays = [
      {
        value: "3",
        label: "3 Days",
        icon: "🌱",
      },
      {
        value: "4",
        label: "4 Days",
        icon: "📚",
      },
      {
        value: "5",
        label: "5 Days",
        icon: "🔥",
      },
      {
        value: "6",
        label: "6 Days",
        icon: "💪",
      },
      {
        value: "7",
        label: "Every Day",
        icon: "⚡",
      },
    ];

    const priorities = [
      {
        value: "fundamentals",
        label: "Fundamentals",
        description: "Build strong basics",
        icon: "🧱",
      },
      {
        value: "coding",
        label: "Coding Skills",
        description: "Improve programming ability",
        icon: "💻",
      },
      {
        value: "dsa",
        label: "DSA",
        description: "Prepare algorithms & problem solving",
        icon: "🧩",
      },
      {
        value: "projects",
        label: "Projects",
        description: "Build practical projects",
        icon: "🛠️",
      },
      {
        value: "interview",
        label: "Interview Preparation",
        description: "Prepare for interviews",
        icon: "🎤",
      },
      {
        value: "resume",
        label: "Resume & Portfolio",
        description: "Improve professional profile",
        icon: "📄",
      },
      {
        value: "communication",
        label: "Communication",
        description: "Improve communication skills",
        icon: "🗣️",
      },
      {
        value: "career",
        label: "Career Guidance",
        description: "Understand career direction",
        icon: "🎯",
      },
    ];

    const experienceLevels = [
      {
        value: "beginner",
        label: "Beginner",
        description: "I'm starting from the basics",
        icon: "🌱",
      },
      {
        value: "intermediate",
        label: "Intermediate",
        description: "I know the basics",
        icon: "📊",
      },
      {
        value: "advanced",
        label: "Advanced",
        description: "I already have strong knowledge",
        icon: "🚀",
      },
      {
        value: "professional",
        label: "Professional",
        description: "I already work in this field",
        icon: "🏆",
      },
    ];

    const learningModes = [
      {
        value: "projects",
        label: "Project Based",
        description: "Learn by building real projects",
        icon: "🛠️",
      },
      {
        value: "practice",
        label: "Practice Based",
        description: "Learn through exercises",
        icon: "✍️",
      },
      {
        value: "theory",
        label: "Theory First",
        description: "Understand concepts deeply",
        icon: "📖",
      },
      {
        value: "mixed",
        label: "Mixed",
        description: "Combination of everything",
        icon: "🧠",
      },
    ];

    const toggleLearningPriority = (value) => {
      setLearningPriority((previous) => {
        if (previous.includes(value)) {
          return previous.filter((item) => item !== value);
        }

        return [...previous, value];
      });
    };

    return (
      <>
        {/* =====================================================
          TITLE
      ===================================================== */}

        <div className="onboarding-title step5-title">
          <span className="onboarding-badge">YOUR LEARNING PLAN</span>

          <h1>
            Let's build a plan
            <span> that fits you.</span>
          </h1>

          <p>
            EduPath AI will use your career direction, skills, interests and
            available time to create a personalized learning journey.
          </p>
        </div>

        <section className="onboarding-section step5-section">
          {/* =================================================
            PROFILE SUMMARY
        ================================================= */}

          <div className="step5-summary">
            <div className="step5-summary-item">
              <span>🎯</span>

              <div>
                <small>Target Role</small>

                <strong>{targetRole || "Not selected"}</strong>
              </div>
            </div>

            <div className="step5-summary-item">
              <span>⏰</span>

              <div>
                <small>Daily Time</small>

                <strong>
                  {dailyStudyHours
                    ? `${dailyStudyHours} hours`
                    : "Not selected"}
                </strong>
              </div>
            </div>

            <div className="step5-summary-item">
              <span>🌐</span>

              <div>
                <small>Language</small>

                <strong>{preferredLanguage}</strong>
              </div>
            </div>
          </div>

          {/* =================================================
            ROADMAP DURATION
        ================================================= */}

          <div className="step5-block">
            <div className="step5-heading">
              <div className="step5-heading-icon">🗓️</div>

              <div>
                <h2>How long do you want your plan to be?</h2>

                <p className="section-description">
                  Choose a timeline that feels realistic for you.
                </p>
              </div>
            </div>

            <div className="step5-duration-grid">
              {roadmapDurations.map((item) => {
                const selected = roadmapDuration === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    className={`step5-duration-card ${
                      selected ? "selected" : ""
                    }`}
                    onClick={() => {
                      setRoadmapDuration(item.value);
                      setError("");
                    }}
                  >
                    <span className="step5-card-icon">{item.icon}</span>

                    <strong>{item.label}</strong>

                    <small>{item.description}</small>

                    {selected && <span className="step5-check">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* =================================================
            STUDY DAYS
        ================================================= */}

          <div className="step5-block">
            <div className="step5-heading">
              <div className="step5-heading-icon">📅</div>

              <div>
                <h2>How many days can you study each week?</h2>

                <p className="section-description">
                  We'll distribute your learning tasks around your available
                  schedule.
                </p>
              </div>
            </div>

            <div className="step5-days-grid">
              {studyDays.map((item) => {
                const selected = weeklyStudyDays === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    className={`step5-day-card ${selected ? "selected" : ""}`}
                    onClick={() => {
                      setWeeklyStudyDays(item.value);
                      setError("");
                    }}
                  >
                    <span>{item.icon}</span>

                    <strong>{item.label}</strong>

                    {selected && <span className="step5-check">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* =================================================
            EXPERIENCE LEVEL
        ================================================= */}

          <div className="step5-block">
            <div className="step5-heading">
              <div className="step5-heading-icon">📊</div>

              <div>
                <h2>How would you describe your current level?</h2>

                <p className="section-description">
                  This helps us avoid giving you content that is too easy or too
                  difficult.
                </p>
              </div>
            </div>

            <div className="step5-experience-grid">
              {experienceLevels.map((item) => {
                const selected = experienceLevel === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    className={`step5-experience-card ${
                      selected ? "selected" : ""
                    }`}
                    onClick={() => {
                      setExperienceLevel(item.value);
                      setError("");
                    }}
                  >
                    <span className="step5-card-icon">{item.icon}</span>

                    <div>
                      <strong>{item.label}</strong>

                      <small>{item.description}</small>
                    </div>

                    {selected && <span className="step5-check">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* =================================================
            LEARNING PRIORITIES
        ================================================= */}

          <div className="step5-block">
            <div className="step5-heading">
              <div className="step5-heading-icon">🎯</div>

              <div>
                <h2>What should we prioritize?</h2>

                <p className="section-description">
                  Select all areas you want EduPath AI to focus on.
                </p>
              </div>
            </div>

            <div className="step5-priority-grid">
              {priorities.map((item) => {
                const selected = learningPriority.includes(item.value);

                return (
                  <button
                    key={item.value}
                    type="button"
                    className={`step5-priority-card ${
                      selected ? "selected" : ""
                    }`}
                    onClick={() => toggleLearningPriority(item.value)}
                  >
                    <span className="step5-card-icon">{item.icon}</span>

                    <div>
                      <strong>{item.label}</strong>

                      <small>{item.description}</small>
                    </div>

                    {selected && <span className="step5-check">✓</span>}
                  </button>
                );
              })}
            </div>

            {learningPriority.length > 0 && (
              <div className="step5-selected-count">
                ✓ {learningPriority.length} learning priorities selected
              </div>
            )}
          </div>

          {/* =================================================
            LEARNING MODE
        ================================================= */}

          <div className="step5-block">
            <div className="step5-heading">
              <div className="step5-heading-icon">🧠</div>

              <div>
                <h2>How would you like to learn?</h2>

                <p className="section-description">
                  Choose the approach that works best for you.
                </p>
              </div>
            </div>

            <div className="step5-mode-grid">
              {learningModes.map((item) => {
                const selected = preferredLearningMode === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    className={`step5-mode-card ${selected ? "selected" : ""}`}
                    onClick={() => {
                      setPreferredLearningMode(item.value);
                      setError("");
                    }}
                  >
                    <span className="step5-card-icon">{item.icon}</span>

                    <div>
                      <strong>{item.label}</strong>

                      <small>{item.description}</small>
                    </div>

                    {selected && <span className="step5-check">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* =================================================
            ADDITIONAL GOAL
        ================================================= */}

          <div className="step5-block">
            <div className="step5-heading">
              <div className="step5-heading-icon">✨</div>

              <div>
                <h2>Anything else we should know?</h2>

                <p className="section-description">
                  Optional — tell us anything that can help personalize your
                  roadmap.
                </p>
              </div>
            </div>

            <textarea
              className="step5-textarea"
              rows={4}
              placeholder="Example: I have college from 1 PM to 6 PM, so I prefer studying at night..."
              value={additionalGoal}
              onChange={(e) => {
                setAdditionalGoal(e.target.value);
                setError("");
              }}
            />
          </div>
        </section>
      </>
    );
  };

  /*
|--------------------------------------------------------------------------
| Step 6 Validation
|--------------------------------------------------------------------------
*/

  const validateStepSix = () => {
    if (!role && !customRole) {
      setError("Profile role is missing. Please go back to Step 1.");
      return false;
    }

    if (!selectedSkills || selectedSkills.length === 0) {
      setError("Please select at least one skill.");
      return false;
    }

    if (!selectedInterests || selectedInterests.length === 0) {
      setError("Please select at least one interest.");
      return false;
    }

    if (!careerGoal) {
      setError("Career goal is missing. Please go back to Step 4.");
      return false;
    }

    if (!targetRole) {
      setError("Target role is missing. Please go back to Step 4.");
      return false;
    }

    if (!dailyStudyHours) {
      setError("Daily study hours are missing.");
      return false;
    }

    if (!roadmapDuration) {
      setError("Roadmap duration is missing. Please go back to Step 5.");
      return false;
    }

    if (!weeklyStudyDays) {
      setError("Study days are missing. Please go back to Step 5.");
      return false;
    }

    if (!experienceLevel) {
      setError("Experience level is missing. Please go back to Step 5.");
      return false;
    }

    if (!learningPriority || learningPriority.length === 0) {
      setError("Please select at least one learning priority.");
      return false;
    }

    if (!preferredLearningMode) {
      setError("Learning mode is missing. Please go back to Step 5.");
      return false;
    }

    setError("");

    return true;
  };
  /*
|--------------------------------------------------------------------------
| Step 6 - Review & Complete Profile
|--------------------------------------------------------------------------
*/

  const renderStepSix = () => {
    const selectedRoleData = USER_ROLES.find((item) => item.value === role);

    const displayRole = selectedRoleData?.label || customRole || "Not selected";

    const displayRoleIcon = selectedRoleData?.icon || "👤";

    return (
      <>
        {/* =====================================================
          TITLE
      ===================================================== */}

        <div className="onboarding-title step6-title">
          <span className="onboarding-badge">FINAL REVIEW</span>

          <h1>
            Your personalized journey
            <span> starts here.</span>
          </h1>

          <p>
            Review the information you've provided. EduPath AI will use this
            information to personalize your learning, career and placement
            journey.
          </p>
        </div>

        <section className="onboarding-section step6-section">
          {/* =================================================
            PROFILE OVERVIEW
        ================================================= */}

          <div className="step6-card">
            <div className="step6-card-header">
              <div className="step6-header-icon">{displayRoleIcon}</div>

              <div>
                <span className="step6-label">YOUR PROFILE</span>

                <h2>{displayRole}</h2>
              </div>
            </div>

            <div className="step6-profile-status">
              <span className="step6-status-dot"></span>
              Profile information ready
            </div>
          </div>

          {/* =================================================
            CAREER DIRECTION
        ================================================= */}

          <div className="step6-card">
            <div className="step6-section-heading">
              <div className="step6-heading-icon">🎯</div>

              <div>
                <h2>Career Direction</h2>

                <p>Your current career goal and target role.</p>
              </div>
            </div>

            <div className="step6-info-grid">
              <div className="step6-info-item">
                <span>Career Goal</span>

                <strong>{careerGoal || "Not specified"}</strong>
              </div>

              <div className="step6-info-item">
                <span>Target Role</span>

                <strong>{targetRole || "Not specified"}</strong>
              </div>

              {careerGoalDescription && (
                <div className="step6-info-item step6-full-width">
                  <span>Additional Career Information</span>

                  <strong>{careerGoalDescription}</strong>
                </div>
              )}
            </div>
          </div>

          {/* =================================================
            SKILLS & INTERESTS
        ================================================= */}

          <div className="step6-card">
            <div className="step6-section-heading">
              <div className="step6-heading-icon">🧠</div>

              <div>
                <h2>Skills & Interests</h2>

                <p>What you already know and what you want to explore.</p>
              </div>
            </div>

            {/* Skills */}

            <div className="step6-subsection">
              <h3>Your Skills</h3>

              {selectedSkills.length > 0 ? (
                <div className="step6-tags">
                  {selectedSkills.map((skill) => (
                    <span key={skill} className="step6-tag skill-tag">
                      ✓ {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="step6-empty">No skills selected</span>
              )}
            </div>

            {/* Interests */}

            <div className="step6-subsection">
              <h3>Your Interests</h3>

              {selectedInterests.length > 0 ? (
                <div className="step6-tags">
                  {selectedInterests.map((interest) => (
                    <span key={interest} className="step6-tag interest-tag">
                      ♥ {interest}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="step6-empty">No interests selected</span>
              )}
            </div>
          </div>

          {/* =================================================
            LEARNING PLAN
        ================================================= */}

          <div className="step6-card">
            <div className="step6-section-heading">
              <div className="step6-heading-icon">📚</div>

              <div>
                <h2>Your Learning Plan</h2>

                <p>
                  EduPath AI will use these preferences to personalize your
                  roadmap.
                </p>
              </div>
            </div>

            <div className="step6-learning-grid">
              <div className="step6-learning-item">
                <span className="step6-learning-icon">🗓️</span>

                <div>
                  <small>Roadmap Duration</small>

                  <strong>
                    {roadmapDuration
                      ? roadmapDuration.replace("_", " ")
                      : "Not selected"}
                  </strong>
                </div>
              </div>

              <div className="step6-learning-item">
                <span className="step6-learning-icon">📅</span>

                <div>
                  <small>Study Days</small>

                  <strong>
                    {weeklyStudyDays
                      ? `${weeklyStudyDays} days / week`
                      : "Not selected"}
                  </strong>
                </div>
              </div>

              <div className="step6-learning-item">
                <span className="step6-learning-icon">📊</span>

                <div>
                  <small>Experience Level</small>

                  <strong>{experienceLevel || "Not selected"}</strong>
                </div>
              </div>

              <div className="step6-learning-item">
                <span className="step6-learning-icon">🧠</span>

                <div>
                  <small>Learning Mode</small>

                  <strong>{preferredLearningMode || "Not selected"}</strong>
                </div>
              </div>

              <div className="step6-learning-item">
                <span className="step6-learning-icon">⏰</span>

                <div>
                  <small>Daily Study Hours</small>

                  <strong>
                    {dailyStudyHours
                      ? `${dailyStudyHours} hours`
                      : "Not selected"}
                  </strong>
                </div>
              </div>

              <div className="step6-learning-item">
                <span className="step6-learning-icon">🌐</span>

                <div>
                  <small>Preferred Language</small>

                  <strong>{preferredLanguage || "English"}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
            PRIORITIES
        ================================================= */}

          <div className="step6-card">
            <div className="step6-section-heading">
              <div className="step6-heading-icon">🚀</div>

              <div>
                <h2>Your Priorities</h2>

                <p>Areas EduPath AI should focus on first.</p>
              </div>
            </div>

            {learningPriority.length > 0 ? (
              <div className="step6-priority-list">
                {learningPriority.map((priority) => (
                  <span key={priority} className="step6-priority">
                    ✓ {priority}
                  </span>
                ))}
              </div>
            ) : (
              <span className="step6-empty">No priorities selected</span>
            )}
          </div>

          {/* =================================================
            ADDITIONAL GOAL
        ================================================= */}

          {additionalGoal?.trim() && (
            <div className="step6-card">
              <div className="step6-section-heading">
                <div className="step6-heading-icon">✨</div>

                <div>
                  <h2>Additional Information</h2>

                  <p>Something extra you want EduPath AI to know.</p>
                </div>
              </div>

              <div className="step6-additional-goal">{additionalGoal}</div>
            </div>
          )}

          {/* =================================================
            FINAL MESSAGE
        ================================================= */}

          <div className="step6-final-message">
            <div className="step6-final-icon">🚀</div>

            <div>
              <h3>Ready to begin?</h3>

              <p>
                Click <strong>Complete Profile</strong> and EduPath AI will save
                your profile and prepare your personalized experience.
              </p>
            </div>
          </div>
        </section>
      </>
    );
  };
  /*
  |--------------------------------------------------------------------------
  | Main UI
  |--------------------------------------------------------------------------
  */

  return (
    <div className="onboarding-page">
      <div className="onboarding-container">
        {/* Header */}

        <header className="onboarding-header">
          <div
            className="onboarding-logo"
            onClick={() => navigate("/career-Explorer")}
            role="button"
            tabIndex={0}
          >
            <span>🎓</span>

            <strong>EduPath AI</strong>
          </div>

          <div className="onboarding-progress">
            <div className="progress-text">
              <span>Profile Setup</span>

              <strong>Step {step} of 6</strong>
            </div>

            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width: `${(step / 6) * 100}%`,
                }}
              />
            </div>
          </div>
        </header>

        {/* Main */}

        <main className="onboarding-content">
          {/* STEP 1 */}

          {step === 1 && (
            <>
              <div className="onboarding-title">
                <span className="onboarding-badge">
                  PERSONALIZE YOUR JOURNEY
                </span>

                <h1>
                  Tell us about <span>yourself.</span>
                </h1>

                <p>
                  EduPath AI uses your background, skills and goals to create a
                  personalized career and learning journey.
                </p>
              </div>

              <section className="onboarding-section">
                <h2>What best describes you?</h2>

                <p className="section-description">
                  Choose the option that matches your current situation.
                </p>

                <div className="role-grid">
                  {USER_ROLES.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      className={`role-card ${
                        role === item.value ? "selected" : ""
                      }`}
                      onClick={() => handleRoleSelect(item.value)}
                    >
                      <span className="role-icon">{item.icon}</span>

                      <span className="role-content">
                        <strong>{item.label}</strong>

                        <small>{item.description}</small>
                      </span>

                      {role === item.value && (
                        <span className="selected-check">✓</span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="custom-role">
                  <label htmlFor="customRole">Don't see your option?</label>

                  <input
                    id="customRole"
                    type="text"
                    placeholder="Type your role or situation..."
                    value={customRole}
                    onChange={handleCustomRoleChange}
                  />

                  <small>You can describe your role in your own words.</small>
                </div>
              </section>
            </>
          )}

          {/* STEP 2 */}

          {step === 2 && (
            <>
              <div className="onboarding-title">
                <span className="onboarding-badge">YOUR CURRENT SITUATION</span>

                <h1>
                  Where are you <span>right now?</span>
                </h1>

                <p>
                  Tell us about your current education, work, experience or
                  professional situation.
                </p>
              </div>

              <section className="onboarding-section">
                <div className="selected-role-display">
                  <span>
                    {USER_ROLES.find((item) => item.value === role)?.icon ||
                      "👤"}
                  </span>

                  <div>
                    <small>Your selected profile</small>

                    <strong>
                      {USER_ROLES.find((item) => item.value === role)?.label ||
                        customRole}
                    </strong>
                  </div>
                </div>

                <h2>Tell us about your current situation</h2>

                <p className="section-description">
                  This information helps EduPath AI understand your starting
                  point.
                </p>

                {renderSituationForm()}
              </section>
            </>
          )}

          {/* STEP 3 */}

          {step === 3 && renderStepThree()}

          {/* STEP 4 */}

          {step === 4 && renderStepFour()}

          {/* STEP 5 */}

          {step === 5 && renderStepFive()}

          {/* STEP 6 */}

          {step === 6 && renderStepSix()}

          {/* Error */}

          {error && <div className="onboarding-error">⚠️ {error}</div>}

          {/* Actions */}

          <div className="onboarding-actions">
            <button
              type="button"
              className="onboarding-back"
              onClick={handleBack}
            >
              ← Back
            </button>

            <button
              type="button"
              className="onboarding-continue"
              onClick={handleContinue}
            >
              {step === 6 ? "Complete Profile" : "Continue →"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Onboarding;
