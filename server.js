import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";


dotenv.config();
const app = express();

const FRONTEND_URL= process.env.FRONTEND_URL || "http://localhost:5173"
app.use(cors({
   origin: FRONTEND_URL,
   methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true 
}));
app.use(express.json());


// ✅ Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api", jobRoutes);

// ✅ Default route
app.get("/", (req, res) => {
  res.send("Backend is running successfully 🚀");
});

// this is for test 
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ success: true, time: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB connection failed" });
  }
});

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
