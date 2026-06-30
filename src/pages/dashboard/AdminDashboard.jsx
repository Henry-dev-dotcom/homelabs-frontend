import { AlertTriangle, CheckCircle2, ClipboardCheck, Database, MonitorSmartphone, Plus, RefreshCcw, Settings, ShieldCheck } from 'lucide-react';
import { Field, MiniRecord, SectionTitle, StatsGrid, StatusBadge } from '../../components/dashboard/DashboardPrimitives.jsx';
import { partnerLabs, serviceAreas, testCategories, tests } from '../../data/homelabsData.js';

export function AdminDashboard({ activePage, data, actions }) {
  const { bookings, paymentRecords, staff } = data;
  if (activePage === 'users') return <UsersAndStaff staff={staff} />;
  if (activePage === 'tests') return <TestCatalog />;
  if (activePage === 'labs') return <LabsAndPartners />;
  if (activePage === 'payments') return <Payments paymentRecords={paymentRecords} />;
  if (activePage === 'qa') return <QaCenter data={data} actions={actions} />;
  if (activePage === 'integration') return <IntegrationReadiness />;
  if (activePage === 'settings') return <SettingsPage />;

  return (
    <div className="dashboard-content">
      <StatsGrid stats={[
        ['Total bookings', bookings.length, 'Current mock queue'],
        ['Active staff', staff.length, 'Internal users configured'],
        ['Partner labs', partnerLabs.length - 1, 'Excluding HomeLabs lab'],
        ['Tests configured', tests.length, 'Dynamic catalog items']
      ]} />
      <section className="dashboard-grid two-columns">
        <div className="dashboard-card">
          <SectionTitle eyebrow="Admin" title="Control centre summary" text="Admin manages the product configuration that powers booking, dispatch, sample routing and result release." />
          <div className="admin-matrix">
            <MiniRecord title="Kumasi launch area" meta={`${serviceAreas.length} zones configured with collection fees`} status="Active" />
            <MiniRecord title="Hybrid lab model" meta="HomeLabs Laboratory + partner laboratory routing" status="Active" />
            <MiniRecord title="Paystack payments" meta="Mobile money and card checkout placeholder prepared" status="Pending" />
          </div>
        </div>
        <div className="dashboard-card">
          <SectionTitle eyebrow="Governance" title="Result release rules" text="Direct patient requests can go to patients. Clinician requests can route to clinicians first." />
          <div className="policy-list">
            <span><ShieldCheck size={18} /> Patient-requested results can be released directly to patient.</span>
            <span><ShieldCheck size={18} /> Clinician-requested results go to clinician inbox by default.</span>
            <span><ShieldCheck size={18} /> Sensitive results can require admin or clinician review.</span>
          </div>
        </div>
      </section>
    </div>
  );
}

function UsersAndStaff({ staff }) {
  return (
    <div className="dashboard-content">
      <StatsGrid stats={[['Staff users', staff.length], ['Clinicians', '12'], ['Patients', '86'], ['Lab users', '4']]} />
      <section className="dashboard-grid two-columns">
        <div className="dashboard-card">
          <SectionTitle eyebrow="Users" title="Users and staff" text="Manage internal staff, lab users, clinicians and patients." />
          <div className="record-list">{staff.map((item) => <MiniRecord key={item.id} title={item.name} meta={`${item.role} · ${item.zone}`} status={item.status} />)}</div>
        </div>
        <div className="dashboard-card">
          <SectionTitle eyebrow="Create user" title="Add staff member" text="This form is API-ready for the backend user-management endpoint." />
          <div className="form-grid two">
            <Field label="Full name"><input placeholder="Staff full name" /></Field>
            <Field label="Email"><input placeholder="staff@homelabs.gh" /></Field>
            <Field label="Role"><select><option>Certified Phlebotomist</option><option>Operations Dispatcher</option><option>Lab Scientist</option><option>Customer Support</option><option>Finance Staff</option></select></Field>
            <Field label="Zone"><input placeholder="Kumasi Central" /></Field>
          </div>
          <button className="primary-button full" type="button"><Plus size={17} /> Add staff</button>
        </div>
      </section>
    </div>
  );
}

