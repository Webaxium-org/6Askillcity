import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  io.use((socket, next) => {
    // 1. Try to read token from headers or handshake auth
    let token = socket.handshake.auth?.token;
    
    // 2. Fallback to reading cookies (socket.handshake.headers.cookie) 
    // Usually socket.io client can't send HttpOnly cookies in handshake directly if cross-origin, 
    // but works if same origin or withCredentials. We'll rely on client passing token via auth.token if possible.
    if (!token && socket.handshake.headers.cookie) {
      const match = socket.handshake.headers.cookie.match(/(?:^|;\s*)token=([^;]*)/);
      if (match) token = match[1];
    }

    if (!token) {
      return next(new Error("Authentication error"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      // The JWT currently sets id, not necessarily role in payload depending on auth.controller.js implementation. 
      // Let's attach userId to socket for easy room assignment.
      socket.userId = decoded.id;
      // We will assume that client emits a 'join_room' event passing userType (User, AdmissionPoint) 
      // to properly map model + id. OR we rely on the decoded token if it has type.
      return next();
    } catch (err) {
      return next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.id} (User: ${socket.userId})`);

    // Listen for client identifying itself properly with Model (User or AdmissionPoint)
    socket.on("identify", ({ userId, userType }) => {
      if (socket.userId === userId) {
        const roomName = `${userType}_${userId}`;
        socket.join(roomName);
        console.log(`Socket ${socket.id} joined room ${roomName}`);
        
        // Also if userType is Admin, join a global 'admins' room to broadcast all support tickets
        if (userType === "User") {
           socket.join("admins");
        }
      }
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIo = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
