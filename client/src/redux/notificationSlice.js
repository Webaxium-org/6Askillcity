import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../api/axiosInstance";

// Async Thunks
export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/notifications");
      return response.data.data; // Array of notifications
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch notifications");
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/notifications/${id}/read`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to mark as read");
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  "notifications/markAllAsRead",
  async (_, { rejectWithValue }) => {
    try {
      await axiosInstance.put("/notifications/read-all");
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to mark all as read");
    }
  }
);

export const deleteNotification = createAsyncThunk(
  "notifications/deleteNotification",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/notifications/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete notification");
    }
  }
);

export const clearAllNotificationsThunk = createAsyncThunk(
  "notifications/clearAll",
  async (_, { rejectWithValue }) => {
    try {
      await axiosInstance.delete("/notifications/clear-all");
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to clear notifications");
    }
  }
);

const initialState = {
  items: [],
  unreadCount: 0,
  loading: false,
};

const calculateUnread = (items) => items.filter((n) => !n.isRead).length;

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addLiveNotification: (state, action) => {
      // Prevent duplicate live notifications just in case
      const exists = state.items.find((n) => n._id === action.payload._id);
      if (!exists) {
        state.items.unshift(action.payload);
        state.unreadCount = calculateUnread(state.items);
      }
    },
    clearNotifications: (state) => {
      state.items = [];
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
        state.unreadCount = calculateUnread(state.items);
      })
      .addCase(fetchNotifications.rejected, (state) => {
        state.loading = false;
      })
      // Mark as read
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const index = state.items.findIndex((n) => n._id === action.payload._id);
        if (index !== -1) {
          state.items[index].isRead = true;
          state.unreadCount = calculateUnread(state.items);
        }
      })
      // Mark all as read
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.items.forEach((item) => {
          item.isRead = true;
        });
        state.unreadCount = 0;
      })
      // Delete
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.items = state.items.filter((n) => n._id !== action.payload);
        state.unreadCount = calculateUnread(state.items);
      })
      // Clear All
      .addCase(clearAllNotificationsThunk.fulfilled, (state) => {
        state.items = [];
        state.unreadCount = 0;
      });
  },
});

export const { addLiveNotification, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
