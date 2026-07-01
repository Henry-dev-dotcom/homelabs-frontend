import { apiRequest, buildQuery, collectionResponse, jsonBody } from './apiClient.js';

function label(value) {
  return String(value || '').replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function normaliseStaffUser(user) {
  return {
    id: user.id,
    name: user.name,
    role: label(user.roleKey || user.role || 'PHLEBOTOMIST'),
    roleKey: user.roleKey || user.role,
    zone: user.zone || user.serviceArea || 'Zone not set',
    status: label(user.status || 'ACTIVE'),
    raw: user
  };
}

export function normaliseAssignment(assignment) {
  const booking = assignment.booking || {};
  const patient = booking.patient || {};
  const tests = booking.tests?.map((item) => item.test?.name || item.testId).filter(Boolean) || assignment.tests || [];
  const sampleId = booking.sample?.sampleCode || assignment.sampleId || assignment.sample?.sampleCode;

  return {
    id: assignment.id,
    bookingId: booking.publicCode || assignment.bookingId,
    internalBookingId: booking.id || assignment.bookingId,
    patient: patient.fullName || assignment.patient || 'Patient',
    location: booking.address || assignment.location || booking.serviceArea?.name || 'Location pending',
    area: booking.serviceArea?.name || assignment.area || 'Area pending',
    time: assignment.timeSlot || booking.preferredSlot || assignment.time || 'Time pending',
    phlebotomist: assignment.phlebotomist?.name || assignment.phlebotomist || 'Assigned phlebotomist',
    phlebotomistId: assignment.phlebotomistId,
    sampleId: sampleId || 'Sample pending',
    status: label(assignment.status || 'ASSIGNED'),
    checklist: assignment.checklist || ['Identity pending', 'Consent pending', 'Sample ID pending'],
    tests,
    raw: assignment
  };
}

export async function listAvailablePhlebotomists(params = {}) {
  const response = await apiRequest(`/phlebotomists${buildQuery({ limit: 50, ...params })}`);
  return collectionResponse(response, normaliseStaffUser);
}

export async function createAssignment({ bookingId, phlebotomistId, assignedDate, timeSlot, fieldNotes }) {
  const response = await apiRequest('/assignments', {
    method: 'POST',
    ...jsonBody({ bookingId, phlebotomistId, assignedDate, timeSlot, fieldNotes })
  });
  return normaliseAssignment(response);
}

export async function listMyTodayAssignments(params = {}) {
  const response = await apiRequest(`/assignments/my/today${buildQuery({ limit: 20, ...params })}`);
  return collectionResponse(response, normaliseAssignment);
}

export async function updateAssignmentStatus(assignmentId, status, notes) {
  const response = await apiRequest(`/assignments/${assignmentId}/status`, {
    method: 'PATCH',
    ...jsonBody({ status: mapAssignmentStatus(status), notes })
  });
  return normaliseAssignment(response);
}

export async function submitCollectionChecklist(assignmentId, payload = {}) {
  return apiRequest(`/collections/${assignmentId}/checklist`, {
    method: 'POST',
    ...jsonBody({
      identityConfirmed: true,
      consentConfirmed: true,
      fastingConfirmed: Boolean(payload.fastingConfirmed),
      sampleCode: payload.sampleCode,
      notes: payload.notes || 'Checklist completed from field portal',
      location: payload.location,
      temperatureNote: payload.temperatureNote
    })
  });
}

export async function submitSampleHandover(assignmentId, payload = {}) {
  return apiRequest(`/collections/${assignmentId}/handover`, {
    method: 'POST',
    ...jsonBody({
      destination: payload.destination || 'Assigned laboratory',
      location: payload.location || 'Location pending',
      notes: payload.notes || 'Sample handed over for laboratory delivery',
      temperatureNote: payload.temperatureNote || 'Transport box sealed'
    })
  });
}

export function mapAssignmentStatus(status = '') {
  const normalised = String(status).toLowerCase();
  if (normalised.includes('en route')) return 'EN_ROUTE';
  if (normalised.includes('arrived')) return 'ARRIVED';
  if (normalised.includes('collected')) return 'COLLECTED';
  if (normalised.includes('handover') || normalised.includes('transit') || normalised.includes('delivered')) return 'HANDED_OVER';
  if (normalised.includes('failed')) return 'FAILED';
  if (normalised.includes('cancel')) return 'CANCELLED';
  return 'ASSIGNED';
}
