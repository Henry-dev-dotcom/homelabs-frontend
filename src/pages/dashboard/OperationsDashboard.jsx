import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock3, MessageCircle, Plus, Route, ShieldCheck, Truck, UserCheck } from 'lucide-react';
import { Field, MiniRecord, PaginationControls, SectionTitle, StatsGrid, StatusBadge } from '../../components/dashboard/DashboardPrimitives.jsx';
import { serviceAreas, timeSlots, partnerLabs } from '../../data/homelabsData.js';
import { getBookingProgress, getNextStatuses } from '../../workflow/bookingWorkflow.js';


function ConnectionStrip({ connection, loading }) {
  if (!connection) return null;
  return (
    <div className="connection-strip">
      <strong>{connection.mode}</strong>
      <span>{loading ? 'Loading backend state…' : connection.notice}</span>
    </div>
  );
}

export function OperationsDashboard({ activePage, data, actions }) {
  const { bookings, assignments, activityLog, staff, connection, loadingDashboard } = data;
  const underReview = bookings.filter((item) => item.status === 'Under Review').length;
  const assigned = bookings.filter((item) => item.status === 'Assigned').length;
  const whatsapp = bookings.filter((item) => item.source === 'WhatsApp').length;
  const revenue = bookings.reduce((sum, item) => sum + Number(item.amount || 0), 0).toLocaleString();

  if (activePage === 'queue') return <BookingQueue bookings={bookings} staff={staff} actions={actions} connection={data.connection} loading={data.loadingDashboard} />;
  if (activePage === 'whatsapp') return <WhatsappBooking actions={actions} />;
  if (activePage === 'assignment') return <AssignmentBoard bookings={bookings} assignments={assignments} staff={staff} actions={actions} connection={data.connection} loading={data.loadingDashboard} />;
  if (activePage === 'exceptions') return <ExceptionsPanel bookings={bookings} data={data} />;

  return (
    <div className="dashboard-content">
      <ConnectionStrip connection={connection} loading={loadingDashboard} />
      <StatsGrid stats={[
        ['New review', underReview, 'Needs operations verification'],
        ['Assigned today', assigned, 'Field work already allocated'],
        ['WhatsApp requests', whatsapp, 'Manual support bookings'],
        ['Revenue estimate', `GHS ${revenue}`, 'From current frontend state']
      ]} />
      <section className="dashboard-grid two-columns">
        <div className="dashboard-card">
          <SectionTitle eyebrow="Today" title="Operational priorities" text="The dispatcher can now update booking, payment, assignment and workflow state directly in the frontend." />
          <div className="priority-stack">
            <MiniRecord title="Clear review queue" meta="Use Confirm payment, Assign staff and Advance status in the queue." status="Live state" />
            <MiniRecord title="Create WhatsApp booking" meta="Manual bookings now appear immediately in the operations queue." status="Working" />
            <MiniRecord title="Monitor sample handover" meta="Phlebotomist handover can create lab samples for receipt confirmation." status="Connected" />
          </div>
        </div>
        <div className="dashboard-card">
          <SectionTitle eyebrow="Activity" title="Latest frontend events" text="This is a temporary local activity log before backend audit logs are connected." />
          <div className="record-list">
            {activityLog.map((item, index) => <MiniRecord key={`${item}-${index}`} title={item} status={index === 0 ? 'Latest' : 'Logged'} />)}
          </div>
        </div>
      </section>
      <BookingQueue compact bookings={bookings} staff={staff} actions={actions} />
    </div>
  );
}

