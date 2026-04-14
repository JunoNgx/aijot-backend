# ai*jot (backend)

Supplementary back end for ai*jot.

# Overview

This is a very minimal and basic backend server that does solely two things:
- Handle Google Identity Service OAuth, providing user with access token and refresh token
- Fetches metadata from URL (page title and favicon url)

A backend is required to communicate with Google token exchange endpoint (browser requests are rejected) and also to use Google Cloud client ID and secrets in a secure and unexposed manner.

# Tech stack

Hono with TypeScript

# Environment Variables

Refer to `.env.example`

# Running

`npm run dev` for local development after `npm install`

# Contribution

Please open a GitHub issue.