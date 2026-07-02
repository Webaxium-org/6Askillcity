/**
 * Requests permission from the user to show notifications.
 * @returns {Promise<boolean>} True if permission is granted, false otherwise.
 */
export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.warn("This browser does not support desktop/mobile notifications.");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    try {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }

  return false;
};

/**
 * Sends a message to the active Service Worker to trigger an OS notification.
 * @param {Object} data - Notification data containing title, message, link, and optionally an ID.
 */
export const triggerOsNotification = async (data) => {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      if (registration && registration.active) {
        registration.active.postMessage({
          type: "SHOW_NOTIFICATION",
          payload: {
            title: data.title || "6A Skillcity",
            body: data.message || "",
            icon: "/android-chrome-192x192.png", // App icon from public folder
            badge: "/favicon-32x32.png",
            tag: data._id || String(Date.now()), // Avoid duplicates
            data: {
              link: data.link || "/dashboard/notifications",
            },
          },
        });
      }
    } catch (error) {
      console.error("Failed to trigger OS notification via Service Worker:", error);
    }
  }
};
