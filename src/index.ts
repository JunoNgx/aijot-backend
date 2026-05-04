import { Hono } from "hono"
import { cors } from "hono/cors"
import { HonoRequest } from "hono/request"
import authRoutes from "./routes/auth"
import linkRoutes from "./routes/link"

/**
 * Vercel sometimes provides request objects where headers is a plain object
 * (not a Headers instance with .get() method). This breaks HonoRequest.header()
 * which calls this.raw.headers.get(). Fix it here before CORS runs.
 * See: https://github.com/sergiodxa/remix-i18next/issues/117
 */
// const originalHeader = HonoRequest.prototype.header as any
// HonoRequest.prototype.header = function (name?: string) {
//     const headers = this.raw.headers
//     if (headers instanceof Headers) {
//         return originalHeader.call(this, name)
//     }
//     console.warn('[headers fix] Non-Headers instance received:', typeof headers)
//     if (name === undefined) {
//         return headers as Record<string, string>
//     }
//     return headers
// }

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
