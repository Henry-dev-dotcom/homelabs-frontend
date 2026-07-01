import { CheckCircle2, CreditCard, FlaskConical, Plus, Settings, ShieldCheck, UsersRound } from 'lucide-react';
import { Field, MiniRecord, PaginationControls, SectionTitle, StatsGrid, StatusBadge } from '../../components/dashboard/DashboardPrimitives.jsx';
import { partnerLabs, serviceAreas, testCategories, tests } from '../../data/homelabsData.js';

export function AdminDashboard({ activePage, data, actions }) {
  const { bookings, paymentRecords, staff } = data;
  if (activePage === 'users') return <UsersAndStaff staff={staff} actions={actions} />;
  if (activePage === 'tests') return <TestCatalog />;
  if (activePage === 'labs') return <LabsAndPartners />;
  if (activePage === 'payments') return <Payments paymentRecords={paymentRecords} actions={actions} />;
  if (activePage === 'integration') return <IntegrationReadiness />;
  if (activePage === 'settings') return <SettingsPage />;

  return (
    <div className="dashboard-content">
      <StatsGrid stats={[
        ['Total bookings', bookings.length, 'Loaded from backend'],
        ['Active staff', staff.length, 'Loaded from backend'],
        ['Payment records', paymentRecords.length, 'Loaded from backend'],
        ['Catalog items', tests.length, 'Configured in backend']
      ]} />
      <section className="dashboard-grid two-columns">
        <div className="dashboard-card">
          <SectionTitle eyebrow="Admin" title="Production control centre" text="Admin manages users, laboratory routing, catalog configuration, payments and operational settings." />
          <div className="admin-matrix">
            <MiniRecord title="Backend API" meta="Live backend connection required" status="Production" />
            <MiniRecord title="Payments" meta="Paystack keys and webhook must be configured" status="Production" />
            <MiniRecord title="Security" meta="Rate limiting, validation and secure headers enabled" status="Active" />
          </div>
        </div>
        <div className="dashboard-card">
          <SectionTitle eyebrow="Governance" title="Result release rules" text="Result release should follow patient, clinician and internal-review permissions configured by the operation." />
          <div className="policy-list">
            <span><ShieldCheck size={18} /> Patient-requested results can be released directly to the patient portal.</span>
            <span><ShieldCheck size={18} /> Clinician-requested results can route to clinician inbox first.</span>
            <span><ShieldCheck size={18} /> Sensitive result workflows can require internal review before release.</span>
          </div>
        </div>
      </section>
    </div>
  );
}

function EmptyState({ title, text }) {
  return <div className="empty-panel"><CheckCircle2 size={30} /><strong>{title}</strong><span>{text}</span></div>;
}

