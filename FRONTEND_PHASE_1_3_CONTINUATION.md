# HomeLabs Frontend Continuation Notes

## Added in this continuation

This update continues from Phase 1 and Phase 2 into the frontend portal foundation.

### Phase 3: Authentication and Role-Based Dashboard Shell

Added:

- Portal login preview page
- Role selector
- Role-based dashboard shell
- Dashboard sidebar
- Dashboard topbar
- Role switching for frontend preview
- Mock-auth style state management

Supported preview roles:

- Operations
- Admin
- Patient
- Clinician
- Phlebotomist
- Lab Staff

### Phase 4/5/6/7/8/9 Preview Pages

The continuation now includes frontend previews for the main portal areas:

- Operations dashboard
- Booking queue
- WhatsApp-assisted booking form
- Assignment board
- Exception placeholder
- Admin dashboard
- Users and staff preview
- Test catalog preview
- Labs and partner routing preview
- Paystack payment monitor preview
- Patient portal preview
- Clinician request portal preview
- Phlebotomist assignment/checklist preview
- Lab incoming samples and result upload preview

## Important frontend notes

This is still a frontend prototype using mock data only. It is prepared for backend integration but does not yet persist data.

The next technical step should be to split the dashboard preview pages into separate route/page files and connect the booking form to a real backend service layer.

## Run instructions

```bash
npm install
npm run dev
```

## Build test

The project was successfully tested with:

```bash
npm run build
```
