# HomeLabs Frontend Production Deployment Guide

## Deployment summary

This frontend is configured for live backend use. It does not bundle default accounts or sample records. All dashboard and booking data comes from the configured backend API.

## Required production setup

1. Deploy the backend first and confirm `/api/health` and `/api/ready` work.
2. Set `VITE_API_BASE_URL` to the backend `/api` URL.
3. Set `VITE_HOMELABS_WHATSAPP` to the public support number.
4. Build the frontend with `npm run build`.
5. Deploy the generated `dist` folder or connect the project to Vercel/Netlify.

## Vercel deployment

Configure the environment variables in Vercel before building:

```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_API_TIMEOUT_MS=20000
VITE_API_RETRY_COUNT=1
VITE_HOMELABS_WHATSAPP=233XXXXXXXXX
```

Then deploy with:

```bash
npm ci
npm run build
```

## Security notes

- Do not place backend secrets in frontend variables.
- Only variables beginning with `VITE_` are available to the browser.
- Backend secrets such as database URLs, JWT secrets, and Paystack secret keys must remain on the backend host.


## Google Authentication

This build includes Google Sign-In/Sign-Up. Add the following variables before deployment:

Backend:
```env
GOOGLE_CLIENT_ID=your_google_oauth_web_client_id.apps.googleusercontent.com
GOOGLE_TOKEN_VERIFY_TIMEOUT_MS=5000
```

Frontend:
```env
VITE_GOOGLE_CLIENT_ID=your_google_oauth_web_client_id.apps.googleusercontent.com
```

Use the same Google Web Client ID on backend and frontend. In Google Cloud Console, add the frontend production URL to Authorized JavaScript origins. New Google sign-ups are patient accounts only; staff accounts must be created by an administrator first.
