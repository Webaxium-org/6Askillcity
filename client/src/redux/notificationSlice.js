import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../api/axiosInstance";

// ─────────────────────────────────────────────
// Async Thunks
// ─────────────────────────────────────────────

// Initial fetch for the dropdown (first 50, unfiltered)
export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/notifications", {
        params: { limit: 50, page: 1 },
      });
      return response.data; // { data, pagination }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch notifications"
      );
    }
  }
);

// Paginated fetch for the full Notifications Management page
export const fetchNotificationsPage = createAsyncThunk(
  "notifications/fetchPage",
  async ({ page = 1, limit = 20, filter = "all" } = {}, { rejectWithValue }) => {
    try {
      const params = { page, limit };
      if (filter && filter !== "all") params.filter = filter;
      const response = await axiosInstance.get("/notifications", { params });
      return { ...response.data, page }; // { data, pagination, page }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch notifications"
      );
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
      return rejectWithValue(
        error.response?.data?.message || "Failed to mark as read"
      );
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
      return rejectWithValue(
        error.response?.data?.message || "Failed to mark all as read"
      );
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
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete notification"
      );
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
      return rejectWithValue(
        error.response?.data?.message || "Failed to clear notifications"
      );
    }
  }
);

// ─────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────

const initialState = {
  items: [],
  unreadCount: 0,
  loading: false,
  // Management page state
  pageItems: [],
  pageLoading: false,
  pagination: { total: 0, page: 1, limit: 20, totalPages: 1 },
};

const calculateUnread = (items) => items.filter((n) => !n.isRead).length;

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addLiveNotification: (state, action) => {
      // Prevent duplicate live notifications
      const exists = state.items.find((n) => n._id === action.payload._id);
      if (!exists) {
        state.items.unshift(action.payload);
        state.unreadCount = calculateUnread(state.items);
      }
      // Also prepend to page items if they're loaded
      const existsInPage = state.pageItems.find(
        (n) => n._id === action.payload._id
      );
      if (!existsInPage && state.pageItems.length > 0) {
        state.pageItems.unshift(action.payload);
      }
    },
    clearNotifications: (state) => {
      state.items = [];
      state.unreadCount = 0;
    },
    clearPageItems: (state) => {
      state.pageItems = [];
      state.pagination = { total: 0, page: 1, limit: 20, totalPages: 1 };
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Fetch (dropdown) ──────────────────────
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data || [];
        state.unreadCount = calculateUnread(state.items);
      })
      .addCase(fetchNotifications.rejected, (state) => {
        state.loading = false;
      })

      // ── Fetch page (management page) ──────────
      .addCase(fetchNotificationsPage.pending, (state) => {
        state.pageLoading = true;
      })
      .addCase(fetchNotificationsPage.fulfilled, (state, action) => {
        state.pageLoading = false;
        const { data, pagination } = action.payload;
        state.pageItems = data || [];
        state.pagination = pagination || state.pagination;
      })
      .addCase(fetchNotificationsPage.rejected, (state) => {
        state.pageLoading = false;
      })

      // ── Mark as read ──────────────────────────
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const updateIn = (arr) => {
          const idx = arr.findIndex((n) => n._id === action.payload._id);
          if (idx !== -1) arr[idx].isRead = true;
        };
        updateIn(state.items);
        updateIn(state.pageItems);
        state.unreadCount = calculateUnread(state.items);
      })

      // ── Mark all as read ──────────────────────
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.items.forEach((item) => (item.isRead = true));
        state.pageItems.forEach((item) => (item.isRead = true));
        state.unreadCount = 0;
      })

      // ── Delete ────────────────────────────────
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.items = state.items.filter((n) => n._id !== action.payload);
        state.pageItems = state.pageItems.filter(
          (n) => n._id !== action.payload
        );
        state.unreadCount = calculateUnread(state.items);
        if (state.pagination.total > 0) state.pagination.total -= 1;
      })

      // ── Clear all ─────────────────────────────
      .addCase(clearAllNotificationsThunk.fulfilled, (state) => {
        state.items = [];
        state.pageItems = [];
        state.unreadCount = 0;
        state.pagination = { total: 0, page: 1, limit: 20, totalPages: 1 };
      });
  },
});

export const { addLiveNotification, clearNotifications, clearPageItems } =
  notificationSlice.actions;
export default notificationSlice.reducer;
