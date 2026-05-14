import { GoogleGenerativeAI } from "@google/generative-ai";
import createError from "http-errors";
import { s3, bucketName } from "../utils/s3Config.js";
import { GetObjectCommand } from "@aws-sdk/client-s3";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const scanCertificate = async (req, res, next) => {
  try {
    const imageFile = req.file;
    if (!imageFile) {
      throw createError(400, "Please upload a certificate image.");
    }

    let imageContent;
    let mimeType = imageFile.mimetype || "image/jpeg";
    
    // Handle S3 storage
    if (imageFile.key) {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: imageFile.key,
      });
      const response = await s3.send(command);
      const byteArray = await response.Body.transformToByteArray();
      imageContent = Buffer.from(byteArray).toString("base64");
    } else if (imageFile.buffer) {
      imageContent = imageFile.buffer.toString("base64");
    } else {
      throw createError(400, "Image content not found.");
    }

    console.log("🚀 Starting Gemini AI scan...");

    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `
      Analyze this student certificate (SSLC/10th or similar) and extract the following details in a strict JSON format.
      If a field is not found, return an empty string.
      
      Required Fields:
      - name: Full name of the candidate
      - dob: Date of Birth in YYYY-MM-DD format
      - gender: "Male", "Female", or "Other"
      - religion: Candidate's religion
      - caste: Candidate's caste
      - fatherName: Father's name
      - motherName: Mother's name
      - address: Full permanent address
      - tenthCompletionYear: Year of passing (4 digits)
      - tenthBoard: Name of the education board (e.g., KERALA STATE BOARD, CBSE, ICSE)
      - tenthTotalMarks: Maximum marks possible
      - tenthObtainedMarks: Marks obtained by the candidate

      Return ONLY the JSON object.
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageContent,
          mimeType
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();
    
    // Clean JSON response from Gemini (it might include markdown code blocks)
    const jsonString = text.replace(/```json|```/g, "").trim();
    const fields = JSON.parse(jsonString);

    console.log("✅ Gemini AI scan successful!");

    res.status(200).json({
      success: true,
      engine: "gemini",
      data: {
        fields
      }
    });

  } catch (error) {
    console.error("❌ Gemini API Error:", error.message);
    next(error);
  }
};
