export const roles = [
  { id: 'operations', name: 'Operations', description: 'Manage bookings, WhatsApp requests, dispatch and exceptions.' },
  { id: 'admin', name: 'Admin', description: 'Manage users, labs, tests, service areas, payments and reports.' },
  { id: 'patient', name: 'Patient', description: 'Track bookings, payments, appointments and released results.' },
  { id: 'clinician', name: 'Clinician', description: 'Create patient lab requests and receive results.' },
  { id: 'phlebotomist', name: 'Phlebotomist', description: 'View field assignments, complete collection checklist and update handover.' },
  { id: 'lab', name: 'Lab Staff', description: 'Confirm sample receipt, process tests, upload and release results.' }
];

export const bookings = [
  {
    id: 'HLB-2401',
    source: 'Website',
    patient: 'Ama Serwaa',
    phone: '+233 24 000 1122',
    tests: ['Full Blood Count', 'Liver Function Test'],
    lab: 'HomeLabs Laboratory',
    labMode: 'HomeLabs-owned lab',
    area: 'Kumasi Central',
    address: 'Adum, near post office',
    time: 'Today · 9:00 AM – 11:00 AM',
    status: 'Under Review',
    payment: 'Paid',
    amount: 380,
    phlebotomist: 'Unassigned',
    priority: 'Routine'
  },
  {
    id: 'HLB-2402',
    source: 'WhatsApp',
    patient: 'Kwame Mensah',
    phone: '+233 55 000 7188',
    tests: ['HbA1c', 'Kidney Function Test'],
    lab: 'Recommend best lab',
    labMode: 'HomeLabs recommendation',
    area: 'Ahodwo',
    address: 'Ahodwo roundabout, private residence',
    time: 'Tomorrow · 7:00 AM – 9:00 AM',
    status: 'Scheduled',
    payment: 'Pending',
    amount: 455,
    phlebotomist: 'Nana Yeboah',
    priority: 'Chronic care monitoring'
  },
  {
    id: 'HLB-2403',
    source: 'Clinician',
    patient: 'Abena Boateng',
    phone: '+233 27 000 9981',
    tests: ['Fasting Blood Sugar', 'Lipid Profile'],
    lab: 'Ashanti Medical Laboratory',
    labMode: 'Partner laboratory',
    area: 'Asokwa',
    address: 'Asokwa, close to Shell station',
    time: 'Today · 7:00 AM – 9:00 AM',
    status: 'Assigned',
    payment: 'Institution billed',
    amount: 360,
    phlebotomist: 'Efua Darko',
    priority: 'Post-discharge follow-up'
  },
  {
    id: 'HLB-2404',
    source: 'Website',
    patient: 'Yaw Frimpong',
    phone: '+233 20 000 3344',
    tests: ['Thyroid Function Test'],
    lab: 'HomeLabs Laboratory',
    labMode: 'HomeLabs-owned lab',
    area: 'Santasi',
    address: 'Santasi Anyinam, family house',
    time: 'Friday · 11:00 AM – 1:00 PM',
    status: 'Sample Collected',
    payment: 'Paid',
    amount: 360,
    phlebotomist: 'Nana Yeboah',
    priority: 'Routine'
  }
];

export const assignments = [
  {
    id: 'ASG-01',
    bookingId: 'HLB-2403',
    patient: 'Abena Boateng',
    location: 'Asokwa',
    time: '7:00 AM – 9:00 AM',
    phlebotomist: 'Efua Darko',
    sampleId: 'SMP-94033',
    status: 'Arrived',
    checklist: ['Identity confirmed', 'Consent confirmed', 'Fasting confirmed']
  },
  {
    id: 'ASG-02',
    bookingId: 'HLB-2404',
    patient: 'Yaw Frimpong',
    location: 'Santasi',
    time: '11:00 AM – 1:00 PM',
    phlebotomist: 'Nana Yeboah',
    sampleId: 'SMP-94034',
    status: 'Sample Collected',
    checklist: ['Identity confirmed', 'Sample labelled', 'Transport box sealed']
  }
];

export const labSamples = [
  {
    id: 'SMP-94031',
    bookingId: 'HLB-2398',
    patient: 'Akosua Appiah',
    tests: ['Full Blood Count', 'Malaria RDT'],
    lab: 'HomeLabs Laboratory',
    status: 'Processing',
    collectedAt: 'Today · 8:12 AM',
    receivedAt: 'Today · 9:04 AM',
    resultStatus: 'Pending upload'
  },
  {
    id: 'SMP-94032',
    bookingId: 'HLB-2399',
    patient: 'Nana Adjei',
    tests: ['Lipid Profile'],
    lab: 'Kumasi Diagnostics Partner Lab',
    status: 'Received',
    collectedAt: 'Today · 9:40 AM',
    receivedAt: 'Today · 10:15 AM',
    resultStatus: 'Awaiting processing'
  },
  {
    id: 'SMP-94030',
    bookingId: 'HLB-2397',
    patient: 'Esi Arthur',
    tests: ['Pregnancy Test'],
    lab: 'HomeLabs Laboratory',
    status: 'Result Ready',
    collectedAt: 'Yesterday · 2:10 PM',
    receivedAt: 'Yesterday · 3:02 PM',
    resultStatus: 'Ready for release'
  }
];

export const clinicianRequests = [
  {
    id: 'CLR-801',
    patient: 'Abena Boateng',
    tests: ['Fasting Blood Sugar', 'Lipid Profile'],
    clinician: 'Dr. K. Owusu',
    status: 'Assigned',
    result: 'Pending',
    created: 'Today'
  },
  {
    id: 'CLR-802',
    patient: 'Daniel Osei',
    tests: ['Kidney Function Test'],
    clinician: 'Dr. K. Owusu',
    status: 'Lab Processing',
    result: 'Pending',
    created: 'Yesterday'
  },
  {
    id: 'CLR-803',
    patient: 'Mavis Asante',
    tests: ['Full Blood Count'],
    clinician: 'Dr. K. Owusu',
    status: 'Completed',
    result: 'Ready',
    created: '2 days ago'
  }
];

export const staff = [
  { id: 'STF-01', name: 'Nana Yeboah', role: 'Certified Phlebotomist', zone: 'Ahodwo · Santasi', status: 'Active' },
  { id: 'STF-02', name: 'Efua Darko', role: 'Certified Phlebotomist', zone: 'Asokwa · Kumasi Central', status: 'On assignment' },
  { id: 'STF-03', name: 'Samuel Adu', role: 'Operations Dispatcher', zone: 'Kumasi', status: 'Active' },
  { id: 'STF-04', name: 'Doreen Agyemang', role: 'Lab Scientist', zone: 'HomeLabs Laboratory', status: 'Active' }
];

export const paymentRecords = [
  { id: 'PAY-101', bookingId: 'HLB-2401', patient: 'Ama Serwaa', method: 'Paystack Mobile Money', amount: 380, status: 'Successful' },
  { id: 'PAY-102', bookingId: 'HLB-2402', patient: 'Kwame Mensah', method: 'Paystack Mobile Money', amount: 455, status: 'Pending' },
  { id: 'PAY-103', bookingId: 'HLB-2403', patient: 'Abena Boateng', method: 'Institution billed', amount: 360, status: 'Awaiting settlement' }
];
