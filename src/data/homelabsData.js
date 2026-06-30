export const serviceAreas = [
  { id: 'kumasi-central', name: 'Kumasi Central', fee: 80, active: true },
  { id: 'asokwa', name: 'Asokwa', fee: 90, active: true },
  { id: 'ahodwo', name: 'Ahodwo', fee: 95, active: true },
  { id: 'santasi', name: 'Santasi', fee: 100, active: true },
  { id: 'bantama', name: 'Bantama', fee: 85, active: true },
  { id: 'suame', name: 'Suame', fee: 95, active: true },
  { id: 'ejisu', name: 'Ejisu', fee: 120, active: true }
];

export const partnerLabs = [
  {
    id: 'homelabs-lab',
    name: 'HomeLabs Laboratory',
    type: 'HomeLabs-owned lab',
    location: 'Kumasi',
    turnaround: 'Same day / 24 hours for common tests',
    recommended: true
  },
  {
    id: 'partner-kumasi-diagnostics',
    name: 'Kumasi Diagnostics Partner Lab',
    type: 'Partner laboratory',
    location: 'Kumasi Central',
    turnaround: '24–48 hours',
    recommended: false
  },
  {
    id: 'partner-ashanti-medlab',
    name: 'Ashanti Medical Laboratory',
    type: 'Partner laboratory',
    location: 'Asokwa',
    turnaround: '24–72 hours',
    recommended: false
  }
];

export const testCategories = [
  'Haematology',
  'Clinical Chemistry',
  'Microbiology',
  'Serology & Immunology',
  'Hormonal Assays',
  'Urinalysis',
  'Stool Tests',
  'Fertility Tests',
  'Liver Function Tests',
  'Kidney Function Tests',
  'Lipid Profile',
  'Diabetes Tests',
  'Infectious Disease Tests',
  'Thyroid Function Tests',
  'Corporate Wellness Panels',
  'Custom Test Request'
];

export const tests = [
  { id: 'fbc', name: 'Full Blood Count', category: 'Haematology', sample: 'Blood', price: 120, fasting: false, turnaround: 'Same day' },
  { id: 'malaria-rdt', name: 'Malaria Parasite / RDT', category: 'Infectious Disease Tests', sample: 'Blood', price: 80, fasting: false, turnaround: 'Same day' },
  { id: 'lft', name: 'Liver Function Test', category: 'Liver Function Tests', sample: 'Blood', price: 180, fasting: false, turnaround: '24 hours' },
  { id: 'rft', name: 'Kidney Function Test', category: 'Kidney Function Tests', sample: 'Blood', price: 180, fasting: false, turnaround: '24 hours' },
  { id: 'lipid', name: 'Lipid Profile', category: 'Lipid Profile', sample: 'Blood', price: 200, fasting: true, turnaround: '24 hours' },
  { id: 'fbs', name: 'Fasting Blood Sugar', category: 'Diabetes Tests', sample: 'Blood', price: 70, fasting: true, turnaround: 'Same day' },
  { id: 'hba1c', name: 'HbA1c', category: 'Diabetes Tests', sample: 'Blood', price: 180, fasting: false, turnaround: '24 hours' },
  { id: 'tft', name: 'Thyroid Function Test', category: 'Thyroid Function Tests', sample: 'Blood', price: 260, fasting: false, turnaround: '24–48 hours' },
  { id: 'urinalysis', name: 'Urinalysis', category: 'Urinalysis', sample: 'Urine', price: 70, fasting: false, turnaround: 'Same day' },
  { id: 'stool-re', name: 'Stool R/E', category: 'Stool Tests', sample: 'Stool', price: 90, fasting: false, turnaround: 'Same day' },
  { id: 'pregnancy', name: 'Pregnancy Test', category: 'Fertility Tests', sample: 'Blood/Urine', price: 80, fasting: false, turnaround: 'Same day' },
  { id: 'wellness-basic', name: 'Basic Wellness Panel', category: 'Corporate Wellness Panels', sample: 'Blood/Urine', price: 520, fasting: true, turnaround: '24–48 hours' }
];

export const timeSlots = [
  '7:00 AM – 9:00 AM',
  '9:00 AM – 11:00 AM',
  '11:00 AM – 1:00 PM',
  '1:00 PM – 3:00 PM',
  '3:00 PM – 5:00 PM'
];

export const faqs = [
  {
    question: 'Do I need to visit the lab?',
    answer: 'No. HomeLabs sends a certified phlebotomist to your home, office or care facility to collect the required sample.'
  },
  {
    question: 'Can I choose my own laboratory?',
    answer: 'Yes. You can choose HomeLabs Laboratory, select a partner lab, or ask HomeLabs to recommend the best lab for your test.'
  },
  {
    question: 'Can my doctor request tests for me?',
    answer: 'Yes. Clinicians can create lab requests for their patients and receive results through the clinician portal.'
  },
  {
    question: 'How do I pay?',
    answer: 'The MVP is prepared for Paystack checkout, including mobile money and card payment options.'
  },
  {
    question: 'Can I book through WhatsApp?',
    answer: 'Yes. Patients can start a WhatsApp booking and a HomeLabs support agent can complete the booking internally.'
  }
];
