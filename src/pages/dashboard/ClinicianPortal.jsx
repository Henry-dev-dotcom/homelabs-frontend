import { FileText, Plus, Send, Stethoscope } from 'lucide-react';
import { Field, MiniRecord, SectionTitle, StatsGrid, StatusBadge } from '../../components/dashboard/DashboardPrimitives.jsx';
import { partnerLabs, tests } from '../../data/homelabsData.js';

export function ClinicianPortal({ activePage, data, actions }) {
  const { clinicianRequests } = data;
  if (activePage === 'new') return <NewRequest actions={actions} />;
  if (activePage === 'active') return <ActiveRequests clinicianRequests={clinicianRequests} />;
  if (activePage === 'completed') return <CompletedRequests clinicianRequests={clinicianRequests} />;
  if (activePage === 'results') return <ResultsInbox clinicianRequests={clinicianRequests} />;

  return (
    <div className="dashboard-content">
      <StatsGrid stats={[
        ['Active requests', clinicianRequests.filter((r) => r.status !== 'Completed').length],
        ['Results ready', clinicianRequests.filter((r) => r.result === 'Ready').length],
        ['Patients', '18'],
        ['Missed follow-up', '0 today']
      ]} />
      <section className="dashboard-grid two-columns">
        <div className="dashboard-card">
          <SectionTitle eyebrow="Clinician workflow" title="Your orders, followed through" text="Clinicians can create patient requests, track collection and receive results without chasing patients." />
          <div className="record-list">{clinicianRequests.map((request) => <MiniRecord key={request.id} title={`${request.patient} · ${request.id}`} meta={`${request.tests.join(', ')} · ${request.created}`} status={request.status} />)}</div>
        </div>
        <div className="dashboard-card">
          <SectionTitle eyebrow="Use cases" title="Best fit clinical scenarios" text="HomeLabs supports post-discharge, chronic care and routine follow-up testing." />
          <div className="tag-cloud"><span>Post-discharge</span><span>Chronic care</span><span>Diabetes monitoring</span><span>Hypertension follow-up</span><span>Corporate care</span></div>
        </div>
      </section>
    </div>
  );
}

function NewRequest({ actions }) {
  const submitRequest = () => actions.createClinicianRequest({ patient: document.querySelector('[data-clinician-patient]')?.value, phone: document.querySelector('[data-clinician-phone]')?.value, test: document.querySelector('[data-clinician-test]')?.value, lab: document.querySelector('[data-clinician-lab]')?.value, payment: document.querySelector('[data-clinician-payment]')?.value });
  return (
    <div className="dashboard-content">
      <section className="dashboard-grid two-columns">
        <div className="dashboard-card">
          <SectionTitle eyebrow="Clinician request" title="Create patient lab request" text="This adapts the SUNKWA doctor order workflow for HomeLabs collection." />
          <div className="form-grid two">
            <Field label="Patient name"><input data-clinician-patient placeholder="Search or add patient" /></Field>
            <Field label="Patient phone"><input data-clinician-phone placeholder="+233..." /></Field>
            <Field label="Tests"><select data-clinician-test>{tests.map((test) => <option key={test.id}>{test.name}</option>)}</select></Field>
            <Field label="Lab routing"><select data-clinician-lab><option>Let HomeLabs recommend</option>{partnerLabs.map((lab) => <option key={lab.id}>{lab.name}</option>)}</select></Field>
            <Field label="Who pays?"><select data-clinician-payment><option>Patient pays</option><option>Clinician pays</option><option>Hospital / clinic billed</option></select></Field>
            <Field label="Result release"><select><option>Clinician first</option><option>Clinician and patient</option><option>Admin review first</option></select></Field>
            <Field label="Clinical notes"><textarea placeholder="Brief clinical notes or diagnosis" /></Field>
            <Field label="Upload request"><input type="file" /></Field>
          </div>
          <button className="primary-button full" type="button" onClick={submitRequest}><Send size={17} /> Send patient confirmation link</button>
        </div>
        <div className="dashboard-card">
          <SectionTitle eyebrow="Patient confirmation" title="What the patient receives" text="The patient confirms address, time, consent and payment before operations assigns the phlebotomist." />
          <div className="message-preview">
            <strong>Hello from HomeLabs.</strong>
            <p>Your clinician has requested a lab collection. Please confirm your Kumasi address, preferred time and payment so a certified phlebotomist can be scheduled.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function ActiveRequests({ clinicianRequests }) {
  return (
    <div className="dashboard-content">
      <section className="dashboard-section">
        <SectionTitle eyebrow="Tracking" title="Active requests" text="Clinicians can follow collection, lab processing and result release." />
        <div className="dashboard-table-wrap">
          <table className="dashboard-table">
            <thead><tr><th>Request</th><th>Patient</th><th>Tests</th><th>Status</th><th>Result</th></tr></thead>
            <tbody>{clinicianRequests.filter((r) => r.status !== 'Completed').map((request) => <tr key={request.id}><td><strong>{request.id}</strong><small>{request.created}</small></td><td>{request.patient}</td><td>{request.tests.join(', ')}</td><td><StatusBadge status={request.status} /></td><td><StatusBadge status={request.result} /></td></tr>)}</tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function CompletedRequests({ clinicianRequests }) {
  return (
    <div className="dashboard-content">
      <section className="dashboard-section">
        <SectionTitle eyebrow="Completed" title="Completed patient requests" text="Closed clinician requests appear here for review and audit." />
        <div className="record-list">{clinicianRequests.filter((r) => r.status === 'Completed').map((request) => <MiniRecord key={request.id} title={`${request.patient} · ${request.id}`} meta={`${request.tests.join(', ')} · ${request.created}`} status={request.result} />)}</div>
      </section>
    </div>
  );
}

function ResultsInbox({ clinicianRequests }) {
  return (
    <div className="dashboard-content">
      <section className="dashboard-grid two-columns">
        <div className="dashboard-card">
          <SectionTitle eyebrow="Results" title="Clinician results inbox" text="Clinician-requested results are routed here first by default." />
          <div className="empty-panel"><FileText size={32} /><strong>No result selected</strong><span>Clinician-requested results will appear here after laboratory release.</span></div>
          <button className="primary-button full" type="button"><FileText size={17} /> Open selected result</button>
        </div>
        <div className="dashboard-card">
          <SectionTitle eyebrow="Patient trends" title="Patient result history" text="Charts can be added for chronic care monitoring and patient trends after production result history is available." />
          <div className="empty-panel"><Stethoscope size={32} /><strong>Trend viewer</strong><span>HbA1c, renal function and lipid profile trends can be displayed when backend data is available.</span></div>
        </div>
      </section>
    </div>
  );
}
