import { paymentRecords } from '../data/dashboardData.js';
import { apiRequest, jsonBody, mockResponse, USE_MOCKS } from './apiClient.js';

export async function listPayments() {
  if (!USE_MOCKS) return apiRequest('/payments');
  return mockResponse(paymentRecords);
}

export async function initialisePaystackPayment({ bookingId, email, amount, method = 'mobile_money', phone }) {
  const mappedMethod = mapPaymentMethodToPaystackChannel(method);

  if (!USE_MOCKS && ['mobile_money', 'card'].includes(mappedMethod)) {
    return apiRequest('/payments/paystack/initialize', {
      method: 'POST',
      ...jsonBody({ bookingId, email, amount, method: mappedMethod, phone })
    });
  }

  const reference = `HL-PAY-${Date.now()}`;
  return mockResponse({
    bookingId,
    email,
    phone,
    amount,
    currency: 'GHS',
    method: mappedMethod,
    provider: 'Paystack',
    reference,
    authorizationUrl: `#paystack-checkout-placeholder-${reference}`,
    channels: mappedMethod === 'card' ? ['card'] : ['mobile_money', 'card']
  });
}

export async function verifyPayment(reference) {
  if (!USE_MOCKS) return apiRequest(`/payments/paystack/verify/${reference}`);
  return mockResponse({ reference, status: 'Successful', provider: 'Paystack', verifiedAt: new Date().toISOString() });
}

export async function recordManualPayment({ bookingId, status = 'PAID', notes }) {
  if (!USE_MOCKS) {
    return apiRequest('/payments/manual', {
      method: 'POST',
      ...jsonBody({ bookingId, status, notes })
    });
  }
  return mockResponse({ bookingId, status, notes, updatedAt: new Date().toISOString() });
}

export function mapPaymentMethodToPaystackChannel(method = '') {
  const normalised = method.toLowerCase();
  if (normalised.includes('card')) return 'card';
  if (normalised.includes('mobile')) return 'mobile_money';
  if (normalised.includes('institution')) return 'institution_billing';
  return 'manual';
}
