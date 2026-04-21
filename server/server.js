import "./config/env.js";
import app from "./app.js";
import connectDB from "./config/db.js";

const startServer = async () => {
  try {
    // 1. Connect to Database first
    await connectDB();

    const PORT = process.env.PORT || 5000;

    // 2. Start the listener
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Startup Error:", error);
    process.exit(1);
  }
};

startServer();
