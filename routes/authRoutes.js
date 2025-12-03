
import express from "express";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { pool } from "../db.js";


dotenv.config()
const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // ✅ Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }
    // ✅ Check if user exists
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    const user = userResult.rows[0];

    // ✅ Compare password with hashed one
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    // ✅ Generate JWT Token (expires in 1 hour)
    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "your_secret_key", // use .env for real apps
      { expiresIn: "1h" }
    );

    // ✅ Send success response
    res.status(200).json({
      success: true,
      message: "Login successful",
      token, // store this in frontend localStorage
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        city: user.city,
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error.message);
    res.status(500).json({
      error: true,
      message: "Internal server error",
      detail: error.message,
    });
  }
});

// this is for Authentication
router.post("/register", async (req, res) => {
  const { name, email, city, password , role} = req.body;
  try {
    // Validate input
    if (!email || !password || !role) {
      return res
        .status(400)
        .json({ success: false, message: "All fields must be filled" });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email  = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into database (✅ fixed placeholders)
    const result = await pool.query(
      `
      INSERT INTO users (name, email, city, password, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING user_id, name, email, city, role, created_at
      `,
      [name, email, city, hashedPassword,role]
    );

    // Send success response
    res.status(200).json({
      success: true,
      message: "Account created successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Registration error:", error.message);
    res
      .status(500)
      .json({ error: true, message: "Internal server error", detail: error.message });
  }
});


export default router;
