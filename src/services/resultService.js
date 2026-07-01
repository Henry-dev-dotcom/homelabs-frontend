import { apiRequest, buildQuery, collectionResponse, jsonBody } from './apiClient.js';

export async function listResults(params = {}) {
  return collectionResponse(await apiRequest(`/results${buildQuery({ limit: 20, ...params })}`));
}

export async function uploadResult({ sampleId, notes, file, manualValues, releaseTo = 'PATIENT' }) {
  const formData = new FormData();
  formData.append('sampleId', sampleId);
  if (notes) formData.append('notes', notes);
  if (manualValues) formData.append('manualValues', JSON.stringify(manualValues));
  if (releaseTo) formData.append('releaseTo', releaseTo);
  if (file) formData.append('file', file);
  return apiRequest('/results/upload', { method: 'POST', body: formData });
}

export async function releaseResult(resultId, recipients = ['patient']) {
  return apiRequest(`/results/${resultId}/release`, {
    method: 'POST',
    ...jsonBody({ recipients })
  });
}
