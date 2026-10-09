const multer = require("multer");
const path = require("path");
const fs = require("fs");

/*
|--------------------------------------------------------------------------
| Resume Upload Directory
|--------------------------------------------------------------------------
*/

const uploadDirectory = path.join(__dirname, "../uploads/resumes");

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

/*
|--------------------------------------------------------------------------
| Storage Configuration
|--------------------------------------------------------------------------
*/

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);

    const originalName = path
      .basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9-_]/g, "_")
      .replace(/_+/g, "_")
      .substring(0, 80);

    const userId = req.user?._id || req.user?.id || "user";

    const timestamp = Date.now();

    const filename = `${userId}_${timestamp}_${originalName}${extension.toLowerCase()}`;

    cb(null, filename);
  },
});

/*
|--------------------------------------------------------------------------
| Allowed Resume File Types
|--------------------------------------------------------------------------
*/

const allowedMimeTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const allowedExtensions = [".pdf", ".doc", ".docx"];

/*
|--------------------------------------------------------------------------
| File Filter
|--------------------------------------------------------------------------
*/

const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();

  const mimeTypeAllowed = allowedMimeTypes.includes(file.mimetype);

  const extensionAllowed = allowedExtensions.includes(extension);

  if (!mimeTypeAllowed || !extensionAllowed) {
    return cb(
      new Error("Only PDF, DOC, and DOCX resume files are allowed."),
      false,
    );
  }

  cb(null, true);
};

/*
|--------------------------------------------------------------------------
| Multer Configuration
|--------------------------------------------------------------------------
*/

const uploadResume = multer({
  storage,

  fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
});

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

module.exports = uploadResume;
