import { Hono } from "hono"
import { cors } from "hono/cors"
import authRoutes from "./routes/auth"
import linkRoutes from "./routes/link"

const app = new Hono({ strict: false })

const ALLOWED_ORIGINS_FALLBACK = "https://aijot.app,https://aijot.vercel.app"
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? ALLOWED_ORIGINS_FALLBACK)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)

app.use(
    "*",
    cors({
        origin: (origin) => (allowedOrigins.includes(origin) ? origin : null),
        allowMethods: ["GET", "POST", "OPTIONS"],
        allowHeaders: ["Content-Type"],
        credentials: true,
    }),
)

app.route("/api/auth", authRoutes)
app.route("/api/link", linkRoutes)

export default app