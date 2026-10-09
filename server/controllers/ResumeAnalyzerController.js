const asyncHandler = require("../middleware/asyncHandler");
const ResumeAnalyzerService = require("../services/ResumeAnalyzerService");

/*
|--------------------------------------------------------------------------
| Get Resume Analysis
|--------------------------------------------------------------------------
| GET /api/v1/resume-analyzer
*/
exports.getAnalysis = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "User authentication is required.",
    });
  }

  const analysis = await ResumeAnalyzerService.getAnalysis(userId);

  return res.status(200).json({
    success: true,
    message: "Resume analysis retrieved successfully.",
    data: analysis,
  });
});

/*
|--------------------------------------------------------------------------
| Create Resume Analyzer Profile
|--------------------------------------------------------------------------
| POST /api/v1/resume-analyzer
*/
exports.createAnalysis = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "User authentication is required.",
    });
  }

  const analysis = await ResumeAnalyzerService.createAnalysis(userId);

  return res.status(201).json({
    success: true,
    message: "Resume analyzer profile created successfully.",
    data: analysis,
  });
});

/*
|--------------------------------------------------------------------------
| Analyze Resume / Profile
|--------------------------------------------------------------------------
| POST /api/v1/resume-analyzer/analyze
*/
exports.analyzeResume = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "User authentication is required.",
    });
  }

  const analysis = await ResumeAnalyzerService.analyzeProfile(userId);

  return res.status(200).json({
    success: true,
    message: "Resume analyzed successfully.",
    data: analysis,
  });
});

/*
|--------------------------------------------------------------------------
| Upload Resume
|--------------------------------------------------------------------------
| POST /api/v1/resume-analyzer/upload
|
| req.file is created by uploadResume.single("resume")
|
| Flow:
| Controller
|    ↓
| ResumeAnalyzerService.uploadResume()
|    ↓
| ResumeTextExtractionService
|    ↓
| MongoDB
|--------------------------------------------------------------------------
*/
exports.uploadResume = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "User authentication is required.",
    });
  }

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message:
        "Resume file is required. Please upload a PDF, DOC, or DOCX file.",
    });
  }

  const analysis = await ResumeAnalyzerService.uploadResume(userId, req.file);

  return res.status(200).json({
    success: true,
    message: "Resume uploaded and text extracted successfully.",
    data: {
      analysis,
      file: {
        originalName: req.file.originalname,
        fileName: req.file.filename,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        fileUrl: `/uploads/resumes/${req.file.filename}`,
      },
    },
  });
});

/*
|--------------------------------------------------------------------------
| Update Resume Information
|--------------------------------------------------------------------------
| PATCH /api/v1/resume-analyzer/resume
|--------------------------------------------------------------------------
*/
exports.updateResume = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "User authentication is required.",
    });
  }

  const {
    fileName,
    fileUrl,
    fileType,
    fileSize,
    uploaded,
    extractedText,
    pageCount,
    characterCount,
    wordCount,
  } = req.body || {};

  const analysis = await ResumeAnalyzerService.updateResume(userId, {
    fileName,
    fileUrl,
    fileType,
    fileSize,
    uploaded,
    extractedText,
    pageCount,
    characterCount,
    wordCount,
  });

  return res.status(200).json({
    success: true,
    message: "Resume information updated successfully.",
    data: analysis,
  });
});

/*
|--------------------------------------------------------------------------
| Update Resume Suggestion
|--------------------------------------------------------------------------
| PATCH /api/v1/resume-analyzer/suggestions/:suggestionId
|--------------------------------------------------------------------------
*/
exports.updateSuggestion = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "User authentication is required.",
    });
  }

  const { suggestionId } = req.params;

  if (!suggestionId) {
    return res.status(400).json({
      success: false,
      message: "Suggestion ID is required.",
    });
  }

  const { completed } = req.body || {};

  const analysis = await ResumeAnalyzerService.updateSuggestion(
    userId,
    suggestionId,
    completed,
  );

  return res.status(200).json({
    success: true,
    message: "Resume suggestion updated successfully.",
    data: analysis,
  });
});

module.exports = exports;
