import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { DashboardLayout, getFirstSectionForRole } from '../layouts/DashboardLayout.jsx';
import { serviceAreas } from '../data/homelabsData.js';
import { getNextStatuses } from '../workflow/bookingWorkflow.js';
import { attachPagination, paginationFrom, LOCAL_DATA_MODE } from '../services/apiClient.js';
import { createBooking, listBookings, updateBookingStatus } from '../services/bookingService.js';
import { recordManualPayment, listPayments } from '../services/paymentService.js';
import { confirmSampleReceipt as apiConfirmSampleReceipt, listAcceptedSamples, listIncomingSamples, markSampleProcessing as apiMarkSampleProcessing, rejectSample as apiRejectSample } from '../services/labService.js';
import { releaseResult as apiReleaseResult, uploadResult as apiUploadResult } from '../services/resultService.js';
import {
  createAssignment as apiCreateAssignment,
  listAvailablePhlebotomists,
  listMyTodayAssignments,
  submitCollectionChecklist,
  submitSampleHandover,
  updateAssignmentStatus as apiUpdateAssignmentStatus
} from '../services/assignmentService.js';

const lazyNamed = (loader, exportName) => lazy(() => loader().then((module) => ({ default: module[exportName] })));

const BookingPage = lazyNamed(() => import('./BookingPage.jsx'), 'BookingPage');
const OperationsDashboard = lazyNamed(() => import('./dashboard/OperationsDashboard.jsx'), 'OperationsDashboard');
const AdminDashboard = lazyNamed(() => import('./dashboard/AdminDashboard.jsx'), 'AdminDashboard');
const PatientPortal = lazyNamed(() => import('./dashboard/PatientPortal.jsx'), 'PatientPortal');
const ClinicianPortal = lazyNamed(() => import('./dashboard/ClinicianPortal.jsx'), 'ClinicianPortal');
const PhlebotomistPortal = lazyNamed(() => import('./dashboard/PhlebotomistPortal.jsx'), 'PhlebotomistPortal');
const LabPortal = lazyNamed(() => import('./dashboard/LabPortal.jsx'), 'LabPortal');

function PortalLoader({ role }) {
  return (
    <section className="dashboard-portal-loader" role="status" aria-live="polite">
      <span className="route-loader__spinner" aria-hidden="true" />
      <strong>Loading {role} portal</strong>
      <small>Opening this dashboard section without loading every role portal upfront.</small>
    </section>
  );
}

function buildSampleId() {
  return `SMP-${Math.floor(94000 + Math.random() * 900)}`;
}

function buildBookingId(bookings) {
  const nextNumber = 2400 + bookings.length + 1;
  return `HLB-${nextNumber}`;
}

function nowLabel() {
  return new Date().toLocaleString();
}

function mergeById(...collections) {
  const map = new Map();
  collections.flat().filter(Boolean).forEach((item) => map.set(item.id, { ...(map.get(item.id) || {}), ...item }));
  const merged = [...map.values()];
  const metas = collections.map(paginationFrom).filter((meta) => meta.total || meta.totalPages);

  if (!metas.length) return attachPagination(merged);

  return attachPagination(merged, {
    page: Math.min(...metas.map((meta) => meta.page || 1)),
    limit: metas.reduce((sum, meta) => sum + Number(meta.limit || 0), 0),
    total: metas.reduce((sum, meta) => sum + Number(meta.total || 0), 0),
    totalPages: Math.max(...metas.map((meta) => meta.totalPages || 0)),
    hasPreviousPage: metas.some((meta) => meta.hasPreviousPage),
    hasNextPage: metas.some((meta) => meta.hasNextPage)
  });
}

function upsertById(items, nextItem) {
  if (!nextItem?.id) return items;
  const exists = items.some((item) => item.id === nextItem.id);
  return exists ? items.map((item) => (item.id === nextItem.id ? { ...item, ...nextItem } : item)) : [nextItem, ...items];
}

function normalisePaymentRecords(records) {
  return attachPagination(records.map(normalisePaymentRecord), paginationFrom(records));
}

function normalisePaymentRecord(record) {
  return {
    id: record.id,
    bookingId: record.booking?.publicCode || record.bookingId,
    patient: record.booking?.patient?.fullName || record.patient || 'Patient',
    method: record.method ? String(record.method).replaceAll('_', ' ') : 'Payment',
    amount: Number(record.amount || 0),
    status: record.status === 'PAID' ? 'Successful' : String(record.status || 'Pending').replaceAll('_', ' '),
    raw: record
  };
}

