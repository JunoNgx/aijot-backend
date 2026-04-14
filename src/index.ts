import { Hono } from 'hono'
import authRoutes from './routes/auth'
import linkRoutes from './routes/link'

const app = new Hono()

const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter((s): s is string => Boolean(s))

app.use('*', async (c, next) => {
    const origin = c.req.raw.headers.get('origin') ?? ''
    const allowedOrigin = allowedOrigins.includes(origin) ? origin : null

    if (allowedOrigin) {
        c.header('Access-Control-Allow-Origin', allowedOrigin)
        c.header('Access-Control-Allow-Credentials', 'true')
    }

    if (c.req.method === 'OPTIONS') {
        c.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        c.header('Access-Control-Allow-Headers', 'Content-Type')
        return c.body(null, 204)
    }

    await next()
})

app.route('/api/auth', authRoutes)
app.route('/api/link', linkRoutes)

export default app
