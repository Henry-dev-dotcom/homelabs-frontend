import { apiRequest, jsonBody, mockResponse, USE_MOCKS } from './apiClient.js';

export function mapPartnerType(type) {
  const map = {
    laboratory: 'LABORATORY',
    hospital: 'HOSPITAL',
    clinician: 'CLINICIAN',
    corporate: 'CORPORATE',
    other: 'OTHER'
  };
  return map[type] || 'OTHER';
}

export async function createPartnerLead(payload) {
  const apiPayload = {
    type: mapPartnerType(payload.partnerType || payload.type),
    organisation: payload.organisation,
    contactName: payload.contactName,
    phone: payload.phone,
    email: payload.email,
    city: payload.location || payload.city || 'Kumasi',
    message: payload.message
  };

  if (!USE_MOCKS) {
    return apiRequest('/partners/leads', {
      method: 'POST',
      ...jsonBody(apiPayload)
    });
  }

  return mockResponse({
    id: `LEAD-${Date.now()}`,
    status: 'New',
    assignedTeam: 'Partnerships',
    ...payload,
    createdAt: new Date().toISOString()
  });
}
