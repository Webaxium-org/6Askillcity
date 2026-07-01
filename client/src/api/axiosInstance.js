import axios from "axios";
import { store } from "../redux/store";
import { logOut } from "../redux/userSlice";
import { persistor } from "../redux/store";

const API_URL = import.meta.env.VITE_API_URL;

export const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// ─── Global response interceptor ─────────────────────────────────────────────
// If the server returns 401 (not authenticated) or 403 (forbidden / insufficient
// role or type), wipe the user session and redirect to /login.
axiosInstance.interceptors.response.use(
  (response) => response, // pass-through for successful responses
  async (error) => {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      // 1. Clear Redux state
      store.dispatch(logOut());

      // 2. Purge persisted redux-persist storage so stale user isn't reloaded
      await persistor.purge();

      // 3. Navigate to login (hard redirect keeps router state clean)
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);
