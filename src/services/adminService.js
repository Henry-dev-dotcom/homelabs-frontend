import { apiRequest, buildQuery, collectionResponse, jsonBody } from './apiClient.js';

export async function getAdminOverview() {
  return apiRequest('/admin/overview');
}

export async function listStaff(params = {}) {
  return collectionResponse(await apiRequest(`/admin/users${buildQuery({ limit: 20, ...params })}`));
}

export async function createStaffUser(payload) {
  return apiRequest('/admin/users', { method: 'POST', ...jsonBody(payload) });
}

export async function listCatalog(params = {}) {
  return collectionResponse(await apiRequest(`/admin/catalog${buildQuery({ limit: 50, ...params })}`));
}

export async function upsertCatalogTest(test) {
  return apiRequest(test.id ? `/admin/catalog/tests/${test.id}` : '/admin/catalog/tests', {
    method: test.id ? 'PUT' : 'POST',
    ...jsonBody(test)
  });
}

export async function listServiceAreas(params = {}) {
  return collectionResponse(await apiRequest(`/admin/service-areas${buildQuery({ limit: 50, ...params })}`));
}
