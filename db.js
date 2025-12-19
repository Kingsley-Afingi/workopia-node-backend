import pkg, { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();



// console.log("PG_PASSWORD TYPE:", typeof process.env.PG_PASSWORD);

// export const pool = new Pool({
//   host: process.env.PG_HOST,
//   port: Number(process.env.PG_PORT),
//   user: process.env.PG_USER,
//   password: String(process.env.PG_PASSWORD), // 🔥 FORCE STRING
//   database: process.env.PG_DATABASE,
// });

export const pool = new Pool({
 
  connectionString: String(process.env.DATABASE_URL),
});


