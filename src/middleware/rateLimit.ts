import type { Context, Next } from 'hono'

interface Entry {
    count: number
    resetAt: number
}

const store = new Map<string, Entry>()

export function rateLimit(limit: number, windowMs: number) {
    return async (c: Context, next: Next) => {
        const ip =
            c.req.header('x-forwarded-for')?.split(',')[0].trim() ??
            c.req.header('x-real-ip') ??
            'unknown'
        const key = `${ip}:${c.req.routePath}`
        const now = Date.now()

        let entry = store.get(key)
        if (!entry || entry.resetAt < now) {
            entry = { count: 1, resetAt: now + windowMs }
            store.set(key, entry)
        } else {
            entry.count++
            if (entry.count > limit) {
                return c.json(
                    { error: 'Too many requests', error_code: 'rate_limit_exceeded' },
                    429,
                )
            }
        }

        await next()
    }
}
