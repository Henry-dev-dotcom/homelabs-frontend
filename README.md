# HomeLabs Frontend — Production Deployment

This frontend is configured for live backend use only. Only live backend data is used. Default login hints, bundled records, and internal verification pages have been removed.

## Requirements

- Node.js 20+
- A deployed HomeLabs backend
- Production frontend environment variables configured in Vercel, Netlify, Docker, or your chosen host

## Required environment variables

```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_API_TIMEOUT_MS=20000
VITE_API_RETRY_COUNT=1
VITE_HOMELABS_WHATSAPP=233XXXXXXXXX
```

Only `VITE_` values are exposed to the browser. Never place backend secrets, database URLs, JWT secrets, Paystack secret keys, or private tokens in frontend environment variables.

## Install

```bash
npm ci
```

## Build

```bash
npm run build
```

## Preview build locally

```bash
npm run preview
```

## Deployment

Deploy the generated `dist` folder or use the included hosting configuration for Vercel/Nginx. Ensure `VITE_API_BASE_URL` points to the deployed backend `/api` path before building.
