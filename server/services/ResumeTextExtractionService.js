const fs = require("fs");
const path = require("path");
const { PDFParse } = require("pdf-parse");
const mammoth = require("mammoth");

class ResumeTextExtractionService {
  normalizeText(text = "") {
    return text
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  async extractPdfText(filePath) {
    if (!filePath) {
      throw new Error("PDF file path is required.");
    }

    if (!fs.existsSync(filePath)) {
      throw new Error("PDF file not found.");
    }

    const fileBuffer = fs.readFileSync(filePath);

    if (!fileBuffer.length) {
      throw new Error("PDF file is empty.");
    }

    const parser = new PDFParse({
      data: fileBuffer,
    });

    const data = await parser.getText();

    await parser.destroy();

    const text = this.normalizeText(data?.text || "");

    if (!text) {
      throw new Error("No readable text was found in the PDF resume.");
    }

    return {
      text,
      pageCount: data?.total || 0,
    };
  }

  async extractDocxText(filePath) {
    if (!filePath) {
      throw new Error("DOCX file path is required.");
    }

    if (!fs.existsSync(filePath)) {
      throw new Error("DOCX file not found.");
    }

    const result = await mammoth.extractRawText({
      path: filePath,
    });

    const text = this.normalizeText(result?.value || "");

    if (!text) {
      throw new Error("No readable text was found in the DOCX resume.");
    }

    return {
      text,
      messages: result?.messages || [],
    };
  }

  async extractText(filePath) {
    if (!filePath) {
      throw new Error("Resume file path is required.");
    }

    const extension = path.extname(filePath).toLowerCase();

    switch (extension) {
      case ".pdf":
        return this.extractPdfText(filePath);

      case ".docx":
        return this.extractDocxText(filePath);

      default:
        throw new Error(
          "Unsupported resume format. Only PDF and DOCX are supported.",
        );
    }
  }

  async extractResume(filePath) {
    if (!filePath) {
      throw new Error("Resume file path is required.");
    }

    const extension = path.extname(filePath).toLowerCase();

    const result = await this.extractText(filePath);

    const text = result.text || "";

    return {
      text,
      fileType: extension.replace(".", ""),
      pageCount: result.pageCount || 0,
      messages: result.messages || [],
      characterCount: text.length,
      wordCount: text.split(/\s+/).filter(Boolean).length,
    };
  }
}

module.exports = new ResumeTextExtractionService();
