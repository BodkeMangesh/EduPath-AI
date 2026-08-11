const { body } = require("express-validator");

// ==============================
// Career Validation
// ==============================

const validateCreateCareer = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Career name is required.")
    .isLength({ min: 3, max: 100 })
    .withMessage("Career name must be between 3 and 100 characters."),

  body("slug")
    .trim()
    .notEmpty()
    .withMessage("Career slug is required.")
    .matches(/^[a-z0-9-]+$/)
    .withMessage(
      "Slug can only contain lowercase letters, numbers and hyphens.",
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

  body("eligibility")
    .optional()
    .isArray()
    .withMessage("Eligibility must be an array."),

  body("tags").optional().isArray().withMessage("Tags must be an array."),

  body("averageSalary").optional().trim(),

  body("growthRate").optional().trim(),

  body("demand").optional().trim(),

  body("roadmapTemplate").optional().trim(),

  body("assessmentTemplate").optional().trim(),

  body("aiPrompt").optional().trim(),
];

// ==============================
// Career Category Validation
// ==============================

const validateCreateCategory = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Category name is required.")
    .isLength({ min: 3, max: 50 })
    .withMessage("Category name must be between 3 and 50 characters."),

  body("slug")
    .trim()
    .notEmpty()
    .withMessage("Category slug is required.")
    .matches(/^[a-z0-9-]+$/)
    .withMessage(
      "Slug can only contain lowercase letters, numbers and hyphens.",
    ),

  body("icon").optional().trim(),

  body("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters."),
];

module.exports = {
  validateCreateCareer,
  validateCreateCategory,
};
