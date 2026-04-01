import { Hono } from 'hono'
import { setCookie, deleteCookie, getCookie } from 'hono/cookie'
import { rateLimit } from '../middleware/rateLimit'

const auth = new Hono()

const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax' as const,
    path: '/',
}

auth.use('*', rateLimit(10, 60_000))

auth.post('/callback', async (c) => {
    const body = await c.req.json().catch(() => null)
    if (!body?.code || !body?.redirect_uri) {
        return c.json({ error: 'Missing code or redirect_uri', error_code: 'invalid_request' }, 400)
    }

    const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            code: body.code,
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            redirect_uri: body.redirect_uri,
            grant_type: 'authorization_code',
        }),
    })

    const data = (await res.json()) as Record<string, string>

    if (!res.ok || data['error']) {
        return c.json(
            {
                error: data['error_description'] ?? 'OAuth exchange failed',
                error_code: data['error'] ?? 'oauth_error',
            },
            400,
        )
    }

    setCookie(c, 'access_token', data['access_token'], cookieOptions)
    if (data['refresh_token']) {
        setCookie(c, 'refresh_token', data['refresh_token'], cookieOptions)
    }

    return c.json({ ok: true })
})

auth.post('/refresh', async (c) => {
    const refreshToken = getCookie(c, 'refresh_token')
    if (!refreshToken) {
        return c.json({ error: 'No refresh token', error_code: 'no_refresh_token' }, 401)
    }

    const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            refresh_token: refreshToken,
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            grant_type: 'refresh_token',
        }),
    })

    const data = (await res.json()) as Record<string, string>

    if (!res.ok || data['error']) {
        return c.json(
            {
                error: data['error_description'] ?? 'Token refresh failed',
                error_code: data['error'] ?? 'refresh_error',
            },
            400,
        )
    }

    setCookie(c, 'access_token', data['access_token'], cookieOptions)

    return c.json({ ok: true })
})

auth.post('/logout', (c) => {
    deleteCookie(c, 'access_token', { path: '/' })
    deleteCookie(c, 'refresh_token', { path: '/' })
    return c.json({ ok: true })
})

export default auth
