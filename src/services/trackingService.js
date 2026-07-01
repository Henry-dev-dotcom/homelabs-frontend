import { buildTimeline, getBookingProgress } from '../workflow/bookingWorkflow.js';
import { apiRequest } from './apiClient.js';

export async function trackBooking(bookingId) {
  const response = await apiRequest(`/public/track/${bookingId}`);
  const status = response.status || 'Under Review';
  return {
    booking: {
      id: response.id,
      patient: response.patient || 'Patient',
      tests: response.tests || ['Tests hidden for privacy'],
      area: response.appointment?.area || 'Area hidden for privacy',
      source: response.source || 'Tracking portal',
      lab: response.lab,
      labMode: response.labMode || 'Laboratory routing',
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
