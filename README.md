# HomeLabs Frontend

React/Vite frontend for the HomeLabs Ghana mobile phlebotomy platform.

This repository is intended to be deployed separately on **Vercel**.

## Tech stack

- React
- Vite
- React Router
- Modular service layer for backend API calls
- Paystack public-key payment initialization support
- WhatsApp-assisted booking support

## Local setup

```bash
npm install
cp .env.example .env
npm run dev
```

Default local URL:

```txt
http://localhost:5173
```

## Environment variables

Create `.env` locally and configure these values:

```env
VITE_USE_MOCKS=false
VITE_API_BASE_URL=http://localhost:4000/api
VITE_PAYSTACK_PUBLIC_KEY=pk_test_or_live_xxxxxxxxx
VITE_WHATSAPP_NUMBER=233XXXXXXXXX
```

For Vercel production, set:

```env
VITE_USE_MOCKS=false
VITE_API_BASE_URL=https://your-railway-backend-url.up.railway.app/api
VITE_PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxx
VITE_WHATSAPP_NUMBER=233XXXXXXXXX
```

Do not add backend secrets, Paystack secret keys, JWT secrets, or database URLs to this frontend repository.

## Build

```bash
npm run build
```

The production output is generated in:

```txt
dist/
```

`dist/` is ignored and should not be committed.

## Vercel deployment

1. Push this repository to GitHub as `homelabs-frontend`.
2. Create a new Vercel project from the GitHub repository.
3. Framework preset: **Vite**.
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. Add the environment variables above.
7. Deploy.

This repo includes `vercel.json` so client-side routes such as `/book`, `/track`, and dashboard routes work correctly after deployment.

## Backend connection

This frontend talks to the backend through:

```env
VITE_API_BASE_URL=https://your-railway-backend-url.up.railway.app/api
```

The backend must allow the deployed Vercel domain in its `CORS_ORIGINS` environment variable.
