import crypto from "crypto";

const generateStrongPassword = () => {
  // 12+ chars, includes symbols
  return crypto.randomBytes(9).toString("base64");
};

export { generateStrongPassword };
