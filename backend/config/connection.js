import sql from "mssql"
import { SqlConfig } from "./config.js"

export const dbConnection = async () => {
  try {
    const Connection = await sql.connect(SqlConfig)
    return Connection
  }
  catch (err) {
    console.error("Unable to connect to the database:", err)
    throw err
  }
}