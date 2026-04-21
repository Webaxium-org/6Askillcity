import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  alerts: [],
};

export const alertSlice = createSlice({
  name: "alert",
  initialState,
  reducers: {
    showAlert: (state, action) => {
      // payload expects { type: "error" | "warning" | "success" | "info", message: string }
      state.alerts.push({
        id: Date.now().toString(),
        type: action.payload.type || "info",
        message: action.payload.message || "An alert occurred",
      });
    },
    clearAlert: (state, action) => {
      // payload expects id
      state.alerts = state.alerts.filter((alert) => alert.id !== action.payload);
    },
    clearAllAlerts: (state) => {
      state.alerts = [];
    },
  },
});

export const { showAlert, clearAlert, clearAllAlerts } = alertSlice.actions;
export default alertSlice.reducer;
