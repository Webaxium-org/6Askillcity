import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useSelector, useDispatch } from "react-redux";
import { showAlert } from "../redux/alertSlice";

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  useEffect(() => {
    // Only connect if user is authenticated
    if (!user || (!user.userId && !user._id)) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const userId = user.userId || user._id; // Ensure we get the correct ID field based on redux state
    const userType = user.type === "admin" ? "User" : "AdmissionPoint";

    // Setup Socket Connect
    // Getting token from document.cookie, but socket.io by default sends cookies if withCredentials true.
    const newSocket = io(import.meta.env.VITE_BASE_URL || "http://localhost:5000", {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
      newSocket.emit("identify", { userId, userType });
    });

    // Global listener for generic notifications was moved to DashboardLayout
    // to include the notification payload and title.

    newSocket.on("connect_error", (err) => {
      console.warn("Socket connect error", err.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
