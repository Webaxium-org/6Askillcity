import cors from "cors";

const parseOrigins = (value) =>
  value
    ?.split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean) || [];

const getAllowedOrigins = () => {
  const configuredOrigins = [
    ...parseOrigins(process.env.CLIENT_URL),
    ...parseOrigins(process.env.CLIENT_ORIGINS),
  ];

  if (process.env.NODE_ENV !== "production") {
    configuredOrigins.push("http://localhost:5173", "http://localhost:5174");
  }

  return [...new Set(configuredOrigins)];
};

const configureCors = () =>
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const allowed = getAllowedOrigins();
      const clean = origin?.replace(/\/$/, "");

      if (allowed.includes(clean)) {
        return callback(null, true);
      }

      if (process.env.NODE_ENV !== "production") {
        console.warn("Blocked CORS:", origin);
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  });

export default configureCors;
