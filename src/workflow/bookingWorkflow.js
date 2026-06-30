export const bookingStatuses = [
  'Draft',
  'Submitted',
  'Under Review',
  'Scheduled',
  'Assigned',
  'En Route',
  'Arrived',
  'Sample Collected',
  'In Transit to Lab',
  'Delivered to Lab',
  'Lab Processing',
  'Result Ready',
  'Result Released',
  'Completed'
];

export const terminalStatuses = ['Completed', 'Cancelled', 'Failed Collection', 'Sample Rejected'];

export function getNextStatuses(currentStatus) {
  if (terminalStatuses.includes(currentStatus)) return [];
  const index = bookingStatuses.indexOf(currentStatus);
  if (index === -1) return ['Under Review'];
  return [bookingStatuses[index + 1]].filter(Boolean).concat(['Cancelled']);
}

export function getBookingProgress(currentStatus) {
  const index = bookingStatuses.indexOf(currentStatus);
  if (index === -1) return 0;
  return Math.round(((index + 1) / bookingStatuses.length) * 100);
}

export function buildTimeline(currentStatus) {
  const currentIndex = bookingStatuses.indexOf(currentStatus);
  return bookingStatuses.map((status, index) => ({
    label: status,
    done: currentIndex >= index,
    description: currentIndex >= index ? 'Completed or reached in workflow' : 'Pending'
  }));
}

export function canTransition(currentStatus, nextStatus) {
  return getNextStatuses(currentStatus).includes(nextStatus);
}