function BookingQueue({ compact = false, bookings, staff = [], actions, connection, loading }) {
  const staffOptions = staff.filter((item) => String(item.role || '').toLowerCase().includes('phlebotomist'));

  return (
    <div className="dashboard-content compact-content">
      {!compact && <ConnectionStrip connection={connection} loading={loading} />}
      {!compact && <StatsGrid stats={[
        ['Total in queue', bookings.length],
        ['Paid', bookings.filter((b) => b.payment === 'Paid').length],
        ['Pending payment', bookings.filter((b) => b.payment === 'Pending').length],
        ['Institution billed', bookings.filter((b) => b.payment === 'Institution billed').length]
      ]} />}
      <section className="dashboard-section">
        <SectionTitle eyebrow="Operations" title="Booking queue" text="Verify request, payment, lab routing, location and phlebotomist assignment. Buttons now update local frontend state." />
        <div className="dashboard-table-wrap">
          <table className="dashboard-table">
            <thead><tr><th>Booking</th><th>Patient</th><th>Source</th><th>Lab</th><th>Schedule</th><th>Progress</th><th>Status</th><th>Payment</th><th>Actions</th></tr></thead>
            <tbody>
              {bookings.map((booking) => {
                const nextStatus = getNextStatuses(booking.status).find((status) => status !== 'Cancelled');
                return (
                  <tr key={booking.id}>
                    <td><strong>{booking.id}</strong><small>{booking.tests.join(', ')}</small></td>
                    <td>{booking.patient}<small>{booking.phone}</small></td>
                    <td>{booking.source}</td>
                    <td>{booking.lab}<small>{booking.labMode}</small></td>
                    <td>{booking.time}<small>{booking.area}</small></td>
                    <td><div className="progress-cell"><span style={{ width: `${getBookingProgress(booking.status)}%` }} /></div></td>
                    <td><StatusBadge status={booking.status} /></td>
                    <td><StatusBadge status={booking.payment} /></td>
                    <td>
                      <div className="table-action-stack">
                        {booking.payment !== 'Paid' && <button className="secondary-button tiny" type="button" onClick={() => actions.confirmPayment(booking.id)}><CheckCircle2 size={14} /> Confirm pay</button>}
                        {booking.phlebotomist === 'Unassigned' && (
                          <select className="compact-select" defaultValue="" onChange={(event) => { const person = staffOptions.find((item) => (item.id || item.name) === event.target.value); if (person) actions.assignPhlebotomist(booking.id, person.name, person.id); }}>
                            <option value="">Assign staff</option>
                            {staffOptions.map((person) => <option key={person.id || person.name} value={person.id || person.name}>{person.name}</option>)}
                          </select>
                        )}
                        {nextStatus && <button className="primary-button tiny" type="button" onClick={() => actions.advanceBooking(booking.id)}>Advance to {nextStatus}</button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!compact && <PaginationControls meta={bookings.pagination} label="bookings" onPageChange={(page) => actions.loadBackendPage('bookings', page)} />}
      </section>
    </div>
  );
}

function WhatsappBooking({ actions }) {
  const [form, setForm] = useState({
    patient: '',
    phone: '',
    tests: '',
    lab: 'Let HomeLabs recommend',
    area: 'Kumasi Central',
    address: '',
    date: '',
    time: '7:00 AM – 9:00 AM',
    payment: 'Pending',
    amount: 0,
    priority: 'WhatsApp assisted booking'
  });
  const [createdId, setCreatedId] = useState('');

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit() {
    const id = await actions.createManualBooking(form);
    setCreatedId(id);
    setForm((current) => ({ ...current, patient: '', phone: '', tests: '', address: '', amount: 0 }));
  }

  return (
    <div className="dashboard-content">
      <section className="dashboard-grid two-columns">
        <div className="dashboard-card">
          <SectionTitle eyebrow="Manual entry" title="WhatsApp-assisted booking" text="Support staff creates this after collecting patient details through WhatsApp or phone. Created bookings enter the live queue immediately." />
          {createdId && <div className="success-inline"><CheckCircle2 size={18} /> Created {createdId}. Go to Booking Queue to verify and assign.</div>}
          <div className="form-grid two">
            <Field label="Patient name"><input value={form.patient} onChange={(event) => update('patient', event.target.value)} placeholder="Patient full name" /></Field>
            <Field label="Phone"><input value={form.phone} onChange={(event) => update('phone', event.target.value)} placeholder="+233..." /></Field>
            <Field label="Requested tests"><input value={form.tests} onChange={(event) => update('tests', event.target.value)} placeholder="Type tests or request details" /></Field>
            <Field label="Lab routing"><select value={form.lab} onChange={(event) => update('lab', event.target.value)}><option>Let HomeLabs recommend</option>{partnerLabs.map((lab) => <option key={lab.id}>{lab.name}</option>)}</select></Field>
            <Field label="Area"><select value={form.area} onChange={(event) => update('area', event.target.value)}>{serviceAreas.map((area) => <option key={area.id}>{area.name}</option>)}</select></Field>
            <Field label="Address / landmark"><input value={form.address} onChange={(event) => update('address', event.target.value)} placeholder="House number, landmark or GPS" /></Field>
            <Field label="Preferred date"><input value={form.date} onChange={(event) => update('date', event.target.value)} type="date" /></Field>
            <Field label="Time slot"><select value={form.time} onChange={(event) => update('time', event.target.value)}>{timeSlots.map((slot) => <option key={slot}>{slot}</option>)}</select></Field>
            <Field label="Payment status"><select value={form.payment} onChange={(event) => update('payment', event.target.value)}><option>Pending</option><option>Paid</option><option>Pay on confirmation</option><option>Institution billed</option></select></Field>
            <Field label="Amount"><input value={form.amount} onChange={(event) => update('amount', event.target.value)} placeholder="GHS" type="number" /></Field>
          </div>
          <button className="primary-button full" type="button" onClick={submit}><Plus size={17} /> Create manual booking</button>
        </div>
        <div className="dashboard-card">
          <SectionTitle eyebrow="Support script" title="WhatsApp information checklist" text="The support agent should collect these before creating the request." />
          <div className="support-script">
            <MessageCircle size={30} />
            <ol>
              <li>Full name, phone and email.</li>
              <li>Test name or doctor request form.</li>
              <li>Preferred lab or HomeLabs recommendation.</li>
              <li>Kumasi area, address and landmark.</li>
              <li>Preferred collection date and time slot.</li>
              <li>Payment method and consent confirmation.</li>
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
}

function AssignmentBoard({ bookings, assignments, staff = [], actions, connection, loading }) {
  const unassigned = bookings.filter((booking) => booking.phlebotomist === 'Unassigned');

  return (
    <div className="dashboard-content">
      <ConnectionStrip connection={connection} loading={loading} />
      <StatsGrid stats={[["Available staff", staff.filter((item) => String(item.role || '').toLowerCase().includes('phlebotomist')).length || '—'], ['Collections today', assignments.length], ['Unassigned', unassigned.length], ['Priority zone', 'Kumasi Central']]} />
      <section className="dashboard-grid two-columns">
        <div className="dashboard-card">
          <SectionTitle eyebrow="Dispatch" title="Assignment board" text="Assign certified phlebotomists by zone, availability and appointment time." />
          <div className="assignment-list">
            {assignments.map((assignment) => (
              <MiniRecord
                key={assignment.id}
                title={`${assignment.patient} · ${assignment.bookingId}`}
                meta={`${assignment.location} · ${assignment.time}`}
                status={assignment.status}
                footer={`Assigned to ${assignment.phlebotomist}`}
                action={<button className="secondary-button tiny" type="button" onClick={() => actions.updateAssignmentStatus(assignment.id, 'En Route')}><Truck size={14} /> En route</button>}
              />
            ))}
          </div>
        </div>
        <div className="dashboard-card">
          <SectionTitle eyebrow="Unassigned" title="Quick assignment" text="Bookings from the queue can be assigned here too." />
          <div className="record-list">
            {unassigned.length === 0 && <div className="empty-panel"><UserCheck size={28} /><strong>All current bookings have staff assignments.</strong></div>}
            {unassigned.map((booking) => (
              <MiniRecord
                key={booking.id}
                title={`${booking.patient} · ${booking.id}`}
                meta={`${booking.area} · ${booking.time}`}
                status={booking.status}
                action={<button className="primary-button tiny" type="button" onClick={() => { const person = staff.find((item) => String(item.role || '').toLowerCase().includes('phlebotomist')) || { name: 'first available phlebotomist' }; actions.assignPhlebotomist(booking.id, person.name, person.id); }}>Assign first available</button>}
              />
            ))}
          </div>
          <div className="route-card"><Route size={46} /><strong>Route planning</strong><span>Map routing can be connected to a production mapping provider.</span></div>
        </div>
      </section>
    </div>
  );
}

function ExceptionsPanel({ bookings, data }) {
  const paymentIssues = bookings.filter((item) => item.payment === 'Pending');
  const rejectedSamples = data.labSamples.filter((sample) => sample.status === 'Sample Rejected');
  const failedCollections = bookings.filter((item) => item.status === 'Failed Collection');

  return (
    <div className="dashboard-content">
      <ConnectionStrip connection={data.connection} loading={data.loadingDashboard} />
      <StatsGrid stats={[["Critical", rejectedSamples.length], ['Payment issue', paymentIssues.length], ['Failed collection', failedCollections.length], ['Lab delay', '0']]} />
      <section className="dashboard-section">
        <SectionTitle eyebrow="Exception handling" title="Issues requiring attention" text="Failed collections, payment issues, rejected samples and lab delays land here as dashboard actions are used." />
        <div className="exception-grid">
          {paymentIssues.map((booking) => <MiniRecord key={booking.id} title="Pending payment confirmation" meta={`${booking.id} · ${booking.patient} · ${booking.phone}`} status="Pending" />)}
          {rejectedSamples.map((sample) => <MiniRecord key={sample.id} title="Sample rejected" meta={`${sample.id} · ${sample.patient} · ${sample.resultStatus}`} status="Sample Rejected" />)}
          {paymentIssues.length === 0 && rejectedSamples.length === 0 && <div className="empty-panel"><ShieldCheck size={28} /><strong>No active payment or sample exceptions.</strong><span>Issues will appear here when triggered from payment, collection or lab workflows.</span></div>}
          <div className="empty-panel"><Clock3 size={28} /><strong>No delayed result yet.</strong><span>Lab turnaround exceptions will appear here when expected TAT is exceeded.</span></div>
          <div className="empty-panel"><AlertTriangle size={28} /><strong>Exception workflow</strong><span>Backend events make exceptions persistent and auditable.</span></div>
        </div>
      </section>
    </div>
  );
}
