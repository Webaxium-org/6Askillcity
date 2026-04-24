import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

import Ticket from './models/ticket.js';
import TicketMessage from './models/ticketMessage.js';
import User from './models/user.js';
import * as ticketService from './services/ticket.service.js';

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");
    
    const admin = await User.findOne({ role: "admin" });
    if (!admin) {
      console.log("No admin found");
      return;
    }
    console.log("Admin:", admin._id);

    // Create a ticket
    try {
      const ticket = await ticketService.createTicket({
        title: "Test Ticket",
        description: "Test Desc",
        priority: "Medium",
        creatorId: admin._id,
        creatorModel: "User"
      });
      console.log("Ticket created:", ticket._id);
      
      // Add message
      const msg = await ticketService.addMessageToTicket(
        ticket._id,
        admin._id,
        "User",
        "Test message"
      );
      console.log("Message created:", msg._id);
    } catch (e) {
      console.error("Error creating ticket or msg:", e);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
