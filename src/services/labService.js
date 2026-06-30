import { labSamples } from '../data/dashboardData.js';
import { partnerLabs } from '../data/homelabsData.js';
import { apiRequest, jsonBody, mockResponse, USE_MOCKS } from './apiClient.js';

function label(value) {
  return String(value || '').replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value, fallback = 'Pending') {
  if (!value) return fallback;
  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
}

export function normaliseSample(sample) {
  const booking = sample.booking || {};
  const tests = booking.tests?.map((item) => item.test?.name || item.testId).filter(Boolean) || sample.tests || [];
  const result = sample.result || booking.result;
  return {
    id: sample.sampleCode || sample.id,
    internalId: sample.id,
    bookingId: booking.publicCode || sample.bookingId,
    internalBookingId: booking.id || sample.bookingId,
    patient: booking.patient?.fullName || sample.patient || 'Patient',
    tests: tests.length ? tests : ['Pending test detail'],
    lab: sample.laboratory?.name || sample.lab || booking.selectedLab?.name || 'HomeLabs Laboratory',
    status: normaliseSampleStatus(sample.status),
    statusKey: sample.status,
    collectedAt: formatDate(sample.collectedAt, 'Collection pending'),
    receivedAt: formatDate(sample.receivedAt, 'Receipt pending'),
    resultStatus: result?.status ? label(result.status) : normaliseResultStatus(sample.status),
    resultId: result?.id,
    rejectionReason: sample.rejectionReason,
    custodyEvents: sample.custodyEvents || [],
    raw: sample
  };
}

export function normaliseSampleStatus(status = '') {
  const key = String(status).toUpperCase();
  const map = {
    NOT_COLLECTED: 'Not Collected',
    COLLECTED: 'Collected',
    IN_TRANSIT: 'In Transit',
    DELIVERED: 'Received',
    RECEIVED: 'Received',
    PROCESSING: 'Processing',
    RESULT_READY: 'Result Ready',
    RESULT_RELEASED: 'Result Released',
    REJECTED: 'Sample Rejected'
  };
  return map[key] || label(status || 'Pending');
}

function normaliseResultStatus(status = '') {
  const key = String(status).toUpperCase();
  if (key === 'PROCESSING') return 'Processing';
  if (key === 'RESULT_READY') return 'Ready for release';
  if (key === 'RESULT_RELEASED') return 'Released';
  if (key === 'REJECTED') return 'Rejected';
  if (['RECEIVED', 'DELIVERED'].includes(key)) return 'Awaiting processing';
  if (['COLLECTED', 'IN_TRANSIT'].includes(key)) return 'Awaiting lab receipt';
  return 'Pending upload';
}

export async function listLabs() {
  if (!USE_MOCKS) return apiRequest('/labs');
  return mockResponse(partnerLabs);
}

export async function listIncomingSamples() {
  if (!USE_MOCKS) {
    const response = await apiRequest('/labs/samples/incoming');
    return response.map(normaliseSample);
  }
  return mockResponse(labSamples);
}

export async function listAcceptedSamples() {
  if (!USE_MOCKS) {
    const response = await apiRequest('/labs/samples/accepted');
    return response.map(normaliseSample);
  }
  return mockResponse(labSamples.filter((sample) => ['Processing', 'Result Ready', 'Result Released'].includes(sample.status)));
}

export async function confirmSampleReceipt(sampleId) {
  if (!USE_MOCKS) {
    const response = await apiRequest(`/samples/${sampleId}/receive`, { method: 'POST', ...jsonBody({}) });
    return normaliseSample(response);
  }
  return mockResponse({ sampleId, status: 'Received', receivedAt: new Date().toISOString() });
}

export async function markSampleProcessing(sampleId) {
  if (!USE_MOCKS) {
    const response = await apiRequest(`/samples/${sampleId}/processing`, { method: 'POST', ...jsonBody({}) });
    return normaliseSample(response);
  }
  return mockResponse({ sampleId, status: 'Processing', updatedAt: new Date().toISOString() });
}

export async function rejectSample(sampleId, reason) {
  if (!USE_MOCKS) {
    const response = await apiRequest(`/samples/${sampleId}/reject`, {
      method: 'POST',
      ...jsonBody({ reason })
    });
    return normaliseSample(response);
  }
  return mockResponse({ sampleId, status: 'Sample Rejected', reason });
}
