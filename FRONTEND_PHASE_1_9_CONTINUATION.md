# HomeLabs Frontend Phase 1–9 Continuation

## Focus

Phase 1–9 connects the frontend service layer to the backend foundation while preserving the browser-only mock demo mode.

## Added

- Backend-aware authentication service.
- Login page now supports demo seeded backend credentials.
- Booking form can load test catalog, service areas and labs from `/api/booking-options`.
- Booking submission can call `/api/bookings` when `VITE_USE_MOCKS=false`.
- Prescription upload can call `/api/files/prescription`.
- Paystack initialization can call `/api/payments/paystack/initialize`.
- Public tracking page can call `/api/public/track/:bookingId`.
- Partner enquiry form can call `/api/partners/leads`.
- Admin, lab, result and payment service files now include backend-mode API calls.
- Mock mode remains available for demos without a database.

## How to use connected mode

1. Start the backend on port `4000`.
2. Run Prisma migration and seed the database.
3. Set frontend `.env`:

```env
VITE_API_BASE_URL=http://localhost:4000/api
VITE_USE_MOCKS=false
VITE_PAYSTACK_PUBLIC_KEY=replace_with_paystack_public_key
VITE_HOMELABS_WHATSAPP=233000000000
```

4. Start the frontend:

```bash
npm install
npm run dev
```

## Demo backend logins

All seeded backend users use:

```txt
password123
```

Suggested logins:

- Operations: `operations@homelabs.gh`
- Admin: `admin@homelabs.gh`
- Patient: `patient@example.com`
- Clinician: `clinician@example.com`
- Phlebotomist: `phlebotomist@homelabs.gh`
- Lab: `lab@homelabs.gh`

## Current limitation

The dashboard screens still use local interactive state for operational actions. The service layer is now ready for connected mode, but the next phase should replace dashboard-local actions with real API calls for assignment, collection, lab processing, result release and payment confirmation.
