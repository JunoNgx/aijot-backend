import { Hono } from 'hono'
import { rateLimit } from '../middleware/rateLimit'
import { fetchMetadata } from '../lib/metadata'

const link = new Hono()

link.use('*', rateLimit(30, 60_000))

link.get('/fetch', async (c) => {
    const url = c.req.query('url')
    if (!url) {
        return c.json({ error: 'Missing url parameter', error_code: 'missing_url' }, 400)
    }

    try {
        new URL(url)
    } catch {
        return c.json({ error: 'Invalid URL', error_code: 'invalid_url' }, 400)
    }

    const metadata = await fetchMetadata(url)
    if (!metadata) {
        return c.json({ error: 'Failed to fetch URL', error_code: 'fetch_failed' }, 502)
    }

    return c.json(metadata)
})

export default link
