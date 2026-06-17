import "dotenv/config"

export const SqlConfig = {
  server: process.env.SERVER_NAME,
  authentication: {
    type: "default",
    options: {
      userName: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
    },
  },
  options: {
    database: process.env.DB_NAME,
    encrypt: true,
    trustServerCertificate: true,
    enableKeepAlive: true,
    connectionTimeout: 30000, 
    requestTimeout: 60000,
  },
  pool: {
    max: 10,
    min: 1,
    idleTimeoutMillis: 30000,
  },
}