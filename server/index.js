import express from "express"
import cors from "cors"
import "dotenv/config"
import path from "path"
import { fileURLToPath } from "url"
import { dbConnection } from "./config/connection.js"
import { setupSyncCron } from "./services/syncService.js"
import ownerRoutes from "./routes/ownerRoutes.js"
import petRoutes from "./routes/petRoutes.js"
import vetClinicRoutes from "./routes/vetClinicRoutes.js"
import authRoutes from "./routes/authRoutes.js"
import favoriteClinicRoutes from "./routes/favoriteClinicRoutes.js"
import medicalRecordRoutes from "./routes/medicalRecordRoutes.js"
import reminderRoutes from "./routes/reminderRoutes.js"

const PORT = process.env.PORT || 8080
const app = express()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(cors({
  credentials: true,
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    callback(null, true);
  },
  methods: ["GET", "POST", "PATCH", "DELETE"]
}))

app.use(express.json())
app.use(express.static(path.join(__dirname, "public")))

app.get("/api/status", (req, res) => {
  res.json({
    message: "Server is running",
    routes: {
      auth: "/api/auth",
      owners: "/api/owners",
      pets: "/api/pets",
      clinics: "/api/vet-clinics",
      favorites: "/api/favorites",
      medicalRecords: "/api/medical-records"
    }
  })
})

// API Routes
app.use("/api/auth", authRoutes)
app.use("/api/owners", ownerRoutes)
app.use("/api/pets", petRoutes)
app.use("/api/vet-clinics", vetClinicRoutes)
app.use("/api/favorites", favoriteClinicRoutes)
app.use("/api/medical-records", medicalRecordRoutes)
app.use("/api/reminder", reminderRoutes)

app.use((req, res, next) => {
  if (req.method !== "GET" || req.path.startsWith("/api")) {
    return next()
  }

  return res.sendFile(path.join(__dirname, "public", "index.html"))
})

app.use((err, req, res, next) => {
  res.status(500).json({
    message: err.message
  })
})

dbConnection()
  .then(() => {
    console.log("Database connected successfully!")
    if (process.env.ENABLE_AUTO_SYNC === 'true') {
      setupSyncCron()
    } else {
      console.log("⚠️ Auto-sync disabled (development mode)")
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error("Database connection failed:", err)
    process.exit(1)
  })