function mapLabChoice(lab = '') {
  const value = String(lab).toLowerCase();
  if (value.includes('recommend')) return 'recommend';
  if (value.includes('homelabs')) return 'homelabs-lab';
  return 'partner';
}

function releaseRuleToApi(rule = '') {
  const value = String(rule).toLowerCase();
  if (value.includes('both')) return 'BOTH';
  if (value.includes('clinician')) return 'CLINICIAN';
  if (value.includes('review')) return 'INTERNAL_REVIEW';
  return 'PATIENT';
}

const initialActivityLog = [
  'Production dashboard ready. Backend data will appear after login and API connection.'
];

export function Dashboard({ role, user, initialSection, onBackHome, onLogout }) {
  const [activePage, setActivePage] = useState(initialSection || getFirstSectionForRole(role));
  const [bookings, setBookings] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [labSamples, setLabSamples] = useState([]);
  const [paymentRecords, setPaymentRecords] = useState([]);
  const [staff, setStaff] = useState([]);
  const [clinicianRequests, setClinicianRequests] = useState([]);
  const [activityLog, setActivityLog] = useState(initialActivityLog);
  const [connectionNotice, setConnectionNotice] = useState('Connecting to backend APIs.');
  const [loadingDashboard, setLoadingDashboard] = useState(false);

  useEffect(() => {
    setActivePage(initialSection || getFirstSectionForRole(role));
  }, [role]); // eslint-disable-line react-hooks/exhaustive-deps


  useEffect(() => {
    let alive = true;

    async function loadBackendState() {
      setLoadingDashboard(true);
      try {
        const requests = [
          listBookings({ page: 1, limit: 20 }).then((items) => ({ key: 'bookings', items })).catch((error) => ({ key: 'bookingsError', error })),
          listAvailablePhlebotomists({ page: 1, limit: 50 }).then((items) => ({ key: 'staff', items })).catch((error) => ({ key: 'staffError', error })),
          listPayments({ page: 1, limit: 20 }).then((items) => ({ key: 'payments', items })).catch((error) => ({ key: 'paymentsError', error })),
          Promise.all([listIncomingSamples({ page: 1, limit: 20 }), listAcceptedSamples({ page: 1, limit: 20 })]).then(([incoming, accepted]) => ({ key: 'samples', items: mergeById(incoming, accepted) })).catch((error) => ({ key: 'samplesError', error }))
        ];

        if (role === 'phlebotomist') {
          requests.push(listMyTodayAssignments({ page: 1, limit: 20 }).then((items) => ({ key: 'assignments', items })).catch((error) => ({ key: 'assignmentsError', error })));
        }

        const results = await Promise.all(requests);
        if (!alive) return;

        const failures = [];
        results.forEach((result) => {
          if (result.key === 'bookings') setBookings(result.items);
          if (result.key === 'staff') setStaff(result.items);
          if (result.key === 'payments') setPaymentRecords(normalisePaymentRecords(result.items));
          if (result.key === 'samples') setLabSamples(result.items);
          if (result.key === 'assignments') setAssignments(result.items);
          if (result.error) failures.push(result.error.message);
        });

        if (failures.length) {
          setConnectionNotice(`Connected mode loaded with limited access: ${failures[0]}`);
        } else {
          setConnectionNotice('Connected mode active: backend data loaded successfully.');
        }
      } finally {
        if (alive) setLoadingDashboard(false);
      }
    }

    loadBackendState();
    return () => { alive = false; };
  }, [role]);

  function addActivity(message) {
    setActivityLog((items) => [message, ...items].slice(0, 10));
  }

  function addErrorActivity(action, error) {
    const message = `${action} failed: ${error.message}`;
    setConnectionNotice(message);
    addActivity(message);
  }

  function refreshDashboardState() {
    setConnectionNotice('Refreshing backend data.');
    setActivityLog((items) => ['Backend refresh requested.', ...items].slice(0, 10));
  }

  function updateBooking(id, patch) {
    setBookings((items) => items.map((item) => (item.id === id || item.internalId === id ? { ...item, ...patch } : item)));
  }

  async function advanceBooking(id) {
    const booking = bookings.find((item) => item.id === id || item.internalId === id);
    if (!booking) return;
    const nextStatus = getNextStatuses(booking.status).find((status) => status !== 'Cancelled');
    if (!nextStatus) return;

    try {
      if (!LOCAL_DATA_MODE) {
        const updated = await updateBookingStatus(booking.internalId || booking.id, nextStatus);
        updateBooking(booking.id, updated);
      } else {
        updateBooking(id, { status: nextStatus });
      }
      addActivity(`${booking.id} moved from ${booking.status} to ${nextStatus}.`);
    } catch (error) {
      addErrorActivity(`Advance ${booking.id}`, error);
    }
  }

  async function setBookingStatus(id, status) {
    const booking = bookings.find((item) => item.id === id || item.internalId === id);
    try {
      if (!LOCAL_DATA_MODE && booking) {
        const updated = await updateBookingStatus(booking.internalId || booking.id, status);
        updateBooking(booking.id, updated);
      } else {
        updateBooking(id, { status });
      }
      addActivity(`${id} status changed to ${status}.`);
    } catch (error) {
      addErrorActivity(`Status update ${id}`, error);
    }
  }

  async function confirmPayment(id) {
    const booking = bookings.find((item) => item.id === id || item.internalId === id);
    if (!booking) return;

    try {
      if (!LOCAL_DATA_MODE) {
        await recordManualPayment({ bookingId: booking.internalId || booking.id, status: 'PAID', notes: 'Confirmed from HomeLabs operations dashboard.' });
      }
      updateBooking(booking.id, { payment: 'Paid' });
      setPaymentRecords((records) => {
        const existing = records.find((record) => record.bookingId === booking.id || record.bookingId === booking.internalId);
        if (existing) {
          return records.map((record) => (record.bookingId === booking.id || record.bookingId === booking.internalId ? { ...record, status: 'Successful', method: 'Paystack Mobile Money / Manual confirmation' } : record));
        }
        return [
          { id: `PAY-${100 + records.length + 1}`, bookingId: booking.id, patient: booking.patient, method: 'Paystack Mobile Money / Manual confirmation', amount: booking.amount, status: 'Successful' },
          ...records
        ];
      });
      addActivity(`${booking.id} payment confirmed as Paid.`);
    } catch (error) {
      addErrorActivity(`Payment confirmation ${booking.id}`, error);
    }
  }

  async function assignPhlebotomist(id, phlebotomistName, phlebotomistId) {
    const booking = bookings.find((item) => item.id === id || item.internalId === id);
    if (!booking) return;

    const selectedStaff = staff.find((item) => item.id === phlebotomistId || item.name === phlebotomistName) || { id: phlebotomistId, name: phlebotomistName };
    const sampleId = booking.sampleId || buildSampleId();

    try {
      if (!LOCAL_DATA_MODE) {
        if (!selectedStaff.id) throw new Error('No backend phlebotomist ID was selected. Reload staff list or create a production phlebotomist account.');
        const assignment = await apiCreateAssignment({
          bookingId: booking.internalId || booking.id,
          phlebotomistId: selectedStaff.id,
          assignedDate: new Date().toISOString(),
          timeSlot: booking.time,
          fieldNotes: `Assigned from operations dashboard at ${nowLabel()}`
        });
        setAssignments((items) => upsertById(items, assignment));
      } else {
        setAssignments((items) => {
          const next = {
            id: `ASG-${String(items.length + 1).padStart(2, '0')}`,
            bookingId: booking.id,
            patient: booking.patient,
            location: booking.area,
            time: booking.time.replace(/^.*·\s*/, ''),
            phlebotomist: selectedStaff.name,
            phlebotomistId: selectedStaff.id,
            sampleId,
            status: 'Assigned',
            checklist: ['Identity pending', 'Consent pending', 'Sample ID generated']
          };
          const withoutExisting = items.filter((item) => item.bookingId !== id);
          return [next, ...withoutExisting];
        });
      }

      updateBooking(booking.id, { phlebotomist: selectedStaff.name, status: 'Assigned', sampleId });
      addActivity(`${booking.id} assigned to ${selectedStaff.name} with sample ${sampleId}.`);
    } catch (error) {
      addErrorActivity(`Assign ${booking.id}`, error);
    }
  }

  async function createManualBooking(payload) {
    const localId = buildBookingId(bookings);
    const areaName = payload.area || 'Kumasi Central';
    const area = serviceAreas.find((item) => item.name === areaName || item.id === payload.area);
    const localBooking = {
      id: localId,
      source: 'WhatsApp',
      patient: payload.patient || 'New WhatsApp Patient',
      phone: payload.phone || '+233',
      tests: [payload.tests || 'Manual test request'],
      lab: payload.lab || 'Let HomeLabs recommend',
      labMode: payload.lab === 'Let HomeLabs recommend' ? 'HomeLabs recommendation' : 'Manual lab routing',
      area: areaName,
      address: payload.address || 'Address pending confirmation',
      time: `${payload.date || 'Date pending'} · ${payload.time || 'Time pending'}`,
      status: 'Under Review',
      payment: payload.payment || 'Pending',
      amount: Number(payload.amount || 0),
      phlebotomist: 'Unassigned',
      priority: payload.priority || 'Operations assisted booking'
    };

    try {
      if (!LOCAL_DATA_MODE) {
        const created = await createBooking({
          source: 'whatsapp',
          patient: {
            fullName: localBooking.patient,
            phone: localBooking.phone,
            email: '',
            gender: ''
          },
          tests: [],
          customTest: payload.tests || 'Manual WhatsApp test request',
          labChoice: mapLabChoice(payload.lab),
          selectedLabId: null,
          location: {
            areaId: null,
            address: localBooking.address || areaName,
            landmark: areaName,
            facilityType: 'Home',
            gps: ''
          },
          schedule: {
            date: payload.date || '',
            timeSlot: payload.time || '',
            urgency: 'Routine'
          },
          consent: true,
          amount: Number(payload.amount || area?.fee || 0),
          paymentMethod: payload.payment === 'Institution billed' ? 'institution_billing' : 'manual'
        });
        setBookings((items) => [created, ...items]);
        addActivity(`${created.id} created from manual booking and saved to backend.`);
        return created.id;
      }

      setBookings((items) => [localBooking, ...items]);
      addActivity(`${localId} created from manual booking.`);
      return localId;
    } catch (error) {
      addErrorActivity('manual booking', error);
      return '';
    }
  }

  async function updateAssignmentStatus(id, status) {
    const assignment = assignments.find((item) => item.id === id);
    if (!assignment) return;

    try {
      if (!LOCAL_DATA_MODE) {
        await apiUpdateAssignmentStatus(id, status, `Updated from field portal at ${nowLabel()}`);
      }
      setAssignments((items) => items.map((item) => (item.id === id ? { ...item, status } : item)));
      updateBooking(assignment.bookingId, { status });
      addActivity(`${assignment.bookingId} field status updated to ${status}.`);
    } catch (error) {
      addErrorActivity(`Assignment status ${assignment.bookingId}`, error);
    }
  }

  async function handoverSample(id, status) {
    const assignment = assignments.find((item) => item.id === id);
    if (!assignment) return;

    try {
      let backendSample = null;
      if (!LOCAL_DATA_MODE && status === 'Sample Collected') {
        backendSample = await submitCollectionChecklist(id, { sampleCode: assignment.sampleId, location: assignment.location, notes: 'Collected through HomeLabs field checklist.' });
      }
      if (!LOCAL_DATA_MODE && status === 'Delivered to Lab') {
        backendSample = await submitSampleHandover(id, { destination: 'Assigned laboratory', location: assignment.location });
      }

      setAssignments((items) => items.map((item) => (item.id === id ? { ...item, status } : item)));
      updateBooking(assignment.bookingId, { status });

      if (status === 'Delivered to Lab') {
        const booking = bookings.find((item) => item.id === assignment.bookingId || item.internalId === assignment.internalBookingId);
        setLabSamples((samples) => {
          const sampleId = backendSample?.sampleCode || assignment.sampleId;
          const next = {
            id: sampleId,
            internalId: backendSample?.id,
            bookingId: assignment.bookingId,
            patient: assignment.patient,
            tests: booking?.tests || assignment.tests || ['Pending test detail'],
            lab: booking?.lab || 'HomeLabs Laboratory',
            status: !LOCAL_DATA_MODE ? 'In Transit' : 'Received',
            collectedAt: 'Just now',
            receivedAt: !LOCAL_DATA_MODE ? 'Awaiting lab receipt' : 'Just now',
            resultStatus: !LOCAL_DATA_MODE ? 'Awaiting lab receipt' : 'Awaiting processing'
          };
          return upsertById(samples, next);
        });
      }
      addActivity(`${assignment.bookingId} handover updated to ${status}.`);
    } catch (error) {
      addErrorActivity(`Sample handover ${assignment.bookingId}`, error);
    }
  }

  async function confirmSampleReceipt(sampleId) {
    const sample = labSamples.find((item) => item.id === sampleId || item.internalId === sampleId);
    try {
      let updated = null;
      if (!LOCAL_DATA_MODE) updated = await apiConfirmSampleReceipt(sample?.internalId || sampleId);
      const next = updated || { ...sample, id: sampleId, status: 'Received', receivedAt: sample?.receivedAt || 'Just now', resultStatus: 'Awaiting processing' };
      setLabSamples((samples) => upsertById(samples, { ...sample, ...next, status: updated?.status || 'Received', resultStatus: updated?.resultStatus || 'Awaiting processing' }));
      if (sample?.bookingId) updateBooking(sample.bookingId, { status: 'Delivered to Lab' });
      addActivity(`${sampleId} receipt confirmed by laboratory.`);
    } catch (error) {
      addErrorActivity(`Sample receipt ${sampleId}`, error);
    }
  }

  async function markSampleProcessing(sampleId) {
    const sample = labSamples.find((item) => item.id === sampleId || item.internalId === sampleId);
    try {
      let updated = null;
      if (!LOCAL_DATA_MODE) updated = await apiMarkSampleProcessing(sample?.internalId || sampleId);
      setLabSamples((samples) => upsertById(samples, { ...sample, ...(updated || {}), status: 'Processing', resultStatus: 'Processing' }));
      if (sample?.bookingId) updateBooking(sample.bookingId, { status: 'Lab Processing' });
      addActivity(`${sampleId} moved to lab processing.`);
    } catch (error) {
      addErrorActivity(`Lab processing ${sampleId}`, error);
    }
  }

  async function markResultReady(sampleId, releaseRule = 'Ready for release') {
    const sample = labSamples.find((item) => item.id === sampleId || item.internalId === sampleId);
    try {
      let result = null;
      if (!LOCAL_DATA_MODE) {
        result = await apiUploadResult({
          sampleId: sample?.internalId || sampleId,
          notes: `Result marked ready from dashboard. Release rule: ${releaseRule}`,
          releaseTo: releaseRuleToApi(releaseRule)
        });
      }
      setLabSamples((samples) => upsertById(samples, { ...sample, id: sampleId, status: 'Result Ready', resultStatus: releaseRule, resultId: result?.id || sample?.resultId }));
      if (sample?.bookingId) updateBooking(sample.bookingId, { status: 'Result Ready' });
      addActivity(`${sampleId} marked result ready.`);
      return result?.id || sample?.resultId;
    } catch (error) {
      addErrorActivity(`Result ready ${sampleId}`, error);
      return null;
    }
  }

  async function releaseResult(sampleId) {
    const sample = labSamples.find((item) => item.id === sampleId || item.internalId === sampleId);
    try {
      let resultId = sample?.resultId;
      if (!LOCAL_DATA_MODE) {
        if (!resultId) {
          const prepared = await apiUploadResult({ sampleId: sample?.internalId || sampleId, notes: 'Prepared for release from quick action.', releaseTo: 'PATIENT' });
          resultId = prepared.id;
        }
        await apiReleaseResult(resultId, ['patient']);
      }
      setLabSamples((samples) => upsertById(samples, { ...sample, id: sampleId, status: 'Result Released', resultStatus: 'Released', resultId }));
      if (sample?.bookingId) updateBooking(sample.bookingId, { status: 'Result Released' });
      addActivity(`${sampleId} result released through secure portal rule.`);
    } catch (error) {
      addErrorActivity(`Result release ${sampleId}`, error);
    }
  }

  async function rejectSample(sampleId, reason) {
    const sample = labSamples.find((item) => item.id === sampleId || item.internalId === sampleId);
    try {
      let updated = null;
      if (!LOCAL_DATA_MODE) updated = await apiRejectSample(sample?.internalId || sampleId, reason || 'Rejected');
      setLabSamples((samples) => upsertById(samples, { ...sample, ...(updated || {}), id: sampleId, status: 'Sample Rejected', resultStatus: reason || 'Rejected' }));
      if (sample?.bookingId) updateBooking(sample.bookingId, { status: 'Sample Rejected' });
      addActivity(`${sampleId} rejected: ${reason || 'Reason not specified'}.`);
    } catch (error) {
      addErrorActivity(`Sample rejection ${sampleId}`, error);
    }
  }

  async function loadBackendPage(collection, page) {
    if (LOCAL_DATA_MODE) return;
    const requestedPage = Math.max(Number(page || 1), 1);
    setLoadingDashboard(true);
    try {
      if (collection === 'bookings') {
        const items = await listBookings({ page: requestedPage, limit: 20 });
        setBookings(items);
      }
      if (collection === 'payments') {
        const items = await listPayments({ page: requestedPage, limit: 20 });
        setPaymentRecords(normalisePaymentRecords(items));
      }
      if (collection === 'staff') {
        const items = await listAvailablePhlebotomists({ page: requestedPage, limit: 50 });
        setStaff(items);
      }
      if (collection === 'samples') {
        const [incoming, accepted] = await Promise.all([
          listIncomingSamples({ page: requestedPage, limit: 20 }),
          listAcceptedSamples({ page: requestedPage, limit: 20 })
        ]);
        setLabSamples(mergeById(incoming, accepted));
      }
      setConnectionNotice(`Loaded ${collection} page ${requestedPage} from backend.`);
    } catch (error) {
      addErrorActivity(`Load ${collection} page ${requestedPage}`, error);
    } finally {
      setLoadingDashboard(false);
    }
  }

  async function createClinicianRequest(payload) {
    const patientName = payload.patient || 'New Patient';
    const requestedTest = payload.test || 'Clinician selected test';
    const bookingId = await createManualBooking({
      patient: patientName,
      phone: payload.phone,
      tests: requestedTest,
      lab: payload.lab,
      area: 'Patient confirmation pending',
      address: 'Patient confirmation pending',
      time: 'Patient confirmation pending',
      payment: payload.payment || 'Pending',
      amount: 0,
      priority: 'Clinician request'
    });

    if (!bookingId) return;

    const request = {
      id: bookingId,
      patient: patientName,
      tests: [requestedTest],
      clinician: 'Current clinician',
      status: 'Submitted',
      result: 'Pending',
      created: 'Just now'
    };
    setClinicianRequests((items) => [request, ...items]);
    addActivity(`${bookingId} clinician request created and sent for patient confirmation.`);
  }

  const data = useMemo(() => ({
    bookings,
    assignments,
    labSamples,
    paymentRecords,
    staff,
    clinicianRequests,
    activityLog,
    persisted: false,
    loadingDashboard,
    connection: {
      mode: 'Backend connected',
      notice: connectionNotice
    }
  }), [bookings, assignments, labSamples, paymentRecords, staff, clinicianRequests, activityLog, loadingDashboard, connectionNotice]);

  const actions = {
    advanceBooking,
    setBookingStatus,
    confirmPayment,
    assignPhlebotomist,
    createManualBooking,
    updateAssignmentStatus,
    handoverSample,
    confirmSampleReceipt,
    markSampleProcessing,
    markResultReady,
    releaseResult,
    rejectSample,
    createClinicianRequest,
    loadBackendPage,
    refreshDashboardState
  };

  function renderPortal() {
    if (role === 'patient' && activePage === 'book') {
      return (
        <BookingPage
          embedded
          initialPatient={{ fullName: user?.name || '', phone: user?.phone || '', email: user?.email || '' }}
          onTrack={() => setActivePage('bookings')}
          onBooked={() => loadBackendPage('bookings', 1)}
          onBackHome={() => setActivePage('overview')}
        />
      );
    }
    switch (role) {
      case 'admin':
        return <AdminDashboard activePage={activePage} data={data} actions={actions} />;
      case 'patient':
        return <PatientPortal activePage={activePage} data={data} />;
      case 'clinician':
        return <ClinicianPortal activePage={activePage} data={data} actions={actions} />;
      case 'phlebotomist':
        return <PhlebotomistPortal activePage={activePage} data={data} actions={actions} />;
      case 'lab':
        return <LabPortal activePage={activePage} data={data} actions={actions} />;
      case 'operations':
      default:
        return <OperationsDashboard activePage={activePage} data={data} actions={actions} />;
    }
  }

  return (
    <DashboardLayout
      role={role}
      activePage={activePage}
      onActivePageChange={setActivePage}
      onBackHome={onBackHome}
      onLogout={onLogout}
    >
      <Suspense fallback={<PortalLoader role={role} />}>
        {renderPortal()}
      </Suspense>
    </DashboardLayout>
  );
}
