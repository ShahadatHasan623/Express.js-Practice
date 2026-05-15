import express, { type Application, type Request, type Response } from "express"
import {Pool} from "pg"
const app:Application = express()
const port = 3000

const pool =new Pool({
    connectionString:"postgresql://neondb_owner:npg_wf4YXSEhg8zI@ep-shiny-frost-apji3h8w-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
})


app.get('/', (req:Request, res:Response) => {
  res.status(200).json({
    message:"server root is running"
  })
})

app.listen(port, () => {
  console.log(`server app listening on port ${port}`)
})
