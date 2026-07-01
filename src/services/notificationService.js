import { apiRequest, jsonBody } from './apiClient.js';

export async function sendBookingConfirmation({ bookingId, channel = 'sms', recipient }) {
  return apiRequest('/notifications/booking-confirmation', {
    method: 'POST',
    ...jsonBody({ bookingId, channel, recipient })
  });
}

export async function sendPrepInstructions({ bookingId, fastingRequired, channel = 'sms', recipient }) {
  return apiRequest('/notifications/prep-instructions', {
    method: 'POST',
    ...jsonBody({ bookingId, fastingRequired, channel, recipient })
  });
}

export function buildWhatsAppBookingUrl(message) {
  const phone = import.meta.env.VITE_HOMELABS_WHATSAPP || '233000000000';
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