function UsersAndStaff({ staff, actions }) {
  return (
    <div className="dashboard-content">
      <StatsGrid stats={[["Staff users", staff.length], ["User source", "Backend"], ["Access model", "Role-based"], ["Status", "Production"]]} />
      <section className="dashboard-grid two-columns">
        <div className="dashboard-card">
          <SectionTitle eyebrow="Users" title="Users and staff" text="Manage internal staff, lab users, clinicians and patients from backend records." />
          {staff.length ? <div className="record-list">{staff.map((item) => <MiniRecord key={item.id} title={item.name} meta={`${item.role} · ${item.zone || 'Zone not set'}`} status={item.status} />)}</div> : <EmptyState title="No staff loaded" text="Create production users in the backend before launch." />}
          <PaginationControls meta={staff.pagination} label="staff users" onPageChange={(page) => actions.loadBackendPage('staff', page)} />
        </div>
        <div className="dashboard-card">
          <SectionTitle eyebrow="Create user" title="Add staff member" text="Create only approved production users with strong temporary passwords and forced password rotation where available." />
          <div className="form-grid two">
            <Field label="Full name"><input placeholder="Staff full name" /></Field>
            <Field label="Email"><input placeholder="staff@yourdomain.com" /></Field>
            <Field label="Role"><select><option>Certified Phlebotomist</option><option>Operations Dispatcher</option><option>Lab Scientist</option><option>Customer Support</option><option>Finance Staff</option></select></Field>
            <Field label="Zone"><input placeholder="Service zone" /></Field>
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
      <StatsGrid stats={[["Catalog tests", tests.length], ["Categories", testCategories.length], ["Fasting tests", tests.filter((test) => test.fasting).length], ["Source", "Backend"]]} />
      <section className="dashboard-grid two-columns">
        <div className="dashboard-card">
          <SectionTitle eyebrow="Catalog" title="Test catalog" text="Configured tests should be managed from the backend catalog before accepting production bookings." />
          {tests.length ? <div className="dashboard-table-wrap compact-table"><table className="dashboard-table"><thead><tr><th>Test</th><th>Category</th><th>Sample</th><th>Price</th></tr></thead><tbody>{tests.map((test) => <tr key={test.id}><td><strong>{test.name}</strong><small>{test.turnaround}</small></td><td>{test.category}</td><td>{test.sample}</td><td>GHS {test.price}</td></tr>)}</tbody></table></div> : <EmptyState title="No catalog data bundled" text="Production catalog data must come from the backend database." />}
        </div>
        <div className="dashboard-card">
          <SectionTitle eyebrow="New test" title="Add or edit catalog item" text="Catalog changes should be validated by laboratory operations before publishing." />
          <div className="form-grid two">
            <Field label="Test name"><input placeholder="Test name" /></Field>
            <Field label="Category"><select>{testCategories.length ? testCategories.map((category) => <option key={category}>{category}</option>) : <option>Configure categories</option>}</select></Field>
            <Field label="Sample type"><input placeholder="Blood / Urine / Stool" /></Field>
            <Field label="Price"><input placeholder="GHS" type="number" /></Field>
            <Field label="Turnaround"><input placeholder="Turnaround time" /></Field>
            <Field label="Fasting"><select><option>No fasting</option><option>Fasting required</option></select></Field>
          </div>
          <button className="primary-button full" type="button"><FlaskConical size={17} /> Save test</button>
        </div>
      </section>
    </div>
  );
}

function LabsAndPartners() {
  return (
    <div className="dashboard-content">
      <StatsGrid stats={[["Laboratories", partnerLabs.length], ["Service areas", serviceAreas.length], ["Routing", "Backend"], ["Status", "Production"]]} />
      <section className="dashboard-grid two-columns">
        <div className="dashboard-card">
          <SectionTitle eyebrow="Partners" title="Labs and service routing" text="Laboratories can be active, inactive or recommended by backend routing rules." />
          {partnerLabs.length ? <div className="record-list">{partnerLabs.map((lab) => <MiniRecord key={lab.id} title={lab.name} meta={`${lab.type} · ${lab.location} · ${lab.turnaround}`} status={lab.recommended ? 'Recommended' : 'Active'} />)}</div> : <EmptyState title="No labs bundled" text="Configure HomeLabs and partner laboratories in the backend database." />}
        </div>
        <div className="dashboard-card">
          <SectionTitle eyebrow="Service areas" title="Collection zones" text="Each zone can carry a different collection fee and staff coverage rule." />
          {serviceAreas.length ? <div className="zone-grid">{serviceAreas.map((area) => <div key={area.id}><strong>{area.name}</strong><span>GHS {area.fee}</span><StatusBadge status={area.active ? 'Active' : 'Inactive'} /></div>)}</div> : <EmptyState title="No service areas bundled" text="Configure production service areas in the backend database." />}
        </div>
      </section>
    </div>
  );
}

function Payments({ paymentRecords, actions }) {
  return (
    <div className="dashboard-content">
      <StatsGrid stats={[["Payment records", paymentRecords.length], ["Successful", paymentRecords.filter((p) => p.status === 'Successful').length], ["Pending", paymentRecords.filter((p) => p.status === 'Pending').length], ["Gateway", "Paystack"]]} />
      <section className="dashboard-section">
        <SectionTitle eyebrow="Finance" title="Paystack payment monitor" text="Payment records are loaded from the backend and synced through Paystack verification and webhook events." />
        {paymentRecords.length ? <div className="record-list">{paymentRecords.map((payment) => <MiniRecord key={payment.id} title={`${payment.patient} · GHS ${payment.amount}`} meta={`${payment.bookingId} · ${payment.method}`} status={payment.status} />)}</div> : <EmptyState title="No payment records loaded" text="Payments will appear here after production bookings are submitted." />}
        <PaginationControls meta={paymentRecords.pagination} label="payments" onPageChange={(page) => actions.loadBackendPage('payments', page)} />
      </section>
    </div>
  );
}

