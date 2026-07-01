import { getBookingProgress } from '../workflow/bookingWorkflow.js';
import { apiRequest, buildQuery, collectionResponse, jsonBody } from './apiClient.js';

export function normaliseServiceArea(area) {
  return {
    id: area.id,
    name: area.name,
    city: area.city || '',
    zone: area.zone || '',
    fee: Number(area.fee ?? area.collectionFee ?? 0),
    active: area.active !== false
  };
}

export function normaliseLab(lab) {
  return {
    id: lab.id,
    name: lab.name,
    type: lab.type === 'HOMELABS' ? 'HomeLabs-owned lab' : lab.type === 'PARTNER' ? 'Partner laboratory' : lab.type,
    location: lab.city || lab.location || '',
    turnaround: lab.turnaroundNote || lab.turnaround || 'Turnaround depends on selected tests',
    recommended: lab.type === 'HOMELABS' || Boolean(lab.recommended),
    raw: lab
  };
}

export function normaliseTest(test) {
  const categoryName = typeof test.category === 'string' ? test.category : test.category?.name;
  return {
    id: test.id,
    code: test.code,
    name: test.name,
    category: categoryName || 'General Laboratory Tests',
    sample: test.sample || test.sampleType || 'Sample type pending',
    price: Number(test.price ?? test.basePrice ?? 0),
    fasting: Boolean(test.fasting ?? test.fastingRequired),
    turnaround: test.turnaround || (test.turnaroundHours ? `${test.turnaroundHours} hours` : 'Turnaround pending'),
    raw: test
  };
}

function normaliseBookingStatus(status = '') {
  const label = String(status || 'Under Review').trim().replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
  const map = {
    'Assigned To Phlebotomist': 'Assigned',
    'Phlebotomist En Route': 'En Route',
    'In Transit To Lab': 'In Transit to Lab'
  };
  return map[label] || label;
}

function normalisePaymentStatus(status = '') {
  return String(status || 'Pending').trim().replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function normaliseBooking(booking) {
  const testsList = booking.tests?.length
    ? booking.tests
    : booking.testDetails?.map((item) => item.name || item.test?.name).filter(Boolean) || [];
  const time = booking.time || [booking.preferredDate ? new Date(booking.preferredDate).toLocaleDateString() : 'Date pending', booking.preferredSlot].filter(Boolean).join(' · ');
  const status = normaliseBookingStatus(booking.status || 'Under Review');

  return {
    id: booking.publicCode || booking.id,
    internalId: booking.id,
    source: normaliseBookingStatus(booking.source || 'Website'),
    patient: booking.patient || booking.patientInfo?.fullName || booking.patient?.fullName || 'Patient',
    phone: booking.phone || booking.patientInfo?.phone || booking.patient?.phone || '',
    tests: testsList.length ? testsList : [booking.customTest || 'Manual test request'],
    lab: booking.lab || booking.selectedLab?.name || 'Pending lab routing',
    labMode: booking.labMode || booking.labChoiceType || 'Lab routing pending',
    area: booking.area || booking.serviceArea?.name || 'Area pending',
    address: booking.address || '',
    time,
    status,
    payment: normalisePaymentStatus(booking.payment || booking.paymentStatus || 'Pending'),
    amount: Number(booking.amount || 0),
    phlebotomist: booking.assignment?.phlebotomist?.name || booking.phlebotomist || 'Unassigned',
    priority: booking.urgency || booking.priority || 'Routine',
    sampleId: booking.sampleId || booking.sample?.sampleCode,
    resultStatus: booking.resultStatus || 'Pending',
    progress: getBookingProgress(status),
    raw: booking
  };
}

export async function listBookings(filters = {}) {
  const response = await apiRequest(`/bookings${buildQuery({ limit: 20, ...filters })}`);
  return collectionResponse(response, normaliseBooking);
}

export async function createBooking(payload) {
  const response = await apiRequest('/bookings', { method: 'POST', ...jsonBody(payload) });
  return normaliseBooking(response);
}

export async function createClinicianBooking(payload) {
  const response = await apiRequest('/clinician/bookings', { method: 'POST', ...jsonBody(payload) });
  return normaliseBooking(response);
}

export async function getBookingOptions() {
  const response = await apiRequest('/booking-options');
  const normalisedTests = (response.tests || []).map(normaliseTest);
  const categories = response.categories?.map((category) => category.name) || [...new Set(normalisedTests.map((test) => test.category))];
  return {
    serviceAreas: (response.serviceAreas || []).map(normaliseServiceArea),
    tests: normalisedTests,
    partnerLabs: (response.partnerLabs || []).map(normaliseLab),
    testCategories: categories
  };
}

export async function uploadPrescription(file) {
  if (!file) return null;
  const formData = new FormData();
  formData.append('file', file);
  return apiRequest('/files/prescription', { method: 'POST', body: formData });
}

export function statusToApiStatus(status = '') {
  const key = String(status).trim().toLowerCase();
  const map = {
    draft: 'DRAFT',
    submitted: 'SUBMITTED',
    'under review': 'UNDER_REVIEW',
    scheduled: 'SCHEDULED',
    assigned: 'ASSIGNED_TO_PHLEBOTOMIST',
    'assigned to phlebotomist': 'ASSIGNED_TO_PHLEBOTOMIST',
    'en route': 'PHLEBOTOMIST_EN_ROUTE',
    'phlebotomist en route': 'PHLEBOTOMIST_EN_ROUTE',
    arrived: 'ARRIVED',
    'sample collected': 'SAMPLE_COLLECTED',
    'in transit to lab': 'IN_TRANSIT_TO_LAB',
    'delivered to lab': 'DELIVERED_TO_LAB',
    'lab processing': 'LAB_PROCESSING',
    'result ready': 'RESULT_READY',
    'result released': 'RESULT_RELEASED',
    completed: 'COMPLETED',
    cancelled: 'CANCELLED',
    'failed collection': 'FAILED_COLLECTION',
    'sample rejected': 'SAMPLE_REJECTED'
  };
  return map[key] || String(status).trim().toUpperCase().replaceAll(' ', '_');
}

export async function updateBookingStatus(bookingId, status) {
  const response = await apiRequest(`/bookings/${bookingId}/status`, {
    method: 'PATCH',
    ...jsonBody({ status: statusToApiStatus(status) })
  });
  return normaliseBooking(response);
}