function TestCatalog() {
  return (
    <div className="dashboard-content">
      <StatsGrid stats={[['Catalog tests', tests.length], ['Categories', testCategories.length], ['Fasting tests', tests.filter((test) => test.fasting).length], ['Custom review', 'Enabled']]} />
      <section className="dashboard-grid two-columns">
        <div className="dashboard-card">
          <SectionTitle eyebrow="Catalog" title="Test catalog preview" text="Dynamic catalog keeps all Ghana laboratory tests manageable without hardcoding every item." />
          <div className="dashboard-table-wrap compact-table">
            <table className="dashboard-table">
              <thead><tr><th>Test</th><th>Category</th><th>Sample</th><th>Price</th></tr></thead>
              <tbody>{tests.map((test) => <tr key={test.id}><td><strong>{test.name}</strong><small>{test.turnaround}</small></td><td>{test.category}</td><td>{test.sample}</td><td>GHS {test.price}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
        <div className="dashboard-card">
          <SectionTitle eyebrow="New test" title="Add or edit catalog item" text="HomeLabs can keep adding Ghana lab tests without code changes." />
          <div className="form-grid two">
            <Field label="Test name"><input placeholder="e.g. Electrolytes" /></Field>
            <Field label="Category"><select>{testCategories.map((category) => <option key={category}>{category}</option>)}</select></Field>
            <Field label="Sample type"><input placeholder="Blood / Urine / Stool" /></Field>
            <Field label="Price"><input placeholder="GHS" type="number" /></Field>
            <Field label="Turnaround"><input placeholder="24 hours" /></Field>
            <Field label="Fasting"><select><option>No fasting</option><option>Fasting required</option></select></Field>
          </div>
          <button className="primary-button full" type="button"><Plus size={17} /> Save test</button>
        </div>
      </section>
    </div>
  );
}

function LabsAndPartners() {
  return (
    <div className="dashboard-content">
      <StatsGrid stats={[['HomeLabs lab', '1'], ['Partner labs', partnerLabs.length - 1], ['Recommended rules', 'Ready'], ['Launch city', 'Kumasi']]} />
      <section className="dashboard-grid two-columns">
        <div className="dashboard-card">
          <SectionTitle eyebrow="Partners" title="Labs and service routing" text="HomeLabs lab and partner labs can be active, inactive or recommended by rules." />
          <div className="record-list">{partnerLabs.map((lab) => <MiniRecord key={lab.id} title={lab.name} meta={`${lab.type} · ${lab.location} · ${lab.turnaround}`} status={lab.recommended ? 'Recommended' : 'Active'} />)}</div>
        </div>
        <div className="dashboard-card">
          <SectionTitle eyebrow="Service areas" title="Kumasi zone setup" text="Each zone can carry a different collection fee and staff coverage rule." />
          <div className="zone-grid">{serviceAreas.map((area) => <div key={area.id}><strong>{area.name}</strong><span>GHS {area.fee}</span><StatusBadge status={area.active ? 'Active' : 'Inactive'} /></div>)}</div>
        </div>
      </section>
    </div>
  );
}

function Payments({ paymentRecords }) {
  return (
    <div className="dashboard-content">
      <StatsGrid stats={[['Payment records', paymentRecords.length], ['Successful', paymentRecords.filter((p) => p.status === 'Successful').length], ['Pending', paymentRecords.filter((p) => p.status === 'Pending').length], ['Gateway', 'Paystack']]} />
      <section className="dashboard-section">
        <SectionTitle eyebrow="Finance" title="Paystack payment monitor" text="Frontend is prepared for mobile money payment status and manual confirmation." />
        <div className="record-list">{paymentRecords.map((payment) => <MiniRecord key={payment.id} title={`${payment.patient} · GHS ${payment.amount}`} meta={`${payment.bookingId} · ${payment.method}`} status={payment.status} />)}</div>
      </section>
    </div>
  );
}


function QaCenter({ data, actions }) {
  const { bookings, assignments, labSamples, paymentRecords, activityLog, connection, loadingDashboard } = data;
  const qaChecks = [
    ['Public website', 'Hero, service explanation, audience sections, FAQ, contact and WhatsApp CTAs are present.', 'Passed'],
    ['Patient booking', 'Required-step validation, prescription upload UI, lab routing and Paystack method selection are working.', 'Passed'],
    ['Tracking', 'Latest website-created booking is saved locally and can be tracked from the public Track Booking page.', 'Passed'],
    ['Operations workflow', 'Payment confirmation, status progression, assignment and WhatsApp/manual booking actions update live state.', 'Passed'],
    ['Phlebotomist workflow', 'Route start, arrival, sample collection and lab handover actions are connected to booking status.', 'Passed'],
    ['Laboratory workflow', 'Sample receipt, processing, result readiness, release and rejection actions are connected.', 'Passed'],
    ['Role layout', 'Patient, clinician, operations, phlebotomist, laboratory and admin portals use role-specific navigation.', 'Passed'],
    ['Mobile readiness', 'Booking, dashboard cards, tables, role menus and action stacks have responsive layouts.', 'Ready for browser review'],
    ['Backend action connection', 'Dashboard actions now call backend APIs in connected mode for operations, field and lab workflows.', 'Connected'],
    ['Phase 11 QA', 'Full workflow test script now covers booking, tracking, payment, login and QA summary.', 'Added']
  ];

  const workflowTests = [
    ['1', 'Create a website booking', 'Book a Home Lab Visit → complete all six steps → submit. Use the generated HLB ID on Track Booking.'],
    ['2', 'Create a WhatsApp booking', 'Operations → WhatsApp Booking → create a manual request and confirm it appears in the queue.'],
    ['3', 'Confirm payment', 'Operations → Booking Queue → use Confirm Paystack Payment on a pending payment.'],
    ['4', 'Assign field staff', 'Operations → Assignment Board → assign Nana or use queue assignment controls.'],
    ['5', 'Move field workflow', 'Phlebotomist portal → start route, mark arrival, collect sample, hand over to lab.'],
    ['6', 'Process sample', 'Lab portal → confirm receipt, move to processing, mark result ready and release result.'],
    ['7', 'Check result delivery', 'Patient/Clinician portals → verify result-ready and released records appear in the correct inboxes.'],
    ['8', 'Reset the demo', 'Use the Reset Demo State button below before handing the package to the client for another review.']
  ];

  return (
    <div className="dashboard-content">
      <StatsGrid stats={[
        ['Bookings in demo', bookings.length, 'Live state queue'],
        ['Assignments', assignments.length, 'Field jobs'],
        ['Lab samples', labSamples.length, 'Sample workflow records'],
        ['Payments', paymentRecords.length, 'Paystack/manual records']
      ]} />

      <section className="dashboard-grid two-columns">
        <div className="dashboard-card">
          <SectionTitle eyebrow="Phase 11" title="Full workflow QA center" text="Use this page with the backend smoke-test script to test booking, payment, assignment, collection, lab processing and result release." />
          <div className="qa-status-grid">
            {qaChecks.map(([title, detail, status]) => (
              <article key={title} className="qa-status-card">
                <CheckCircle2 size={20} />
                <div>
                  <strong>{title}</strong>
                  <span>{detail}</span>
                </div>
                <StatusBadge status={status} />
              </article>
            ))}
          </div>
        </div>

        <div className="dashboard-card">
          <SectionTitle eyebrow="Review script" title="End-to-end operational workflow" text="Run these steps after opening both frontend and backend locally to confirm the full HomeLabs workflow." />
          <div className="qa-script-list">
            {workflowTests.map(([number, title, detail]) => (
              <article key={number}>
                <strong>{number}</strong>
                <div>
                  <span>{title}</span>
                  <small>{detail}</small>
                </div>
              </article>
            ))}
          </div>
          <div className="qa-action-panel">
            <button className="secondary-button full" type="button" onClick={actions.resetDemoState}><RefreshCcw size={17} /> Reset demo state</button>
            <small>Use this when you want to clear workflow changes saved during testing and return to the clean baseline.</small>
          </div>
        </div>
      </section>

      <section className="dashboard-grid two-columns">
        <div className="dashboard-card">
          <SectionTitle eyebrow="Connected QA" title="Backend connection status" text="This helps the team know whether they are testing mock/demo mode or live backend-connected mode." />
          <div className="record-list">
            <MiniRecord title="Current frontend mode" meta={connection?.notice || 'Connection notice unavailable'} status={connection?.mode || 'Unknown'} />
            <MiniRecord title="Dashboard loading" meta={loadingDashboard ? 'Backend dashboard data is loading' : 'No active dashboard load in progress'} status={loadingDashboard ? 'Working' : 'Ready'} />
            <MiniRecord title="Backend QA endpoint" meta="GET /api/qa/workflow-summary after admin login" status="Added" />
            <MiniRecord title="Smoke test script" meta="Run npm run smoke:test from the backend folder after migration and seed" status="Added" />
          </div>
        </div>

        <div className="dashboard-card">
          <SectionTitle eyebrow="Command check" title="Phase 11 smoke test commands" text="Use these commands after installing dependencies, migrating Prisma and seeding demo records." />
          <div className="api-map-grid single-column">
            <article className="api-map-card"><strong>Backend syntax</strong><span>Validates JavaScript files without touching the database.</span><code>npm run check</code></article>
            <article className="api-map-card"><strong>Backend workflow smoke test</strong><span>Tests health, booking options, public booking, tracking, Paystack placeholder, login and QA summary.</span><code>npm run smoke:test</code></article>
            <article className="api-map-card"><strong>Frontend build</strong><span>Confirms the React frontend compiles before deployment.</span><code>npm run build</code></article>
          </div>
        </div>
      </section>

      <section className="dashboard-grid two-columns">
        <div className="dashboard-card">
          <SectionTitle eyebrow="Responsiveness" title="Mobile and tablet checks" text="These checks are focused on patients and field workers who will use phones frequently." />
          <div className="device-check-grid">
            <MiniRecord title="Phone booking flow" meta="Step sidebar collapses, cards stack, action buttons become full-width." status="Ready" />
            <MiniRecord title="Tablet dashboard" meta="Sidebar becomes full-width top navigation and tables keep horizontal scrolling." status="Ready" />
            <MiniRecord title="Phlebotomist portal" meta="Assignment cards, checklist and handover controls are mobile-first." status="Ready" />
            <MiniRecord title="Large desktop" meta="Public landing page and dashboards preserve maximum width and readable spacing." status="Ready" />
          </div>
        </div>

        <div className="dashboard-card">
          <SectionTitle eyebrow="Audit" title="Recent frontend activity" text="Live state actions write to this activity list. Backend audit logs will replace this later." />
          <div className="activity-log-list">
            {activityLog.map((item, index) => (
              <article key={`${item}-${index}`}>
                {index === 0 ? <Database size={18} /> : <ClipboardCheck size={18} />}
                <span>{item}</span>
              </article>
            ))}
          </div>
          <div className="qa-note-card">
            <MonitorSmartphone size={22} />
            <span>Phase 11 adds backend QA support. Next technical stage: production hardening for notifications, secure result storage, Paystack webhook verification and deployment configuration.</span>
          </div>
        </div>
      </section>

      <section className="dashboard-card">
        <SectionTitle eyebrow="Known limits" title="What still needs production hardening" text="These are expected until the deployment and security hardening stage." />
        <div className="known-limit-grid">
          {[
            'Paystack real charges require live Paystack keys and webhook configuration.',
            'Result and prescription uploads need final production storage rules.',
            'Frontend still supports mock/demo mode for client presentations.',
            'SMS, email and WhatsApp notification providers still need real gateway credentials.',
            'Role permissions exist, but final security testing must be done after deployment.',
            'Encrypted result storage and long-term backup policies still need production setup.'
          ].map((item) => (
            <span key={item}><AlertTriangle size={17} /> {item}</span>
          ))}
        </div>
      </section>
    </div>
  );
}


function IntegrationReadiness() {
  const apiGroups = [
    ['Authentication', '/auth/login', 'Role-based sessions for patient, clinician, lab, phlebotomist, operations and admin users.'],
    ['Bookings', '/bookings', 'Patient website bookings, WhatsApp/manual bookings and clinician-created requests.'],
    ['Assignments', '/assignments', 'Dispatcher-to-phlebotomist assignment, status update and field collection checklist.'],
    ['Samples', '/samples', 'Sample ID, handover, lab receipt and chain-of-custody event records.'],
    ['Results', '/results', 'PDF upload, manual result entry, result release and download audit.'],
    ['Payments', '/payments/paystack', 'Paystack mobile money/card initialisation, verification and payment status sync.'],
    ['Partners', '/partners/leads', 'Laboratory, hospital, clinician and corporate wellness partnership enquiries.'],
    ['Notifications', '/notifications', 'SMS, email and WhatsApp message queue for confirmations and prep instructions.'],
    ['QA summary', '/qa/workflow-summary', 'Protected operational QA summary for counts, status breakdowns and workflow readiness.']
  ];

  return (
    <div className="dashboard-content">
      <StatsGrid stats={[["Service layer", "Ready"], ["Mock/real API switch", "Prepared"], ["Paystack", "Placeholder-ready"], ["QA endpoint", "Added"]]} />
      <section className="dashboard-grid two-columns">
        <div className="dashboard-card">
          <SectionTitle eyebrow="Integration" title="Frontend API map" text="These are the backend areas this frontend is already prepared to connect to." />
          <div className="api-map-grid">
            {apiGroups.map(([name, endpoint, description]) => (
              <article className="api-map-card" key={name}>
                <strong>{name}</strong>
                <span>{description}</span>
                <code>{endpoint}</code>
              </article>
            ))}
          </div>
        </div>
        <div className="dashboard-card">
          <SectionTitle eyebrow="Environment" title="Required frontend variables" text="Add these values when connecting the real backend and payment gateway." />
          <div className="record-list">
            <MiniRecord title="VITE_API_BASE_URL" meta="Backend base URL, for example http://localhost:4000/api" status="Required" />
            <MiniRecord title="VITE_USE_MOCKS" meta="true for frontend demo, false for live backend API" status="Required" />
            <MiniRecord title="VITE_PAYSTACK_PUBLIC_KEY" meta="Public Paystack key for checkout" status="Required" />
            <MiniRecord title="VITE_HOMELABS_WHATSAPP" meta="WhatsApp booking phone number without plus sign" status="Required" />
          </div>
        </div>
      </section>

      <section className="dashboard-card">
        <SectionTitle eyebrow="QA readiness" title="Frontend/backend checks completed through Phase 11" text="This checklist is visible to admin so the team can see what is ready before deployment hardening." />
        <div className="qa-grid">
          {[
            'Patient booking validates required steps before submission',
            'Booking creates a frontend tracking ID for demo testing',
            'Track Booking page can read the latest frontend-created booking',
            'Paystack method selection supports mobile money and card placeholders',
            'Role dashboards are split into patient, clinician, operations, phlebotomist, lab and admin views',
            'Service layer remains mock-ready and backend-ready',
            'Admin QA Center documents demo tests, known limitations and mobile review checks',
            'Dashboard workflow state persists locally during client review',
            'Backend QA summary endpoint added for workflow counts and readiness',
            'Smoke-test script added for health, booking, tracking, payment and login'
          ].map((item) => (
            <span key={item}><CheckCircle2 size={18} /> {item}</span>
          ))}
        </div>
      </section>
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="dashboard-content">
      <section className="dashboard-grid two-columns">
        <div className="dashboard-card">
          <SectionTitle eyebrow="Settings" title="Booking and result rules" text="These settings will become backend-controlled product configuration." />
          <div className="settings-list">
            <label><input type="checkbox" defaultChecked /> Allow patient to select HomeLabs Laboratory</label>
            <label><input type="checkbox" defaultChecked /> Allow patient to choose partner lab</label>
            <label><input type="checkbox" defaultChecked /> Allow HomeLabs recommendation</label>
            <label><input type="checkbox" defaultChecked /> Release direct patient-requested results to patient</label>
            <label><input type="checkbox" /> Require review for sensitive tests</label>
          </div>
        </div>
        <div className="dashboard-card">
          <SectionTitle eyebrow="Brand" title="Website contact settings" text="Keep HomeLabs public contact details editable from admin later." />
          <div className="form-grid">
            <Field label="WhatsApp number"><input placeholder="+233 00 000 0000" /></Field>
            <Field label="Support email"><input placeholder="hello@homelabs.gh" /></Field>
            <Field label="Launch city"><input defaultValue="Kumasi" /></Field>
          </div>
          <button className="secondary-button full" type="button"><Settings size={17} /> Save settings</button>
        </div>
      </section>
    </div>
  );
}
