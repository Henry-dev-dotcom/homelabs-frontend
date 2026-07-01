export const roles = [
  { id: 'operations', name: 'Operations', description: 'Manage bookings, requests, dispatch and exceptions.' },
  { id: 'admin', name: 'Admin', description: 'Manage users, labs, tests, service areas, payments and reports.' },
  { id: 'patient', name: 'Patient', description: 'Track bookings, payments, appointments and released results.' },
  { id: 'clinician', name: 'Clinician', description: 'Create patient lab requests and receive results.' },
  { id: 'phlebotomist', name: 'Phlebotomist', description: 'View field assignments, complete collection checklist and update handover.' },
  { id: 'lab', name: 'Lab Staff', description: 'Confirm sample receipt, process tests, upload and release results.' }
];

export const bookings = [];
export const assignments = [];
export const labSamples = [];
export const clinicianRequests = [];
export const staff = [];
export const paymentRecords = [];
