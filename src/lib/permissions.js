export const rolePermissions = {
  operations: ['bookings:read', 'bookings:update', 'assignments:write', 'whatsapp:create', 'exceptions:read'],
  admin: ['*'],
  patient: ['own_bookings:read', 'own_results:read', 'own_profile:update'],
  clinician: ['patient_requests:create', 'patient_requests:read', 'results:read'],
  phlebotomist: ['assignments:read', 'collections:update', 'handover:update'],
  lab: ['samples:read', 'samples:update', 'results:upload', 'results:release']
};

export function can(role, permission) {
  const permissions = rolePermissions[role] || [];
  return permissions.includes('*') || permissions.includes(permission);
}

export const dashboardAccessLabels = {
  operations: 'Operations can manage requests, manual WhatsApp bookings, assignments and exceptions.',
  admin: 'Admin has full control over catalog, staff, labs, payments, reports and settings.',
  patient: 'Patients can see their own bookings, appointments, payment status and released results.',
  clinician: 'Clinicians can create requests, track patients and review results.',
  phlebotomist: 'Phlebotomists can view assigned visits, complete collection checklists and update handover.',
  lab: 'Lab users can confirm samples, process tests, upload documents and release results.'
};
