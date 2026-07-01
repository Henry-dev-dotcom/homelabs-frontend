import { apiRequest, buildQuery, collectionResponse, jsonBody } from './apiClient.js';

export function mapPartnerType(type) {
  const map = { laboratory: 'LABORATORY', hospital: 'HOSPITAL', clinician: 'CLINICIAN', corporate: 'CORPORATE', other: 'OTHER' };
  return map[type] || 'OTHER';
}

export async function createPartnerLead(payload) {
  return apiRequest('/partners/leads', {
    method: 'POST',
    ...jsonBody({
      type: mapPartnerType(payload.partnerType || payload.type),
      organisation: payload.organisation,
      contactName: payload.contactName,
      phone: payload.phone,
      email: payload.email,
      city: payload.location || payload.city || '',
      message: payload.message
    })
  });
}

export async function listPartnerLeads(params = {}) {
  return collectionResponse(await apiRequest(`/partners/leads${buildQuery({ limit: 20, ...params })}`));
}
