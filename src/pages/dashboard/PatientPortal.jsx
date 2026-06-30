import { CalendarClock, Download, FileText, MapPin, UserRound } from 'lucide-react';
import { Field, MiniRecord, SectionTitle, StatsGrid, Timeline } from '../../components/dashboard/DashboardPrimitives.jsx';
import { buildTimeline, getBookingProgress } from '../../workflow/bookingWorkflow.js';

export function PatientPortal({ activePage, data }) {
  const { bookings } = data;
  const selectedBooking = bookings[0];
  if (activePage === 'bookings') return <PatientBookings bookings={bookings} />;
  if (activePage === 'details') return <PatientBookingDetails selectedBooking={selectedBooking} />;
  if (activePage === 'results') return <PatientResults />;
  if (activePage === 'profile') return <PatientProfile selectedBooking={selectedBooking} />;

  return (
    <div className="dashboard-content">
      <StatsGrid stats={[
        ['Upcoming visit', '1', 'Next confirmed collection'],
        ['Results ready', '1', 'Available for download'],
        ['Paid bookings', '2', 'Confirmed through Paystack/manual'],
        ['Preferred city', 'Kumasi', 'Launch area']
      ]} />
      <section className="dashboard-grid two-columns">
        <div className="dashboard-card">
          <SectionTitle eyebrow="Next visit" title="Your upcoming HomeLabs collection" text="Track the appointment, collection status, payment and lab routing from one screen." />
          <MiniRecord title={`${selectedBooking.id} · ${selectedBooking.tests.join(', ')}`} meta={`${selectedBooking.time} · ${selectedBooking.area}`} status={selectedBooking.status} footer={`${selectedBooking.lab} · ${selectedBooking.payment}`} />
          <div className="progress-summary">
            <span>Booking progress</span>
            <strong>{getBookingProgress(selectedBooking.status)}%</strong>
            <div className="progress-cell large"><span style={{ width: `${getBookingProgress(selectedBooking.status)}%` }} /></div>
          </div>
        </div>
        <div className="dashboard-card">
          <SectionTitle eyebrow="Preparation" title="Before your phlebotomist arrives" text="The system will show test-specific instructions when backend data is connected." />
          <div className="patient-prep-grid">
            <span><CalendarClock size={18} /> Keep your appointment window free.</span>
            <span><FileText size={18} /> Keep your lab request form ready if uploaded manually.</span>
            <span><MapPin size={18} /> Make sure your landmark is easy to identify.</span>
          </div>
        </div>
      </section>
    </div>
  );
}

function PatientBookings({ bookings }) {
  return (
    <div className="dashboard-content">
      <section className="dashboard-section">
        <SectionTitle eyebrow="Patient" title="My bookings" text="Patients track collection status, lab routing, payment and results." />
        <div className="record-list">{bookings.slice(0, 4).map((booking) => <MiniRecord key={booking.id} title={`${booking.id} · ${booking.tests[0]}`} meta={`${booking.time} · ${booking.lab}`} status={booking.status} footer={`${booking.area} · ${booking.payment}`} />)}</div>
      </section>
    </div>
  );
}

function PatientBookingDetails({ selectedBooking }) {
  return (
    <div className="dashboard-content">
      <section className="dashboard-grid two-columns">
        <div className="dashboard-card">
          <SectionTitle eyebrow="Booking details" title={`${selectedBooking.id} status timeline`} text="This timeline mirrors the end-to-end collection, lab processing and result release workflow." />
          <Timeline items={buildTimeline(selectedBooking.status).slice(0, 9)} />
        </div>
        <div className="dashboard-card">
          <SectionTitle eyebrow="Collection" title="Appointment and lab routing" text="Patient-facing details for the current booking." />
          <div className="detail-grid">
            <span>Patient</span><strong>{selectedBooking.patient}</strong>
            <span>Phone</span><strong>{selectedBooking.phone}</strong>
            <span>Address</span><strong>{selectedBooking.address}</strong>
            <span>Lab</span><strong>{selectedBooking.lab}</strong>
            <span>Payment</span><strong>{selectedBooking.payment}</strong>
            <span>Phlebotomist</span><strong>{selectedBooking.phlebotomist}</strong>
          </div>
        </div>
      </section>
    </div>
  );
}

function PatientResults() {
  return (
    <div className="dashboard-content">
      <section className="dashboard-grid two-columns">
        <div className="dashboard-card">
          <SectionTitle eyebrow="Results" title="Released result documents" text="Direct patient-requested tests can be released to the patient portal." />
          <MiniRecord title="Pregnancy Test Result" meta="HomeLabs Laboratory · Released yesterday" status="Ready to download" />
          <MiniRecord title="Full Blood Count" meta="HomeLabs Laboratory · Awaiting admin release" status="Pending" />
          <button className="primary-button full" type="button"><Download size={17} /> Download result PDF</button>
        </div>
        <div className="dashboard-card">
          <SectionTitle eyebrow="Access rule" title="Why some results may not appear immediately" text="Clinician-requested tests may be routed to the clinician first, while patient-requested tests can be released directly to the patient." />
          <div className="empty-panel"><FileText size={32} /><strong>Secure result delivery placeholder</strong><span>Backend integration will add encrypted file links, audit logs and download history.</span></div>
        </div>
      </section>
    </div>
  );
}

function PatientProfile({ selectedBooking }) {
  return (
    <div className="dashboard-content">
      <section className="dashboard-card">
        <SectionTitle eyebrow="Profile" title="Patient details" text="Patients can update contact details and default collection address." />
        <div className="form-grid two">
          <Field label="Full name"><input defaultValue={selectedBooking?.patient || "Ama Serwaa"} /></Field>
          <Field label="Phone"><input defaultValue={selectedBooking?.phone || "+233 24 000 1122"} /></Field>
          <Field label="Email"><input defaultValue="ama@example.com" /></Field>
          <Field label="Default area"><input defaultValue={selectedBooking?.area || "Kumasi Central"} /></Field>
          <Field label="Default address"><textarea defaultValue={selectedBooking?.address || "Adum, near post office"} /></Field>
          <Field label="Notification preference"><select><option>WhatsApp + SMS</option><option>Email only</option><option>SMS only</option></select></Field>
        </div>
        <button className="primary-button full" type="button"><UserRound size={17} /> Save profile</button>
      </section>
    </div>
  );
}
