import vision from "@google-cloud/vision";
import createError from "http-errors";
import fs from "fs";
import path from "path";
import { s3, bucketName } from "../utils/s3Config.js";
import { GetObjectCommand } from "@aws-sdk/client-s3";

// Initialize the client
let client = null;

try {
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  console.log("🔍 Checking Google Credentials at:", credentialsPath);

  if (!credentialsPath) {
    console.warn("⚠️ GOOGLE_APPLICATION_CREDENTIALS not set in .env");
  } else if (!fs.existsSync(credentialsPath)) {
    console.warn("❌ Google Key file NOT FOUND at specified path!");
  } else {
    console.log("✅ Google Key file detected.");
    client = new vision.ImageAnnotatorClient();
  }
} catch (err) {
  console.error("❌ Google Vision Client failed to initialize:", err.message);
}

export const scanCertificate = async (req, res, next) => {
  try {
    const imageFile = req.file;
    if (!imageFile) {
      throw createError(400, "Please upload a certificate image.");
    }

    let imageContent;
    
    // Handle S3 storage
    if (imageFile.key) {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: imageFile.key,
      });
      const response = await s3.send(command);
      const byteArray = await response.Body.transformToByteArray();
      imageContent = Buffer.from(byteArray);
    } else {
      // Fallback for local storage (if any still exists)
      imageContent = imageFile.path;
    }

    let fullText = "";
    let extractionSuccessful = false;

    if (client) {
      try {
        console.log("🚀 Starting Google Cloud Vision scan...");
        // Pass imageContent (buffer or path)
        const [result] = await client.textDetection(imageContent);
        const detections = result.textAnnotations;
        
        if (detections && detections.length > 0) {
          fullText = detections[0].description;
          extractionSuccessful = true;
          console.log("✅ Google Cloud Vision scan successful!");
        }
      } catch (googleError) {
        console.error("❌ Google Vision API Error:", googleError.message);
        // Billing/Activation errors usually fall here
      }
    }

    // If Google failed or was not initialized, send fallback signal
    if (!extractionSuccessful) {
      return res.status(200).json({
        success: false,
        fallback: true,
        message: "Cloud AI pending or unavailable. Switching to local engine..."
      });
    }

    // Process data if Google succeeded
    const fields = extractFields(fullText);

    res.status(200).json({
      success: true,
      engine: "google",
      data: {
        text: fullText,
        fields
      }
    });

  } catch (error) {
    next(error);
  }
};

function extractFields(fullText) {
    const cleanText = fullText.replace(/\s\s+/g, ' ').trim();
    const fields = {};
    
    // 1. Name (Flexible matching)
    const nameMatch = fullText.match(/(?:Name of Candidate|Name)[\s]*[:]*[\s]*([A-Z\s.]{3,45})/i);
    if (nameMatch) fields.name = nameMatch[1].trim().replace(/BOARD|GOVERNMENT|CERTIFICATE|SSLC/gi, "").trim();

    // 2. DOB
    const dobMatch = fullText.match(/(?:Date of Birth|DOB)[\s]*[\(]*[in figures]*[\)]*[\s]*[:]*[\s]*(\d{2}[\/\-]\d{2}[\/\-]\d{4})/i);
    if (dobMatch) {
      const p = dobMatch[1].split(/[\/\-]/);
      fields.dob = `${p[2]}-${p[1]}-${p[0]}`;
    }

    // 3. Gender
    const sexMatch = fullText.match(/(?:Sex|Gender)[\s]*[:]*[\s]*(MALE|FEMALE)/i);
    if (sexMatch) fields.gender = sexMatch[1].charAt(0).toUpperCase() + sexMatch[1].slice(1).toLowerCase();

    // 4. Religion & Caste
    const rcMatch = fullText.match(/(?:Religion & Caste|Religion)[\s]*[:]*[\s]*([A-Z\s,]{3,35})/i);
    if (rcMatch) {
      const split = rcMatch[1].split(",");
      fields.religion = split[0]?.trim();
      fields.caste = split[1]?.trim();
    }

    // 5. Parents
    const motherMatch = fullText.match(/(?:Name of Mother|Mother)[\s]*[:]*[\s]*([A-Z\s.]{3,40})/i);
    if (motherMatch) fields.motherName = motherMatch[1].trim();

    const fatherMatch = fullText.match(/(?:Name of Father|Father)[\s]*[:]*[\s]*([A-Z\s.]{3,40})/i);
    if (fatherMatch) fields.fatherName = fatherMatch[1].trim();

    // 6. Address
    const addressMatch = fullText.match(/(?:Home Address|Address)[\s]*[:]*[\s]*([A-Z0-9\s,\-().\n]{15,200})/i);
    if (addressMatch) fields.address = addressMatch[1].trim().replace(/\n/g, " ");

    // 7. Year
    const yearMatch = fullText.match(/(?:Month & Year|Year)[\s]*[:]*[\s]*[A-Z\s]*(\d{4})/i);
    if (yearMatch) fields.tenthCompletionYear = yearMatch[1];

    if (fullText.toLowerCase().includes("kerala")) {
      fields.tenthBoard = "KERALA STATE BOARD";
    }

    return fields;
}
