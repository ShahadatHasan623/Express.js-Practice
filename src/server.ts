import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { CLIENT_RENEG_LIMIT } from "node:tls";
import { Pool } from "pg";
const app: Application = express();
const port = 3000;

app.use(express.json())

const pool = new Pool({
  connectionString:
    "postgresql://neondb_owner:npg_wf4YXSEhg8zI@ep-shiny-frost-apji3h8w-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
});

const initDB = async () => {
  await pool.query(`
        CREATE TABLE IF NOT EXISTS users(
        id SERIAL PRIMARY KEY,
        name VARCHAR(20),
        email VARCHAR(20) UNIQUE NOT NULL,
        password VARCHAR(20) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        age INT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
        )
        `);

  console.log("connect succesfully");
};
initDB();
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "server root is running",
  });
});

app.post("/api/users", async (req: Request, res: Response) => {
  const { name, email, password, age } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO users(name,email,password,age) VALUES($1,$2,$3,$4) RETURNING *`,
      [name, email, password, age],
    );

    return res.status(201).json({
      message: "users created successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
      error: error,
    });
  }
});

app.listen(port, () => {
  console.log(`server app listening on port ${port}`);
});
