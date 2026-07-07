import dotenv from 'dotenv';
dotenv.config({ override: true, encoding: 'UTF-8' });

const requiredEnv = ["JWT_SECRET"];

if (process.env.NODE_ENV === "production") {
  requiredEnv.push("CLIENT_URL", "MONGO_URI");
}

const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  throw new Error(`Missing required environment variable(s): ${missingEnv.join(", ")}`);
}
