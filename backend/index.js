import express from "express"
import cors from "cors"
import "dotenv/config"
import { dbConnection } from "./config/connection.js"
import ownerRoutes from "./routes/ownerRoutes.js"
import petRoutes from "./routes/petRoutes.js"
import vetClinicRoutes from "./routes/vetClinicRoutes.js"
import authRoutes from "./routes/authRoutes.js"
import favoriteClinicRoutes from "./routes/favoriteClinicRoutes.js"

const PORT = process.env.PORT || 4000
const app = express()

app.use(cors({
  credentials: true,
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://localhost:5501',
      'http://localhost:3000',
      'http://localhost:5173'
    ];
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PATCH", "DELETE"]
}))

app.use(express.json())

app.get("/", (req, res) => {
  res.json({
    message: "Server is running",
    routes: {
      auth: "/api/auth",
      owners: "/api/owners",
      pets: "/api/pets",
      clinics: "/api/clinics",
      favorites: "/api/favorites"
    }
  })
})

// API Routes
app.use("/api/auth", authRoutes)
app.use("/api/owners", ownerRoutes)
app.use("/api/pets", petRoutes)
app.use("/api/clinics", vetClinicRoutes)
app.use("/api/favorites", favoriteClinicRoutes)

app.use((err, req, res, next) => {
  res.status(500).json({
    message: err.message
  })
})

dbConnection()
  .then(() => {
    console.log("Database connected successfully!")
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message)
    process.exit(1)
  })

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})