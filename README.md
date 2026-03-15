# markNote

A minimal personal note-taking app with a Markdown editor and live preview.

## Features

- **Markdown editor** powered by Monaco Editor with a custom theme
- **Live preview** rendered with react-markdown
- **Notes sidebar** — create, rename, and delete notes
- **Resizable layout** — collapsible sidebar with editor/preview tabs (GitHub-style)
- **Responsive** — 3-tab mobile layout (Notes / Preview / Editor)
- **Single-user auth** — JWT-based login with a master password

## Tech Stack

**Client** — React 19, TypeScript, Vite, TailwindCSS 4, React Router 7, TanStack Query, Monaco Editor, Radix UI

**Server** — Hono 4 on Cloudflare Workers, Turso (LibSQL/SQLite), JWT auth

## Project Structure

```
markNote/
├── client/     # React SPA
└── server/     # Hono API (Cloudflare Workers)
```

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm 10+
- A [Turso](https://turso.tech) database
- A Cloudflare account (for server deployment)

### Setup

**1. Clone and install dependencies**

```bash
git clone <repo-url>
cd markNote
pnpm install
```

**2. Configure the server**

Copy the example config and fill in your values:

```bash
cp server/wrangler.example.jsonc server/wrangler.jsonc
```

Required environment variables (set in `wrangler.jsonc` or as Cloudflare secrets):

| Variable | Description |
|---|---|
| `TURSO_URL` | Turso database URL |
| `TURSO_AUTH_TOKEN` | Turso auth token |
| `MASTER_PASSWORD_HASH` | bcrypt hash of your login password |
| `JWT_SECRET` | Secret key for signing JWTs |

**3. Configure the client**

```bash
cp client/.env.example client/.env     # if applicable
```

Set `VITE_API_URL` to your server URL (defaults to `/api`).

### Development

```bash
pnpm dev            # Run client + server in parallel
pnpm dev:client     # Client only (Vite on localhost:5173)
pnpm dev:server     # Server only (Wrangler dev)
```

### Build

```bash
pnpm build          # Build the client
```

## Authentication

markNote uses a single master password. On login the server compares the submitted password against the bcrypt `MASTER_PASSWORD_HASH`, then returns a signed JWT (1-hour expiry). The client stores the token in `sessionStorage` and sends it as a `Bearer` token on every request. A 401 response automatically logs the user out.
