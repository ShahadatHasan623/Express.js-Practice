import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { CLIENT_RENEG_LIMIT } from "node:tls";
import { Pool } from "pg";
import config from "./config/config";
const app: Application = express();
const port = 3000;

app.use(express.json());

const pool = new Pool({
  connectionString:config.connection_string,
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

app.get("/api/users", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
            SELECT * FROM users
            `);
    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Not Found",
        data: {},
      });
    }
    return res.status(200).json({
      message: "all users fetch to data succesfully",
      data: result.rows,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
      error: error,
    });
  }
});
app.get("/api/users/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `
            SELECT * FROM users
            WHERE id=$1
            `,
      [id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({
        meassge: "User Not Found",
        data: {},
      });
    }
    return res.status(200).json({
      message: "Get the single users",
      data: result.rows[0],
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
      error: error,
    });
  }
});

app.put("/api/users/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, password, is_active, age } = req.body;
  try {
    const result = await pool.query(
      `
      UPDATE users SET 
      name = COALESCE($1, name),
      email = COALESCE($2, email),
      password = COALESCE($3, password),
      is_active = COALESCE($4, is_active),
      age =COALESCE($5, age)
    WHERE id = $6
    RETURNING *;
    `,
      [name, email, password, is_active, age, id],
    );
    console.log(result.rows);
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Not Found",
        data: {},
      });
    }
    return res.status(200).json({
      message: "user updated successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
      error: error,
    });
  }
});
app.delete("/api/users/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      DELETE FROM users WHERE id=$1
      `,[id])

      if(result.rowCount === 0){
        return res.status(404).json({
          message:"user Not found",
          data:{}
        })
      }
      return res.status(200).json({
        message:"users deleted successfully",
        data:{}
      })
  } catch (error:any) {
    res.status(500).json({
      message:error.message,
      error:error
    })
  }
});

app.listen(config.port, () => {
  console.log(`server app listening on port ${config.port}`);
});
