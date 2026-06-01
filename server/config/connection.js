import sql from "mssql"
import { SqlConfig } from "./config.js"

export const dbConnection = async () => {
  try {
    const Connection = await sql.connect(SqlConfig)
    return Connection
  }
  catch (err) {
    console.error("Unable to connect to the database:", {
      message: err.message,
      code: err.code,
      number: err.number,
      state: err.state,
      class: err.class,
      server: SqlConfig.server,
      port: SqlConfig.port,
      instanceName: SqlConfig.options.instanceName,
      database: SqlConfig.options.database,
    })
    throw err
  }
}