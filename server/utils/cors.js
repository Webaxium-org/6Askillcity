import cors from "cors";

const allowedOrigins = [process.env.CLIENT_URL];

const configureCors = () =>
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const allowed = allowedOrigins?.map((o) => o?.replace(/\/$/, ""));
      const clean = origin?.replace(/\/$/, "");

      if (allowed.includes(clean)) return callback(null, true);

      console.log("Blocked CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  });

export default configureCors;
