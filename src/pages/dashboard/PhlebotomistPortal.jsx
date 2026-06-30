import { useState } from 'react';
import { CheckCircle2, MapPin, Navigation, Phone, Truck } from 'lucide-react';
import { Field, MiniRecord, SectionTitle, StatsGrid } from '../../components/dashboard/DashboardPrimitives.jsx';


function ConnectionStrip({ connection, loading }) {
  if (!connection) return null;
  return <div className="connection-strip"><strong>{connection.mode}</strong><span>{loading ? 'Loading backend state…' : connection.notice}</span></div>;
}

export function PhlebotomistPortal({ activePage, data, actions }) {
  const { assignments, connection, loadingDashboard } = data;
  if (activePage === 'assignment') return <Assignments assignments={assignments} actions={actions} />;
  if (activePage === 'checklist') return <Checklist assignments={assignments} actions={actions} />;
  if (activePage === 'handover') return <Handover assignments={assignments} actions={actions} />;

  return (
    <div className="dashboard-content">
      <ConnectionStrip connection={connection} loading={loadingDashboard} />
      <StatsGrid stats={[
        ['Today assignments', assignments.length],
        ['Collected', assignments.filter((item) => item.status === 'Sample Collected').length],
        ['Pending arrival', assignments.filter((item) => item.status !== 'Sample Collected').length],
        ['Exceptions', '0']
      ]} />
      <section className="dashboard-grid two-columns">
        <div className="dashboard-card">
          <SectionTitle eyebrow="Field work" title="Today’s assignments" text="Mobile-first view for addresses, contact details, prep notes and status updates. Buttons now update the operations queue." />
          <div className="record-list">{assignments.map((item) => <MiniRecord key={item.id} title={`${item.patient} · ${item.bookingId}`} meta={`${item.location} · ${item.time} · ${item.sampleId}`} status={item.status} action={<button className="secondary-button tiny" onClick={() => actions.updateAssignmentStatus(item.id, 'En Route')} type="button">Start route</button>} />)}</div>
        </div>
        <div className="dashboard-card">
          <SectionTitle eyebrow="Field checklist" title="Collection discipline" text="Every sample should be identity-confirmed, consented, labelled, sealed and handed over safely." />
          <div className="field-actions"><button className="secondary-button" type="button"><Phone size={17} /> Call patient</button><button className="secondary-button" type="button"><Navigation size={17} /> Open map</button></div>
        </div>
      </section>
    </div>
  );
}

function Assignments({ assignments, actions }) {
  return (
    <div className="dashboard-content">
      <section className="dashboard-section">
        <SectionTitle eyebrow="Assignments" title="Collection route" text="The phlebotomist sees appointment windows, sample IDs and location details." />
        <div className="assignment-mobile-grid">
          {assignments.map((item) => (
            <article className="mobile-job-card" key={item.id}>
              <div><MapPin size={24} /><strong>{item.patient}</strong><span>{item.location} · {item.time}</span></div>
              <p>{item.bookingId} · {item.sampleId}</p>
              <div className="field-actions">
                <button className="secondary-button" type="button"><Phone size={16} /> Call</button>
                <button className="primary-button" type="button" onClick={() => actions.updateAssignmentStatus(item.id, 'En Route')}><Navigation size={16} /> Start route</button>
                <button className="secondary-button" type="button" onClick={() => actions.updateAssignmentStatus(item.id, 'Arrived')}>Mark arrived</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function Checklist({ assignments, actions }) {
  const [selectedAssignment, setSelectedAssignment] = useState(assignments[0]?.id || '');
  const assignment = assignments.find((item) => item.id === selectedAssignment) || assignments[0];

  return (
    <div className="dashboard-content">
      <section className="dashboard-grid two-columns">
        <div className="dashboard-card">
          <SectionTitle eyebrow="Collection" title="Checklist preview" text="Checklist protects identity, consent, sample labelling and handover quality." />
          <Field label="Assignment"><select value={selectedAssignment} onChange={(event) => setSelectedAssignment(event.target.value)}>{assignments.map((item) => <option key={item.id} value={item.id}>{item.bookingId} · {item.patient}</option>)}</select></Field>
          <div className="checklist-box">
            {['Confirm patient identity', 'Confirm patient consent', 'Confirm fasting/prep status', 'Record sample ID', 'Seal transport box', 'Mark sample collected'].map((item, index) => <label key={item}><input type="checkbox" defaultChecked={index < 3} /> {item}</label>)}
          </div>
          <button className="primary-button full" type="button" disabled={!assignment} onClick={() => actions.handoverSample(assignment.id, 'Sample Collected')}><CheckCircle2 size={17} /> Mark sample collected</button>
        </div>
        <div className="dashboard-card">
          <SectionTitle eyebrow="Sample details" title="Collection record" text="These fields are designed for backend submission and audit logs." />
          <div className="form-grid two">
            <Field label="Sample ID"><input value={assignment?.sampleId || ''} readOnly /></Field>
            <Field label="Temperature note"><input placeholder="e.g. 2–8°C" /></Field>
            <Field label="Collection note"><textarea placeholder="Any collection note" /></Field>
            <Field label="Exception"><select><option>No exception</option><option>Patient unavailable</option><option>Wrong address</option><option>Failed collection</option></select></Field>
          </div>
        </div>
      </section>
    </div>
  );
}

function Handover({ assignments, actions }) {
  const [selectedAssignment, setSelectedAssignment] = useState(assignments[0]?.id || '');
  const [handoverStatus, setHandoverStatus] = useState('In Transit to Lab');
  const assignment = assignments.find((item) => item.id === selectedAssignment) || assignments[0];

  return (
    <div className="dashboard-content">
      <section className="dashboard-grid two-columns">
        <div className="dashboard-card">
          <SectionTitle eyebrow="Handover" title="Sample handover" text="Field staff confirms transfer to dispatch, HomeLabs lab or partner laboratory. Delivered samples appear in the lab portal." />
          <div className="form-grid two">
            <Field label="Assignment"><select value={selectedAssignment} onChange={(event) => setSelectedAssignment(event.target.value)}>{assignments.map((item) => <option key={item.id} value={item.id}>{item.bookingId} · {item.patient}</option>)}</select></Field>
            <Field label="Sample ID"><input value={assignment?.sampleId || ''} readOnly /></Field>
            <Field label="Destination"><select><option>HomeLabs Laboratory</option><option>Kumasi Diagnostics Partner Lab</option><option>Ashanti Medical Laboratory</option></select></Field>
            <Field label="Handover status"><select value={handoverStatus} onChange={(event) => setHandoverStatus(event.target.value)}><option>In Transit to Lab</option><option>Delivered to Lab</option><option>Returned to dispatch</option></select></Field>
            <Field label="Handover note"><textarea placeholder="Handover note" /></Field>
          </div>
          <button className="primary-button full" type="button" disabled={!assignment} onClick={() => actions.handoverSample(assignment.id, handoverStatus)}><Truck size={17} /> Confirm handover</button>
        </div>
        <div className="dashboard-card">
          <SectionTitle eyebrow="Audit" title="Transport audit trail" text="The backend will store timestamp, staff ID, GPS and sample condition when connected." />
          <div className="empty-panel"><Truck size={32} /><strong>Transport log placeholder</strong><span>Collection and handover events now update local dashboard state. Backend will make them permanent chain-of-custody records.</span></div>
        </div>
      </section>
    </div>
  );
}
