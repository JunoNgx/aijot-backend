import app from "../src/index"

// Use edge runtime to avoid Vercel's nodejs runtime issue where the
// Request object's headers property is not a Headers instance with .get().
// See: https://github.com/sergiodxa/remix-i18next/issues/117
export const config = { runtime: "edge" }

export default app.fetch