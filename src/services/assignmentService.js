import { assignments, staff as demoStaff } from '../data/dashboardData.js';
import { apiRequest, jsonBody, mockResponse, USE_MOCKS } from './apiClient.js';

function label(value) {
  return String(value || '').replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function normaliseStaffUser(user) {
  return {
    id: user.id,
    name: user.name,
    role: label(user.roleKey || user.role || 'PHLEBOTOMIST'),
    roleKey: user.roleKey || user.role,
    zone: user.zone || user.serviceArea || 'Kumasi',
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
    location: booking.address || assignment.location || booking.serviceArea?.name || 'Kumasi',
    area: booking.serviceArea?.name || assignment.area || 'Kumasi',
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

export async function listAvailablePhlebotomists() {
  if (!USE_MOCKS) {
    const response = await apiRequest('/phlebotomists');
    return response.map(normaliseStaffUser);
  }
  return mockResponse(demoStaff.filter((item) => item.role.toLowerCase().includes('phlebotomist')));
}

export async function createAssignment({ bookingId, phlebotomistId, assignedDate, timeSlot, fieldNotes }) {
  if (!USE_MOCKS) {
    const response = await apiRequest('/assignments', {
      method: 'POST',
      ...jsonBody({ bookingId, phlebotomistId, assignedDate, timeSlot, fieldNotes })
    });
    return normaliseAssignment(response);
  }
  return mockResponse({
    id: `ASG-${Date.now()}`,
    bookingId,
    phlebotomistId,
    assignedDate,
    timeSlot,
    fieldNotes,
    status: 'Assigned'
  });
}

export async function listMyTodayAssignments() {
  if (!USE_MOCKS) {
    const response = await apiRequest('/assignments/my/today');
    return response.map(normaliseAssignment);
  }
  return mockResponse(assignments);
}

export async function updateAssignmentStatus(assignmentId, status, notes) {
  const apiStatus = mapAssignmentStatus(status);
  if (!USE_MOCKS) {
    const response = await apiRequest(`/assignments/${assignmentId}/status`, {
      method: 'PATCH',
      ...jsonBody({ status: apiStatus, notes })
    });
    return normaliseAssignment(response);
  }
  return mockResponse({ assignmentId, status, notes, updatedAt: new Date().toISOString() });
}

export async function submitCollectionChecklist(assignmentId, payload = {}) {
  if (!USE_MOCKS) {
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
  return mockResponse({ assignmentId, status: 'Sample Collected', ...payload });
}

export async function submitSampleHandover(assignmentId, payload = {}) {
  if (!USE_MOCKS) {
    return apiRequest(`/collections/${assignmentId}/handover`, {
      method: 'POST',
      ...jsonBody({
        destination: payload.destination || 'HomeLabs Laboratory Kumasi',
        location: payload.location || 'Kumasi',
        notes: payload.notes || 'Sample handed over for laboratory delivery',
        temperatureNote: payload.temperatureNote || 'Transport box sealed'
      })
    });
  }
  return mockResponse({ assignmentId, status: 'Delivered to Lab', ...payload });
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
