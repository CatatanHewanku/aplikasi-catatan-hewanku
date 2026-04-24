import "dotenv/config"

export const SqlConfig = {
  server: process.env.SERVER_NAME,
  authentication: {
    type: 'default',
    options: {
      userName: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD
    }
  },
  options: {
    database: process.env.DB_NAME,
    encrypt: true,
    trustServerCertificate: true
  },
  requestTimeout: 30000,
}