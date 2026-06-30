import { apiGet } from './apiClient.js';

export async function getQaWorkflowSummary() {
  return apiGet('/qa/workflow-summary');
}

export async function getQaHealth() {
  return apiGet('/qa/health');
}
