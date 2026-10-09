const { body } = require("express-validator");

const validateCreateCareer = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Career name is required.")
    .isLength({ min: 3, max: 100 })
    .withMessage("Career name must be between 3 and 100 characters."),

  body("careerId")
    .trim()
    .notEmpty()
    .withMessage("Career ID is required.")
    .matches(/^[a-z0-9-]+$/)
    .withMessage(
      "Career ID can contain only lowercase letters, numbers, and hyphens.",
    ),

  body("slug")
    .trim()
    .notEmpty()
    .withMessage("Career slug is required.")
    .matches(/^[a-z0-9-]+$/)
    .withMessage(
      "Career slug can contain only lowercase letters, numbers, and hyphens.",
    ),

  body("categorySlug")
    .trim()
    .notEmpty()
    .withMessage("Career category is required."),

  body("description")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters."),

  body("skills").optional().isArray().withMessage("Skills must be an array."),

  body("skills.*")
    .optional()
    .isString()
    .withMessage("Each skill must be a string."),

  body("eligibility")
    .optional()
    .isArray()
    .withMessage("Eligibility must be an array."),

  body("eligibility.*")
    .optional()
    .isString()
    .withMessage("Each eligibility item must be a string."),

  body("tags").optional().isArray().withMessage("Tags must be an array."),

  body("tags.*")
    .optional()
    .isString()
    .withMessage("Each tag must be a string."),

  body("averageSalary").optional().trim(),

  body("growthRate").optional().trim(),

  body("demand").optional().trim(),

  body("roadmap").optional().isArray().withMessage("Roadmap must be an array."),

  body("roadmap.*.phase")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Roadmap phase must be a number greater than or equal to 1."),

  body("roadmap.*.title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Roadmap phase title is required."),

  body("roadmap.*.duration").optional().trim(),

  body("roadmap.*.topics")
    .optional()
    .isArray()
    .withMessage("Roadmap topics must be an array."),

  body("roadmap.*.topics.*")
    .optional()
    .isString()
    .withMessage("Each roadmap topic must be a string."),

  body("roadmap.*.projects")
    .optional()
    .isArray()
    .withMessage("Roadmap projects must be an array."),

  body("roadmap.*.projects.*")
    .optional()
    .isString()
    .withMessage("Each roadmap project must be a string."),

  body("roadmap.*.interviewTopics")
    .optional()
    .isArray()
    .withMessage("Roadmap interview topics must be an array."),

  body("roadmap.*.interviewTopics.*")
    .optional()
    .isString()
    .withMessage("Each roadmap interview topic must be a string."),

  body("assessmentTemplate").optional().trim(),

  body("aiPrompt").optional().trim(),
];

const validateCreateCategory = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Category name is required.")
    .isLength({ min: 2, max: 100 })
    .withMessage("Category name must be between 2 and 100 characters."),

  body("slug")
    .trim()
    .notEmpty()
    .withMessage("Category slug is required.")
    .matches(/^[a-z0-9-]+$/)
    .withMessage(
      "Category slug can contain only lowercase letters, numbers, and hyphens.",
    ),

  body("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters."),
];

module.exports = {
  validateCreateCareer,
  validateCreateCategory,
};
