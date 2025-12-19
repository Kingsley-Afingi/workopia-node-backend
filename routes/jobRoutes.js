import { pool } from "../db.js";
import express from "express"



const router = express.Router()


router.get("/jobs/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Query for a single job
    const { rows } = await pool.query("SELECT * FROM jobs WHERE id = $1", [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: rows[0],
    });
  } catch (err) {
    console.error("❌ Error fetching job by ID:", err.message);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching job details.",
    });
  }
});



router.get("/jobs", async (req, res) => {
  try {
    const { title, state } = req.query;

    // Base query
    let query = "SELECT * FROM jobs";
    const params = [];
    const filters = [];

    // Add filters if title or state is provided
    if (title) {
      params.push(`%${title}%`);
      filters.push(`LOWER(title) LIKE LOWER($${params.length})`);
    }

    if (state) {
      params.push(`%${state}%`);
      filters.push(`LOWER(state) LIKE LOWER($${params.length})`);
    }

    // Combine filters into the query
    if (filters.length > 0) {
      query += " WHERE " + filters.join(" AND ");
    }

     query += " ORDER BY created_at DESC";

    // Execute query safely
    const { rows } = await pool.query(query, params);
    return res.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (err) {
    console.error("❌ Error fetching jobs:", err.message);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching jobs.",
    });
  }
});



router.post("/jobs", async (req, res) => {
  
  try {
    const { user_id, title, description, salary, requirements, benefits, company, address, city,
      state,phone,email,tags,image
    } = req.body;

    // ✅ Basic validation
    if (!title || !description || !company) {
      return res.status(400).json({
        error: "Title, description, and company are required fields.",
      });
    }
      // this is to convert a tags="react,java.python" to tags["react,java.python"] into and array of string
     const tagsArray = Array.isArray(tags)
      ? tags // already an array
      : typeof tags === "string"
      ? tags.split(",").map((item) => item.trim()) // convert string → array
      : [];

    // ✅ Insert into PostgreSQL
    const query = `
      INSERT INTO jobs (
        user_id, title, description, salary, requirements, benefits,
        company, address, city, state, phone, email, tags, image
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      RETURNING *;
    `;

    const values = [
      user_id || 1, // fallback if you don’t have user auth yet
      title,description,salary,requirements,benefits,company,
      address,city,state,phone,email,tagsArray,image,
    ];

    const result = await pool.query(query, values);

    res.status(201).json({
      success: true,
      message: "Job created successfully!",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creating job" });
  }
});


// this is to update jobs
router.patch("/api/jobs/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const fields = req.body; // all fields from frontend (title, salary, etc.)

  try {
    // Build dynamic query: set column1=$1, column2=$2 ...
    const columns = Object.keys(fields);
    const values = Object.values(fields);

    if (columns.length === 0) {
      return res.status(400).json({ error: "No fields provided to update" });
    }

    const setQuery = columns.map((col, i) => `${col} = $${i + 1}`).join(", ");
    const query = `UPDATE jobs SET ${setQuery} WHERE id = $${columns.length + 1} RETURNING *`;

    const result = await pool.query(query, [...values, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.json({
      success: true,
      message: "Job updated successfully!",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating job" });
  }
});


// this is the DELETE handler 
// this return and keeps the array of jokes that the id is not equal to and delete the one the id is equals to the id given 
router.delete("/jobs/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Check if job exists first
    const check = await pool.query("SELECT * FROM jobs WHERE id = $1", [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ message: "No job found with that ID" });
    }

    // Delete job
    await pool.query("DELETE FROM jobs WHERE id = $1", [id]);

    res.status(200).json({
      success: true,
      message: `Job with id ${id} deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});



export default router