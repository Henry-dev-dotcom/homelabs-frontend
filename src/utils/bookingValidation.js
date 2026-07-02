export function normalisePhone(phone = '') {
  return phone.replace(/\s+/g, '').trim();
}

export function isValidEmail(email = '') {
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function validateBookingStep(form, stepId, context = {}) {
  const errors = [];

  if (stepId === 'patient') {
    if (!form.fullName?.trim()) errors.push('Patient full name is required.');
    if (normalisePhone(form.phone).length < 10) errors.push('Enter a valid Ghana phone number.');
    if (form.email && !isValidEmail(form.email)) errors.push('Enter a valid email address or leave it blank.');
  }

  if (stepId === 'tests') {
    const hasSelectedTests = Array.isArray(form.selectedTestIds) && form.selectedTestIds.length > 0;
    const hasManualRequest = Boolean(form.customTest?.trim() || form.prescriptionName?.trim());
    if (!hasSelectedTests && !hasManualRequest) errors.push('Select at least one test, type a custom request, or upload a request form.');
  }

  if (stepId === 'lab') {
    if (!form.labChoice) errors.push('Choose a laboratory routing option.');
    if (form.labChoice === 'partner' && !form.partnerLabId) {
      errors.push('Select the partner laboratory that should process the sample.');
    }
  }

  if (stepId === 'location') {
    if (!form.areaId && context.hasServiceAreas !== false) errors.push('Select the Kumasi service area.');
    if (!form.address?.trim()) errors.push('Enter the full collection address.');
    if (!form.landmark?.trim()) errors.push('Add a nearby landmark or access instruction.');
  }

  if (stepId === 'schedule') {
    if (!form.date) errors.push('Select the preferred collection date.');
    if (!form.timeSlot) errors.push('Select a preferred time slot.');
  }

  if (stepId === 'review') {
    if (!form.paymentMethod) errors.push('Select a payment method.');
    if (!form.consent) errors.push('Patient consent is required before submitting the booking.');
  }

  return errors;
}

export function validateBookingForm(form, steps, context = {}) {
  const result = {};
  steps.forEach((step) => {
    result[step.id] = validateBookingStep(form, step.id, context);
  });
  return result;
}

export function hasBlockingErrors(errorMap = {}) {
  return Object.values(errorMap).some((items) => Array.isArray(items) && items.length > 0);
}
