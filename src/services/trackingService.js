import { bookings } from '../data/dashboardData.js';
import { buildTimeline, getBookingProgress } from '../workflow/bookingWorkflow.js';
import { apiRequest, mockResponse, USE_MOCKS } from './apiClient.js';

export async function trackBooking(bookingId) {
  if (!USE_MOCKS) {
    const response = await apiRequest(`/public/track/${bookingId}`);
    const status = response.status || 'Under Review';
    return {
      booking: {
        id: response.id,
        patient: response.patient || 'Patient',
        tests: response.tests || ['Tests hidden for privacy'],
        area: response.appointment?.area || 'Kumasi',
        source: response.source || 'Tracking portal',
        lab: response.lab,
        labMode: response.labMode || 'HomeLabs/partner lab routing',
        time: [response.appointment?.date ? new Date(response.appointment.date).toLocaleDateString() : null, response.appointment?.timeSlot].filter(Boolean).join(' · ') || 'Schedule pending',
        address: response.appointment?.area || 'Address hidden for privacy',
        status,
        payment: response.payment || 'Pending',
        phlebotomist: response.phlebotomist || 'Assigned when scheduled',
        priority: response.urgency || 'Routine'
      },
      progress: getBookingProgress(status),
      timeline: response.sample?.custodyEvents?.length
        ? response.sample.custodyEvents.map((event) => ({ label: event.event, meta: event.location || new Date(event.createdAt).toLocaleString(), done: true }))
        : buildTimeline(status),
      nextAction: response.nextAction,
      resultAvailable: response.resultAvailable,
      sample: response.sample
    };
  }

  const recentBooking = readRecentBooking();
  const availableBookings = recentBooking ? [recentBooking, ...bookings] : bookings;
  const booking = availableBookings.find((item) => item.id.toLowerCase() === String(bookingId).toLowerCase()) || availableBookings[0];
  return mockResponse({
    booking,
    progress: getBookingProgress(booking.status),
    timeline: buildTimeline(booking.status),
    nextAction: booking.status === 'Result Ready' ? 'Download result when released' : 'Wait for next HomeLabs update'
  });
}

function readRecentBooking() {
  try {
    const raw = localStorage.getItem('homelabs_recent_booking');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
