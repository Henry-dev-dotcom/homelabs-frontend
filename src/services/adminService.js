import { staff, paymentRecords, bookings } from '../data/dashboardData.js';
import { partnerLabs, tests, serviceAreas } from '../data/homelabsData.js';
import { apiRequest, jsonBody, mockResponse, USE_MOCKS } from './apiClient.js';

export async function getAdminOverview() {
  if (!USE_MOCKS) return apiRequest('/admin/overview');
  return mockResponse({
    totalBookings: bookings.length,
    activeStaff: staff.length,
    configuredTests: tests.length,
    activeLabs: partnerLabs.length,
    payments: paymentRecords.length,
    serviceAreas: serviceAreas.length
  });
}

export async function listStaff() {
  if (!USE_MOCKS) return apiRequest('/admin/users');
  return mockResponse(staff);
}

export async function createStaffUser(payload) {
  if (!USE_MOCKS) {
    return apiRequest('/admin/users', { method: 'POST', ...jsonBody(payload) });
  }
  return mockResponse({ id: `USR-${Date.now()}`, status: 'ACTIVE', ...payload });
}

export async function listCatalog() {
  if (!USE_MOCKS) return apiRequest('/admin/catalog');
  return mockResponse(tests);
}

export async function upsertCatalogTest(test) {
  if (!USE_MOCKS) {
    return apiRequest(test.id ? `/admin/catalog/tests/${test.id}` : '/admin/catalog/tests', {
      method: test.id ? 'PUT' : 'POST',
      ...jsonBody(test)
    });
  }
  return mockResponse({ ...test, id: test.id || `test-${Date.now()}` });
}

export async function listServiceAreas() {
  if (!USE_MOCKS) return apiRequest('/admin/service-areas');
  return mockResponse(serviceAreas);
}
