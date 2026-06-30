# HomeLabs Frontend API Contract Draft

This file lists the backend endpoints the Phase 1–5 frontend is prepared to connect to. The frontend still runs with mock data by default through `VITE_USE_MOCKS=true`.

## Environment

```env
VITE_API_BASE_URL=http://localhost:4000/api
VITE_USE_MOCKS=true
VITE_PAYSTACK_PUBLIC_KEY=replace_with_paystack_public_key
VITE_HOMELABS_WHATSAPP=233000000000
```

## Authentication

### POST `/auth/login`

Purpose: authenticate users by role.

Request:

```json
{
  "email": "operations@homelabs.gh",
  "password": "password",
  "role": "operations"
}
```

Response:

```json
{
  "token": "jwt_token",
  "user": {
    "id": "USER-001",
    "name": "Operations User",
    "email": "operations@homelabs.gh",
    "role": "operations"
  }
}
```

Supported roles: `patient`, `clinician`, `phlebotomist`, `lab`, `operations`, `admin`.

## Public Booking

### GET `/booking-options`

Returns service areas, test catalog and available labs.

### POST `/bookings`

Creates a booking from website, clinician portal, WhatsApp/manual entry or admin.

Minimum request:

```json
{
  "source": "Website",
  "patient": {
    "fullName": "Ama Serwaa",
    "phone": "+233240001122",
    "email": "ama@example.com",
    "dob": "1994-05-15",
    "gender": "Female"
  },
  "tests": ["fbc", "lft"],
  "customTest": "",
  "prescriptionFileId": "FILE-001",
  "labChoice": "homelabs-lab",
  "location": {
    "areaId": "kumasi-central",
    "address": "Adum, near post office",
    "landmark": "Post office",
    "facilityType": "Home"
  },
  "schedule": {
    "date": "2026-07-02",
    "timeSlot": "7:00 AM – 9:00 AM",
    "urgency": "Routine"
  },
  "consent": true,
  "amount": 380
}
```

Response:

```json
{
  "id": "HLB-2401",
  "status": "Under Review",
  "payment": "Pending",
  "sampleId": null,
  "createdAt": "2026-06-28T15:00:00.000Z"
}
```

## Tracking

### GET `/public/track/:bookingId`

Returns public-safe booking tracking data.

Important: do not expose sensitive result values through public tracking. Only return safe booking status, appointment and release availability.

## Payments

### POST `/payments/paystack/initialize`

Initialises Paystack payment for mobile money or card.

Request:

```json
{
  "bookingId": "HLB-2401",
  "email": "ama@example.com",
  "amount": 38000,
  "currency": "GHS"
}
```

Amount should be in pesewas for Paystack.

### GET `/payments/paystack/verify/:reference`

Verifies Paystack payment and updates booking payment status.

## Operations

### GET `/bookings?status=Under%20Review&source=WhatsApp`

Lists bookings for queue management.

### PATCH `/bookings/:bookingId/status`

Updates booking status.

### POST `/assignments`

Assigns a booking to a phlebotomist.

## Phlebotomist

### GET `/assignments/my/today`

Lists today’s field assignments.

### POST `/collections/:assignmentId/checklist`

Submits collection checklist, consent confirmation, sample ID and field notes.

### POST `/collections/:assignmentId/handover`

Records sample handover to dispatch, HomeLabs Lab or partner lab.

## Lab Portal

### GET `/labs/samples/incoming`

Lists samples routed to the signed-in lab.

### POST `/samples/:sampleId/receive`

Confirms sample receipt.

### POST `/samples/:sampleId/reject`

Rejects sample and records reason.

## Results

### POST `/results/upload`

Uploads result PDF or manual result values.

### POST `/results/:resultId/release`

Releases result to patient, clinician or both based on routing rules.

## Partner Leads

### POST `/partners/leads`

Creates a partnership enquiry from public partner form.

## Notifications

### POST `/notifications/booking-confirmation`

Queues SMS/email/WhatsApp booking confirmation.

### POST `/notifications/prep-instructions`

Queues fasting or test preparation instructions.
