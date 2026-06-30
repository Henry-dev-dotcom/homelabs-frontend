# Phase 1 + Phase 2 Build Notes

## Phase 1: Public Website

Completed pages/sections:

1. Header and brand mark
2. Hero section
3. How it works
4. Patient section
5. Who HomeLabs serves
6. Lab routing explanation
7. Kumasi launch coverage
8. FAQ
9. Footer
10. WhatsApp CTA

## Phase 2: Patient Booking

Completed booking steps:

1. Patient details
2. Test selection
3. Custom test/prescription upload UI
4. Lab selection
5. Location in Kumasi
6. Scheduling
7. Review and payment summary
8. Booking confirmation placeholder

## Booking rules already represented

- Patients may choose HomeLabs Laboratory.
- Patients may select a partner laboratory.
- Patients may let HomeLabs recommend a lab.
- WhatsApp booking is available.
- Paystack is planned for mobile money/card payment.
- Kumasi is the launch location.
- The test catalog is dynamic and editable from data.

## Backend integration points later

- `POST /bookings`
- `GET /tests`
- `GET /labs`
- `GET /service-areas`
- `POST /payments/paystack/initialize`
- `POST /uploads/prescription`
- `POST /notifications/whatsapp-booking`

## Where to change data now

Edit `src/data/homelabsData.js` for:

- tests
- categories
- partner labs
- Kumasi areas
- time slots
- FAQs
