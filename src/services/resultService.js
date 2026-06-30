import { labSamples } from '../data/dashboardData.js';
import { apiRequest, jsonBody, mockResponse, USE_MOCKS } from './apiClient.js';

export async function listResults() {
  if (!USE_MOCKS) return apiRequest('/results');
  return mockResponse(labSamples.filter((sample) => sample.resultStatus.toLowerCase().includes('ready')));
}

export async function uploadResult({ sampleId, notes, file, manualValues, releaseTo = 'PATIENT' }) {
  if (!USE_MOCKS) {
    const formData = new FormData();
    formData.append('sampleId', sampleId);
    if (notes) formData.append('notes', notes);
    if (manualValues) formData.append('manualValues', JSON.stringify(manualValues));
    if (releaseTo) formData.append('releaseTo', releaseTo);
    if (file) formData.append('file', file);
    return apiRequest('/results/upload', { method: 'POST', body: formData });
  }

  return mockResponse({
    resultId: `RES-${Date.now()}`,
    sampleId,
    notes,
    fileName: file?.name || 'result.pdf',
    status: 'Result Ready'
  });
}

export async function releaseResult(resultId, recipients = ['patient']) {
  if (!USE_MOCKS) {
    return apiRequest(`/results/${resultId}/release`, {
      method: 'POST',
      ...jsonBody({ recipients })
    });
  }
  return mockResponse({ resultId, recipients, status: 'Result Released', releasedAt: new Date().toISOString() });
}
