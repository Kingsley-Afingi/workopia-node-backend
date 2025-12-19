import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";


// this is for testing if database is connected 
import { pool } from "./db.js";

pool.query("SELECT 1")
  .then(() => console.log("✅ PostgreSQL connected successfully"))
  .catch(err => console.error("❌ PostgreSQL connection error:", err.message));
// and it ends here 

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

// ✅ Default route to check if the backend is working fine 
app.get("/", (req, res) => {
  res.send("Backend is running successfully 🚀");
});

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
