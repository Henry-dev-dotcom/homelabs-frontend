import { bookings } from '../data/dashboardData.js';
import { serviceAreas, tests, partnerLabs, testCategories } from '../data/homelabsData.js';
import { getBookingProgress } from '../workflow/bookingWorkflow.js';
import { apiRequest, jsonBody, mockResponse, USE_MOCKS } from './apiClient.js';

export function normaliseServiceArea(area) {
  return {
    id: area.id,
    name: area.name,
    city: area.city || 'Kumasi',
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
    location: lab.city || lab.location || 'Kumasi',
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
  const label = String(status || 'Under Review').trim();
  const map = {
    'Assigned To Phlebotomist': 'Assigned',
    'Phlebotomist En Route': 'En Route',
    'In Transit To Lab': 'In Transit to Lab'
  };
  return map[label] || label;
}

function normalisePaymentStatus(status = '') {
  const label = String(status || 'Pending').trim();
  const map = {
    'Paid': 'Paid',
    'PaID': 'Paid',
    'Institution Billed': 'Institution billed'
  };
  return map[label] || label;
}

export function normaliseBooking(booking) {
  const testsList = booking.tests?.length ? booking.tests : booking.testDetails?.map((test) => test.name).filter(Boolean) || [];
  const time = booking.time || [booking.preferredDate ? new Date(booking.preferredDate).toLocaleDateString() : 'Date pending', booking.preferredSlot].filter(Boolean).join(' · ');
  const status = normaliseBookingStatus(booking.status || 'Under Review');
  return {
    id: booking.id,
    internalId: booking.internalId,
    source: booking.source || 'Website',
    patient: booking.patient || booking.patientInfo?.fullName || 'Patient',
    phone: booking.phone || booking.patientInfo?.phone || '',
    tests: testsList.length ? testsList : [booking.customTest || 'Manual test request'],
    lab: booking.lab || booking.selectedLab?.name || 'Pending lab routing',
    labMode: booking.labMode || booking.labChoiceType || 'Lab routing pending',
    area: booking.area || booking.serviceArea?.name || 'Kumasi',
    address: booking.address || '',
    time,
    status,
    payment: normalisePaymentStatus(booking.payment || 'Pending'),
    amount: Number(booking.amount || 0),
    phlebotomist: booking.assignment?.phlebotomist?.name || booking.phlebotomist || 'Unassigned',
    priority: booking.urgency || booking.priority || 'Routine',
    sampleId: booking.sampleId,
    resultStatus: booking.resultStatus || 'Pending',
    progress: getBookingProgress(status),
    raw: booking
  };
}

export async function listBookings(filters = {}) {
  if (!USE_MOCKS) {
    const response = await apiRequest(`/bookings${buildFilterQuery(filters)}`);
    return response.map(normaliseBooking);
  }

  const filtered = bookings.filter((booking) => {
    if (filters.status && booking.status !== filters.status) return false;
    if (filters.source && booking.source !== filters.source) return false;
    return true;
  });
  return mockResponse(filtered.map((booking) => ({ ...booking, progress: getBookingProgress(booking.status) })));
}

export async function createBooking(payload) {
  if (!USE_MOCKS) {
    const response = await apiRequest('/bookings', {
      method: 'POST',
      ...jsonBody(payload)
    });
    return normaliseBooking(response);
  }

  const booking = {
    id: `HLB-${Math.floor(3000 + Math.random() * 6999)}`,
    status: 'Under Review',
    payment: 'Pending',
    source: payload.source || 'Website',
    amount: payload.amount || 0,
    ...payload
  };
  return mockResponse(booking);
}

export async function createClinicianBooking(payload) {
  if (!USE_MOCKS) {
    const response = await apiRequest('/clinician/bookings', {
      method: 'POST',
      ...jsonBody(payload)
    });
    return normaliseBooking(response);
  }
  return createBooking({ ...payload, source: 'Clinician' });
}

export async function getBookingOptions() {
  if (!USE_MOCKS) {
    const response = await apiRequest('/booking-options');
    const normalisedTests = response.tests.map(normaliseTest);
    const categories = response.categories?.map((category) => category.name) || [...new Set(normalisedTests.map((test) => test.category))];
    return {
      serviceAreas: response.serviceAreas.map(normaliseServiceArea),
      tests: normalisedTests,
      partnerLabs: response.partnerLabs.map(normaliseLab),
      testCategories: categories
    };
  }

  return mockResponse({ serviceAreas, tests, partnerLabs, testCategories });
}

export async function uploadPrescription(file) {
  if (!file) return null;
  if (!USE_MOCKS) {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest('/files/prescription', { method: 'POST', body: formData });
  }

  return mockResponse({
    fileId: `mock-prescription-${Date.now()}`,
    fileName: file.name,
    fileUrl: '#mock-prescription-upload',
    mimeType: file.type,
    sizeBytes: file.size
  });
}


export function statusToApiStatus(status = '') {
  const key = String(status).trim().toLowerCase();
  const map = {
    'draft': 'DRAFT',
    'submitted': 'SUBMITTED',
    'under review': 'UNDER_REVIEW',
    'scheduled': 'SCHEDULED',
    'assigned': 'ASSIGNED_TO_PHLEBOTOMIST',
    'assigned to phlebotomist': 'ASSIGNED_TO_PHLEBOTOMIST',
    'en route': 'PHLEBOTOMIST_EN_ROUTE',
    'phlebotomist en route': 'PHLEBOTOMIST_EN_ROUTE',
    'arrived': 'ARRIVED',
    'sample collected': 'SAMPLE_COLLECTED',
    'in transit to lab': 'IN_TRANSIT_TO_LAB',
    'delivered to lab': 'DELIVERED_TO_LAB',
    'lab processing': 'LAB_PROCESSING',
    'result ready': 'RESULT_READY',
    'result released': 'RESULT_RELEASED',
    'completed': 'COMPLETED',
    'cancelled': 'CANCELLED',
    'failed collection': 'FAILED_COLLECTION',
    'sample rejected': 'SAMPLE_REJECTED'
  };
  return map[key] || String(status).trim().toUpperCase().replaceAll(' ', '_');
}

export async function updateBookingStatus(bookingId, status) {
  if (!USE_MOCKS) {
    const response = await apiRequest(`/bookings/${bookingId}/status`, {
      method: 'PATCH',
      ...jsonBody({ status: statusToApiStatus(status) })
    });
    return normaliseBooking(response);
  }

  return mockResponse({ bookingId, status, updatedAt: new Date().toISOString() });
}

function buildFilterQuery(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.source) params.set('source', filters.source);
  const query = params.toString();
  return query ? `?${query}` : '';
}
