import { mockResponse } from './apiClient.js';

export async function sendBookingConfirmation({ bookingId, channel = 'sms' }) {
  return mockResponse({ bookingId, channel, status: 'Queued' });
}

export async function sendPrepInstructions({ bookingId, fastingRequired }) {
  return mockResponse({ bookingId, fastingRequired, status: 'Queued' });
}

export function buildWhatsAppBookingUrl(message) {
  const phone = import.meta.env.VITE_HOMELABS_WHATSAPP || '233000000000';
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
