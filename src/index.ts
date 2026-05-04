import { Hono } from 'hono'
import { cors } from 'hono/cors'
import authRoutes from './routes/auth'
import linkRoutes from './routes/link'

const app = new Hono({ strict: false })

const ALLOWED_ORIGINS_FALLBACK = 'https://aijot.app,https://aijot.vercel.app'
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? ALLOWED_ORIGINS_FALLBACK)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

app.use('*', async (c, next) => {
    /**
     * Vercel sometimes provides request objects where headers is a plain object
     * (not a Headers instance with .get() method). This breaks HonoRequest.header()
     * which calls this.raw.headers.get(). Normalize it here before CORS runs.
     * See: https://github.com/sergiodxa/remix-i18next/issues/117
     */
    try {
        const raw = c.req.raw as any
        const headers = raw.headers
        if (headers && typeof headers.get !== 'function') {
            const normalized = new Headers()
            for (const [key, value] of Object.entries(headers)) {
                if (typeof value === 'string') {
                    normalized.set(key, value)
                } else if (Array.isArray(value)) {
                    value.forEach((v: string) => normalized.append(key, v))
                }
            }
            raw.headers = normalized
        }
    } catch {
        // Leave headers alone if normalization fails
    }
    await next()
})

app.use(
    '*',
    cors({
        origin: (origin) => (allowedOrigins.includes(origin) ? origin : null),
        allowMethods: ['GET', 'POST', 'OPTIONS'],
        allowHeaders: ['Content-Type'],
        credentials: true,
    }),
)

app.route('/api/auth', authRoutes)
app.route('/api/link', linkRoutes)

export default app
