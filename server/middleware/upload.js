import multer from "multer";
import multerS3 from "multer-s3";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { s3, bucketName } from "../utils/s3Config.js";

const storage = multerS3({
  s3: s3,
  bucket: bucketName,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  metadata: (req, file, cb) => {
    cb(null, { fieldName: file.fieldname });
  },
  key: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    let folder = "ocr";
    let prefix = "ocr";

    if (file.fieldname === "receipt") {
      folder = "payments";
      prefix = "receipt";
    } else if (req.studentId) {
      folder = `students/${req.studentId}`;
      prefix = file.fieldname;
    }

    cb(null, `${folder}/${prefix}-${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

export default upload;
