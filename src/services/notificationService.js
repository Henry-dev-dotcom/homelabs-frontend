import { apiRequest, jsonBody } from './apiClient.js';
import { contactInfo } from '../data/contactInfo.js';

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
  return `https://wa.me/${contactInfo.whatsapp}?text=${encodeURIComponent(message)}`;
}
