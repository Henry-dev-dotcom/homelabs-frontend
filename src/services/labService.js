import { apiRequest, buildQuery, collectionResponse, jsonBody } from './apiClient.js';

function label(value) {
  return String(value || '').replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function normaliseSample(sample) {
  const booking = sample.booking || {};
  const patient = booking.patient || {};
  const tests = booking.tests?.map((item) => item.test?.name || item.testId).filter(Boolean) || sample.tests || [];
  const status = label(sample.status || 'RECEIVED');
  return {
    id: sample.sampleCode || sample.id,
    internalId: sample.id,
    bookingId: booking.publicCode || sample.bookingId,
    patient: patient.fullName || sample.patient || 'Patient',
    tests,
    lab: sample.laboratory?.name || sample.lab || 'Laboratory pending',
    status,
    collectedAt: sample.collectedAt ? new Date(sample.collectedAt).toLocaleString() : sample.collectedAt || 'Collection time pending',
    receivedAt: sample.receivedAt ? new Date(sample.receivedAt).toLocaleString() : sample.receivedAt || 'Receipt pending',
    resultStatus: resultStatusFromSample(sample),
    resultId: sample.result?.id || sample.resultId,
    raw: sample
  };
}

function resultStatusFromSample(sample) {
  const key = String(sample.status || '').toUpperCase();
  if (sample.result?.status === 'RELEASED' || key === 'RESULT_RELEASED') return 'Released';
  if (sample.result?.status === 'READY' || key === 'RESULT_READY') return 'Ready for release';
  if (key === 'REJECTED') return 'Rejected';
  if (['RECEIVED', 'DELIVERED'].includes(key)) return 'Awaiting processing';
  if (['COLLECTED', 'IN_TRANSIT'].includes(key)) return 'Awaiting lab receipt';
  return 'Pending upload';
}

export async function listLabs() {
  return apiRequest('/labs');
}

export async function listIncomingSamples(params = {}) {
  const response = await apiRequest(`/labs/samples/incoming${buildQuery({ limit: 20, ...params })}`);
  return collectionResponse(response, normaliseSample);
}

export async function listAcceptedSamples(params = {}) {
  const response = await apiRequest(`/labs/samples/accepted${buildQuery({ limit: 20, ...params })}`);
  return collectionResponse(response, normaliseSample);
}

export async function confirmSampleReceipt(sampleId) {
  const response = await apiRequest(`/samples/${sampleId}/receive`, { method: 'POST', ...jsonBody({}) });
  return normaliseSample(response);
}

export async function markSampleProcessing(sampleId) {
  const response = await apiRequest(`/samples/${sampleId}/processing`, { method: 'POST', ...jsonBody({}) });
  return normaliseSample(response);
}

export async function rejectSample(sampleId, reason) {
  const response = await apiRequest(`/samples/${sampleId}/reject`, { method: 'POST', ...jsonBody({ reason }) });
  return normaliseSample(response);
}
