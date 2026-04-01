# Specification for ai*jot backend

## Overview

A minimal and simple supplementary backend to assist ai*jot, a note-taking app

## Tech stack

- Framework: Hono with TypeScript
- Deployment: Vercel serverless functions

## Responsibilities

This backend is solely dedicated to two tasks:
- Handle Google Identity Service OAuth, providing the client with appropriate access token and refresh token
- Inspect an URL to provide the client with its favicon url and title

## Environment variables
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `ALLOWED_ORIGINS`: list of allowed origins for CORS requests, each separated by comma
- `SESSION_SECRET`: secret to sign session cookies

## API interface

* POST `/api/auth/callback`: handle the OAuth callback, exchanging auth code for token
- POST `/api/auth/refresh`: refreshes an expired Google OAuth access token using the stored refresh token
- POST `/api/auth/logout`: logs user out, destroy cookies
- GET `/api/link/fetch/`: fetch the url and returns with page title and favicon. Respond in { title, faviconUrl }

## CORS policy

Derived from `ALLOWED_ORIGINS`, allow credentials, `GET`, `POST`, and `OPTIONS` (for pre-flight check)

## Error handling

Error format:
```
{
    error: "message",
    error_code: "error_code"
}
```
with appropriate HTTP status code.

## Rate limit policy
- Auth endpoints: 10/min per IP
- Link fetch endpoint: 30/min per IP

## Auth cookie config

`HttpOnly`, `Secure`, `SameSite=Lax`, `access_token`, `refresh_token`,