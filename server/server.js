import "./config/env.js";
import http from "http";
import app from "./app.js";
import connectDB from "./config/db.js";
import { initSocket } from "./services/socket.service.js";
import { initTicketCron } from "./cron/ticket.cron.js";

const startServer = async () => {
  try {
    // 1. Connect to Database first
    await connectDB();

    const PORT = process.env.PORT || 5000;

    // 2. Start HTTP & Socket server
    const server = http.createServer(app);
    initSocket(server);

    // 3. Initialize Cron Jobs
    initTicketCron();

    // 4. Start the listener
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Startup Error:", error);
    process.exit(1);
  }
};

startServer();
 
