const careerKnowledgeBase = [
  {
    id: "backend-developer",

    title: "Backend Developer",

    description:
      "Backend Developers build scalable server-side applications, APIs, databases and business logic.",

    category: "Software Development",

    difficulty: "Intermediate",

    estimatedDuration: "6-9 Months",

    averageStudyHours: 3,

    salary: {
      fresher: "4-8 LPA",
      experienced: "10-25 LPA",
    },

    requiredSkills: [
      "Java",
      "OOP",
      "Collections",
      "Exception Handling",
      "JDBC",
      "SQL",
      "Spring Boot",
      "REST API",
      "MongoDB",
      "Git",
    ],

    optionalSkills: ["Redis", "Docker", "AWS", "Kafka", "Microservices"],

    softSkills: [
      "Communication",
      "Problem Solving",
      "Teamwork",
      "Time Management",
    ],

    learningOrder: [
      "Java",
      "OOP",
      "Collections",
      "Exception Handling",
      "JDBC",
      "SQL",
      "Spring Boot",
      "REST API",
      "MongoDB",
      "Git",
      "Projects",
      "Deployment",
    ],

    roadmap: [
      {
        phase: 1,
        title: "Programming Fundamentals",
        duration: "2 Weeks",
        topics: ["Java", "OOP", "Collections", "Exception Handling"],
      },

      {
        phase: 2,
        title: "Database",
        duration: "2 Weeks",
        topics: ["SQL", "MongoDB"],
      },
      {
        phase: 3,
        title: "Backend Development",
        duration: "4 Weeks",
        topics: ["Spring Boot", "REST API"],
      },
      {
        phase: 4,
        title: "Projects",
        duration: "4 Weeks",
        topics: ["Authentication System", "Hospital Management System"],
      },
    ],

    projects: [
      "Authentication System",
      "E-Commerce Backend",
      "Hospital Management System",
      "Learning Management System",
    ],

    interviewTopics: [
      "Java Core",
      "Collections",
      "Multithreading",
      "JDBC",
      "Spring Boot",
      "REST APIs",
      "SQL",
      "MongoDB",
      "System Design Basics",
    ],

    certifications: ["Oracle Java", "Spring Professional", "MongoDB Associate"],
  },
];

module.exports = careerKnowledgeBase;