function IntegrationReadiness() {
  const apiGroups = [
    ['Authentication', '/auth/login', 'Role-based sessions for patient, clinician, lab, phlebotomist, operations and admin users.'],
    ['Bookings', '/bookings', 'Patient website bookings, manual bookings and clinician-created requests.'],
    ['Assignments', '/assignments', 'Dispatcher-to-phlebotomist assignment, status update and field collection checklist.'],
    ['Samples', '/samples', 'Sample ID, handover, lab receipt and chain-of-custody event records.'],
    ['Results', '/results', 'PDF upload, manual result entry, result release and download audit.'],
    ['Payments', '/payments/paystack', 'Paystack mobile money/card initialisation, verification and payment status sync.'],
    ['Partners', '/partners/leads', 'Laboratory, hospital, clinician and corporate wellness partnership enquiries.'],
    ['Notifications', '/notifications', 'SMS, email and WhatsApp message queue for confirmations and prep instructions.']
  ];

  return (
    <div className="dashboard-content">
      <StatsGrid stats={[["Service layer", "Live API"], ["Demo data", "Removed"], ["Paystack", "Production keys required"], ["Security", "Hardened"]]} />
      <section className="dashboard-grid two-columns">
        <div className="dashboard-card">
          <SectionTitle eyebrow="Integration" title="Production API map" text="These backend areas are required for the deployed frontend." />
          <div className="api-map-grid">
            {apiGroups.map(([name, endpoint, description]) => <article className="api-map-card" key={name}><strong>{name}</strong><span>{description}</span><code>{endpoint}</code></article>)}
          </div>
        </div>
        <div className="dashboard-card">
          <SectionTitle eyebrow="Environment" title="Required frontend variables" text="Set these in Vercel or your frontend hosting provider before deployment." />
          <div className="record-list">
            <MiniRecord title="VITE_API_BASE_URL" meta="Backend base URL, for example https://api.yourdomain.com/api" status="Required" />
            <MiniRecord title="VITE_API_TIMEOUT_MS" meta="Request timeout in milliseconds" status="Recommended" />
            <MiniRecord title="VITE_API_RETRY_COUNT" meta="Retry count for temporary failures" status="Recommended" />
            <MiniRecord title="VITE_HOMELABS_WHATSAPP" meta="WhatsApp contact number without plus sign" status="Optional" />
          </div>
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
          <SectionTitle eyebrow="Settings" title="Booking and result rules" text="Production rules should be saved through backend-controlled product configuration." />
          <div className="settings-list">
            <label><input type="checkbox" defaultChecked /> Allow patient to select HomeLabs Laboratory</label>
            <label><input type="checkbox" defaultChecked /> Allow patient to choose partner lab</label>
            <label><input type="checkbox" defaultChecked /> Allow HomeLabs recommendation</label>
            <label><input type="checkbox" defaultChecked /> Release direct patient-requested results to patient</label>
            <label><input type="checkbox" /> Require review for sensitive tests</label>
          </div>
        </div>
        <div className="dashboard-card">
          <SectionTitle eyebrow="Brand" title="Website contact settings" text="Keep public contact details aligned with verified production support channels." />
          <div className="form-grid">
            <Field label="WhatsApp number"><input placeholder="+233 00 000 0000" /></Field>
            <Field label="Support email"><input placeholder="support@yourdomain.com" /></Field>
            <Field label="Launch city"><input placeholder="Primary launch city" /></Field>
          </div>
          <button className="secondary-button full" type="button"><Settings size={17} /> Save settings</button>
        </div>
      </section>
    </div>
  );
}
