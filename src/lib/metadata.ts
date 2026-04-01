export async function fetchMetadata(
    url: string,
): Promise<{ title: string | null; faviconUrl: string | null } | null> {
    try {
        const res = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; aijot-bot/1.0)' },
            signal: AbortSignal.timeout(5000),
        })

        if (!res.ok) return null

        const html = await res.text()
        const base = new URL(url)

        const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
        const title = titleMatch ? titleMatch[1].trim() : null

        const faviconMatch =
            html.match(/<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]*href=["']([^"']+)["']/i) ??
            html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["'][^"']*icon[^"']*["']/i)

        const faviconUrl = faviconMatch
            ? new URL(faviconMatch[1], base).href
            : `${base.protocol}//${base.host}/favicon.ico`

        return { title, faviconUrl }
    } catch {
        return null
    }
}
