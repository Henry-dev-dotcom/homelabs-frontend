import { apiRequest, buildQuery, collectionResponse, jsonBody } from './apiClient.js';

export async function listPayments(params = {}) {
  return collectionResponse(await apiRequest(`/payments${buildQuery({ limit: 20, ...params })}`));
}

export async function initialisePaystackPayment({ bookingId, email, amount, method = 'mobile_money', phone }) {
  const mappedMethod = mapPaymentMethodToPaystackChannel(method);
  if (!['mobile_money', 'card'].includes(mappedMethod)) return null;
  const amountPesewas = Math.round(Number(amount || 0) * 100);
  return apiRequest('/payments/paystack/initialize', {
    method: 'POST',
    ...jsonBody({ bookingId, email, amount: amountPesewas, method: mappedMethod, phone })
  });
}

export async function verifyPayment(reference) {
  return apiRequest(`/payments/paystack/verify/${reference}`);
}

export async function recordManualPayment({ bookingId, status = 'PAID', notes }) {
  return apiRequest('/payments/manual', {
    method: 'POST',
    ...jsonBody({ bookingId, status, notes })
  });
}

export function mapPaymentMethodToPaystackChannel(method = '') {
  const normalised = method.toLowerCase();
  if (normalised.includes('card')) return 'card';
  if (normalised.includes('mobile')) return 'mobile_money';
  if (normalised.includes('institution')) return 'institution_billing';
  return 'manual';
}
