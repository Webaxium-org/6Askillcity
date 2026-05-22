import mongoose from "mongoose";
import dns from "dns";

const connectDB = async () => {
  try {
    // Force Node.js to use public DNS servers (Google and Cloudflare) to bypass local DNS/ISP SRV resolution restrictions
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1); // Stop the server on failure
  }
};

export default connectDB;
