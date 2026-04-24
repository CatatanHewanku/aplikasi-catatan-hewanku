import express from "express"
import cors from "cors"
import "dotenv/config"

const PORT = process.env.PORT || 4000
const app = express()

app.use(cors({
    credentials: true,
    origin: (origin, callback) => {
        const allowedOrigins = [
            'https://localhost:5501'
        ];
        if(!origin || allowedOrigins.indexOf(origin) !== -1) {
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
        message: "Server is running"
    })
})

app.use((err, req, res, next) => {
    res.json({
        message: err.message
    })
})

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})