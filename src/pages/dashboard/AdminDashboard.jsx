import { useEffect, useState } from 'react';
import { CheckCircle2, FlaskConical, Plus, RefreshCw, Settings, ShieldCheck } from 'lucide-react';
import { Field, MiniRecord, PaginationControls, SectionTitle, StatsGrid, StatusBadge } from '../../components/dashboard/DashboardPrimitives.jsx';
import { createStaffUser, getAdminOverview, listCatalog, listServiceAreas, listStaff, upsertCatalogTest } from '../../services/adminService.js';
import { getBookingOptions } from '../../services/bookingService.js';

const staffRoles = [
  ['PHLEBOTOMIST', 'Certified Phlebotomist'],
  ['DISPATCHER', 'Operations Dispatcher'],
  ['OPERATIONS', 'Operations Staff'],
  ['HOMELABS_LAB_STAFF', 'HomeLabs Lab Scientist'],
  ['PARTNER_LAB_STAFF', 'Partner Lab Staff'],
  ['CLINICIAN', 'Clinician'],
  ['CUSTOMER_SUPPORT', 'Customer Support'],
  ['FINANCE', 'Finance Staff'],
  ['ADMIN', 'Administrator']
];

function labelForRole(role) {
  const match = staffRoles.find(([value]) => value === role);
  return match ? match[1] : String(role || '').replaceAll('_', ' ');
}

export function AdminDashboard({ activePage, data, actions }) {
  const { bookings, paymentRecords, staff } = data;
  if (activePage === 'users') return <UsersAndStaff />;
  if (activePage === 'tests') return <TestCatalog />;
  if (activePage === 'labs') return <LabsAndPartners />;
  if (activePage === 'payments') return <Payments paymentRecords={paymentRecords} actions={actions} />;
  if (activePage === 'integration') return <IntegrationReadiness />;
  if (activePage === 'settings') return <SettingsPage />;
  return <Overview bookings={bookings} staff={staff} paymentRecords={paymentRecords} />;
}

function useBackendList(loader, deps = []) {
  const [state, setState] = useState({ items: [], loading: true, error: '' });
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let alive = true;
    setState((current) => ({ ...current, loading: true, error: '' }));
    loader()
      .then((items) => { if (alive) setState({ items, loading: false, error: '' }); })
      .catch((error) => { if (alive) setState({ items: [], loading: false, error: error.message }); });
    return () => { alive = false; };
  }, [retryCount, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps

  return { ...state, retry: () => setRetryCount((count) => count + 1), setItems: (items) => setState((current) => ({ ...current, items })) };
}

function LoadPanel({ loading, error, retry, emptyTitle, emptyText, isEmpty }) {
  if (loading) return <div className="empty-panel"><RefreshCw size={26} /><strong>Loading from backend…</strong></div>;
  if (error) {
    return (
      <div className="empty-panel">
        <ShieldCheck size={26} />
        <strong>Could not load backend data</strong>
        <span>{error}</span>
        <button className="secondary-button small" type="button" onClick={retry} style={{ marginTop: 10 }}>Retry</button>
      </div>
    );
  }
  if (isEmpty) return <div className="empty-panel"><CheckCircle2 size={26} /><strong>{emptyTitle}</strong><span>{emptyText}</span></div>;
  return null;
}

function Overview({ bookings, staff, paymentRecords }) {
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    getAdminOverview()
      .then((payload) => { if (alive) setOverview(payload); })
      .catch((err) => { if (alive) setError(err.message); });
    return () => { alive = false; };
  }, []);

  const stats = overview
    ? [
        ['Total bookings', overview.bookings, 'All bookings in the system'],
        ['Registered patients', overview.patients, 'Patient records'],
        ['Active tests', overview.activeTests, 'Catalog tests patients can book'],
        ['Active labs', overview.labs, `${overview.serviceAreas} service areas configured`]
      ]
    : [
        ['Total bookings', bookings.length, error ? 'Backend overview unavailable' : 'Loading overview…'],
        ['Active staff', staff.length, 'Loaded from backend'],
        ['Payment records', paymentRecords.length, 'Loaded from backend'],
        ['Pending results', '—', error || 'Loading overview…']
      ];

  return (
    <div className="dashboard-content">
      <StatsGrid stats={stats} />
      <section className="dashboard-grid two-columns">
        <div className="dashboard-card">
          <SectionTitle eyebrow="Admin" title="Production control centre" text="Admin manages users, laboratory routing, catalog configuration, payments and operational settings." />
          <div className="admin-matrix">
            <MiniRecord title="Backend API" meta={error ? `Overview failed: ${error}` : 'Live backend connection active'} status={error ? 'Check connection' : 'Production'} />
            <MiniRecord title="Payments" meta={overview ? `${overview.payments} payment records synced through Paystack` : 'Paystack keys and webhook must be configured'} status="Production" />
            <MiniRecord title="Pending results" meta={overview ? `${overview.pendingResults} results awaiting release or review` : 'Result release queue'} status={overview && overview.pendingResults > 0 ? 'Attention' : 'Clear'} />
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

const initialStaffForm = { name: '', email: '', phone: '', role: 'PHLEBOTOMIST', password: '' };

function UsersAndStaff() {
  const users = useBackendList(() => listStaff({ page: 1 }));
  const [form, setForm] = useState(initialStaffForm);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ ok: '', error: '' });

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setFeedback({ ok: '', error: '' });
    try {
      const created = await createStaffUser({
        name: form.name,
        email: form.email,
        phone: form.phone || '',
        role: form.role,
        password: form.password
      });
      setFeedback({ ok: `${created.name} created as ${labelForRole(created.role)}. Share the temporary password securely.`, error: '' });
      setForm(initialStaffForm);
      users.retry();
    } catch (error) {
      setFeedback({ ok: '', error: error.message });
    } finally {
      setSaving(false);
    }
  }

  async function loadPage(page) {
    try {
      users.setItems(await listStaff({ page }));
    } catch (error) {
      setFeedback({ ok: '', error: error.message });
    }
  }

  return (
    <div className="dashboard-content">
      <StatsGrid stats={[["Users loaded", users.items.length], ["User source", "Backend"], ["Access model", "Role-based"], ["Status", "Production"]]} />
      <section className="dashboard-grid two-columns">
        <div className="dashboard-card">
          <SectionTitle eyebrow="Users" title="Users and staff" text="All production accounts: internal staff, lab users, clinicians and patients." />
          <LoadPanel loading={users.loading} error={users.error} retry={users.retry} isEmpty={!users.items.length} emptyTitle="No users yet" emptyText="Create the first staff account with the form on the right." />
          {!users.loading && !users.error && users.items.length > 0 && (
            <div className="record-list">
              {users.items.map((item) => (
                <MiniRecord key={item.id} title={item.name} meta={`${labelForRole(item.role)} · ${item.email}`} status={String(item.status || 'Active').toLowerCase() === 'active' ? 'Active' : item.status} />
              ))}
            </div>
          )}
          <PaginationControls meta={users.items.pagination} label="users" onPageChange={loadPage} />
        </div>
        <form className="dashboard-card" onSubmit={submit}>
          <SectionTitle eyebrow="Create user" title="Add staff member" text="Creates a real production account through the backend. Use a strong temporary password and ask the user to change it." />
          {feedback.ok && <div className="success-inline"><CheckCircle2 size={18} /> {feedback.ok}</div>}
          {feedback.error && <div className="validation-panel" role="alert"><strong>Could not create user</strong><ul><li>{feedback.error}</li></ul></div>}
          <div className="form-grid two">
            <Field label="Full name"><input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Staff full name" required minLength={2} /></Field>
            <Field label="Email"><input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="staff@yourdomain.com" required /></Field>
            <Field label="Phone (optional)"><input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+233..." /></Field>
            <Field label="Role">
              <select value={form.role} onChange={(e) => update('role', e.target.value)}>
                {staffRoles.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </Field>
            <Field label="Temporary password"><input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} placeholder="Min 12 chars, Aa + number" required minLength={12} autoComplete="new-password" /></Field>
          </div>
          <small className="form-note">Password needs at least 12 characters including an uppercase letter, a lowercase letter and a number.</small>
          <button className="primary-button full" type="submit" disabled={saving}><Plus size={17} /> {saving ? 'Creating user…' : 'Add staff'}</button>
        </form>
      </section>
    </div>
  );
}

const initialTestForm = { id: '', code: '', name: '', categoryName: '', sampleType: '', basePrice: '', turnaroundHours: '', fastingRequired: 'false' };

function TestCatalog() {
  const catalog = useBackendList(() => listCatalog({ page: 1 }));
  const [form, setForm] = useState(initialTestForm);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ ok: '', error: '' });

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function editTest(test) {
    setForm({
      id: test.id,
      code: test.code || '',
      name: test.name || '',
      categoryName: test.category?.name || '',
      sampleType: test.sampleType || '',
      basePrice: String(test.basePrice ?? ''),
      turnaroundHours: String(test.turnaroundHours ?? ''),
      fastingRequired: test.fastingRequired ? 'true' : 'false'
    });
    setFeedback({ ok: '', error: '' });
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setFeedback({ ok: '', error: '' });
    try {
      const payload = {
        code: form.code,
        name: form.name,
        categoryName: form.categoryName,
        sampleType: form.sampleType || undefined,
        basePrice: Number(form.basePrice || 0),
        fastingRequired: form.fastingRequired === 'true',
        active: true
      };
      if (form.turnaroundHours !== '') payload.turnaroundHours = Number(form.turnaroundHours);
      if (form.id) payload.id = form.id;
      const saved = await upsertCatalogTest(payload);
      setFeedback({ ok: `${saved.name || form.name} saved to the catalog.`, error: '' });
      setForm(initialTestForm);
      catalog.retry();
    } catch (error) {
      setFeedback({ ok: '', error: error.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="dashboard-content">
      <StatsGrid stats={[["Catalog tests", catalog.items.length], ["Fasting tests", catalog.items.filter((test) => test.fastingRequired).length], ["Active", catalog.items.filter((test) => test.active).length], ["Source", "Backend"]]} />
      <section className="dashboard-grid two-columns">
        <div className="dashboard-card">
          <SectionTitle eyebrow="Catalog" title="Test catalog" text="These are the diagnostics patients can select while booking. Click a row to edit it." />
          <LoadPanel loading={catalog.loading} error={catalog.error} retry={catalog.retry} isEmpty={!catalog.items.length} emptyTitle="Catalog is empty" emptyText="Add the first test with the form on the right — it becomes bookable immediately." />
          {!catalog.loading && !catalog.error && catalog.items.length > 0 && (
            <div className="dashboard-table-wrap compact-table">
              <table className="dashboard-table">
                <thead><tr><th>Test</th><th>Category</th><th>Sample</th><th>Price</th><th>Status</th></tr></thead>
                <tbody>
                  {catalog.items.map((test) => (
                    <tr key={test.id} onClick={() => editTest(test)} style={{ cursor: 'pointer' }} title="Click to edit">
                      <td><strong>{test.name}</strong><small>{test.code}{test.turnaroundHours ? ` · ${test.turnaroundHours}h turnaround` : ''}</small></td>
                      <td>{test.category?.name || '—'}</td>
                      <td>{test.sampleType || '—'}</td>
                      <td>GHS {Number(test.basePrice || 0).toLocaleString()}</td>
                      <td><StatusBadge status={test.active ? 'Active' : 'Inactive'} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <form className="dashboard-card" onSubmit={submit}>
          <SectionTitle eyebrow={form.id ? 'Edit test' : 'New test'} title={form.id ? 'Update catalog item' : 'Add catalog item'} text="Saved tests are live for patient bookings immediately. Confirm prices with laboratory operations first." />
          {feedback.ok && <div className="success-inline"><CheckCircle2 size={18} /> {feedback.ok}</div>}
          {feedback.error && <div className="validation-panel" role="alert"><strong>Could not save test</strong><ul><li>{feedback.error}</li></ul></div>}
          <div className="form-grid two">
            <Field label="Test name"><input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Full Blood Count" required minLength={2} /></Field>
            <Field label="Short code"><input value={form.code} onChange={(e) => update('code', e.target.value)} placeholder="FBC" required minLength={2} /></Field>
            <Field label="Category"><input value={form.categoryName} onChange={(e) => update('categoryName', e.target.value)} placeholder="Haematology" required minLength={2} /></Field>
            <Field label="Sample type"><input value={form.sampleType} onChange={(e) => update('sampleType', e.target.value)} placeholder="Blood / Urine / Stool" /></Field>
            <Field label="Price (GHS)"><input value={form.basePrice} onChange={(e) => update('basePrice', e.target.value)} placeholder="60" type="number" min="0" step="0.01" required /></Field>
            <Field label="Turnaround (hours)"><input value={form.turnaroundHours} onChange={(e) => update('turnaroundHours', e.target.value)} placeholder="24" type="number" min="0" max="720" /></Field>
            <Field label="Fasting"><select value={form.fastingRequired} onChange={(e) => update('fastingRequired', e.target.value)}><option value="false">No fasting</option><option value="true">Fasting required</option></select></Field>
          </div>
          <div className="field-actions">
            <button className="primary-button" type="submit" disabled={saving}><FlaskConical size={17} /> {saving ? 'Saving…' : form.id ? 'Update test' : 'Save test'}</button>
            {form.id && <button className="secondary-button" type="button" onClick={() => setForm(initialTestForm)}>Cancel edit</button>}
          </div>
        </form>
      </section>
    </div>
  );
}

function LabsAndPartners() {
  const areas = useBackendList(() => listServiceAreas({ page: 1 }));
  const labs = useBackendList(() => getBookingOptions().then((options) => options.partnerLabs || []));

  return (
    <div className="dashboard-content">
      <StatsGrid stats={[["Laboratories", labs.items.length], ["Service areas", areas.items.length], ["Routing", "Backend"], ["Status", "Production"]]} />
      <section className="dashboard-grid two-columns">
        <div className="dashboard-card">
          <SectionTitle eyebrow="Partners" title="Labs and service routing" text="Laboratories available for booking routing, loaded from the backend." />
          <LoadPanel loading={labs.loading} error={labs.error} retry={labs.retry} isEmpty={!labs.items.length} emptyTitle="No laboratories configured" emptyText="Create HomeLabs and partner laboratories in the backend so bookings can be routed." />
          {!labs.loading && !labs.error && labs.items.length > 0 && (
            <div className="record-list">
              {labs.items.map((lab) => <MiniRecord key={lab.id} title={lab.name} meta={`${lab.type || 'Laboratory'} · ${lab.location || 'Location not set'} · ${lab.turnaround || ''}`} status={lab.recommended ? 'Recommended' : 'Active'} />)}
            </div>
          )}
        </div>
        <div className="dashboard-card">
          <SectionTitle eyebrow="Service areas" title="Collection zones" text="Each zone can carry a different collection fee and staff coverage rule." />
          <LoadPanel loading={areas.loading} error={areas.error} retry={areas.retry} isEmpty={!areas.items.length} emptyTitle="No service areas configured" emptyText="Add production service areas in the backend so patients can select a collection zone." />
          {!areas.loading && !areas.error && areas.items.length > 0 && (
            <div className="zone-grid">
              {areas.items.map((area) => <div key={area.id}><strong>{area.name}</strong><span>GHS {Number(area.collectionFee ?? area.fee ?? 0).toLocaleString()}</span><StatusBadge status={area.active === false ? 'Inactive' : 'Active'} /></div>)}
            </div>
          )}
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
        {paymentRecords.length ? <div className="record-list">{paymentRecords.map((payment) => <MiniRecord key={payment.id} title={`${payment.patient} · GHS ${payment.amount}`} meta={`${payment.bookingId} · ${payment.method}`} status={payment.status} />)}</div> : <div className="empty-panel"><CheckCircle2 size={30} /><strong>No payment records loaded</strong><span>Payments will appear here after production bookings are submitted.</span></div>}
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
    ['Admin', '/admin', 'User creation, catalog management, laboratories and service areas.']
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
            <MiniRecord title="VITE_GOOGLE_CLIENT_ID" meta="Google OAuth web client ID for portal sign-in" status="Required" />
            <MiniRecord title="VITE_HOMELABS_WHATSAPP" meta="WhatsApp contact number without plus sign" status="Recommended" />
            <MiniRecord title="VITE_API_TIMEOUT_MS / VITE_API_RETRY_COUNT" meta="Request timeout and retry tuning" status="Optional" />
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
          <SectionTitle eyebrow="Settings" title="Booking and result rules" text="These rules reflect the current production behaviour. Changing them requires a backend configuration update — they are not editable from this screen yet." />
          <div className="settings-list">
            <label><input type="checkbox" defaultChecked disabled /> Allow patient to select HomeLabs Laboratory</label>
            <label><input type="checkbox" defaultChecked disabled /> Allow patient to choose partner lab</label>
            <label><input type="checkbox" defaultChecked disabled /> Allow HomeLabs recommendation</label>
            <label><input type="checkbox" defaultChecked disabled /> Release direct patient-requested results to patient</label>
            <label><input type="checkbox" disabled /> Require review for sensitive tests</label>
          </div>
        </div>
        <div className="dashboard-card">
          <SectionTitle eyebrow="Brand" title="Website contact settings" text="Public contact details are set through frontend environment variables and redeploys, so they stay in version-controlled configuration." />
          <div className="record-list">
            <MiniRecord title="WhatsApp number" meta="VITE_HOMELABS_WHATSAPP in Vercel environment variables" status="Env-managed" />
            <MiniRecord title="API endpoint" meta="VITE_API_BASE_URL in Vercel environment variables" status="Env-managed" />
            <MiniRecord title="Google sign-in" meta="VITE_GOOGLE_CLIENT_ID in Vercel environment variables" status="Env-managed" />
          </div>
          <small className="form-note"><Settings size={14} /> After changing an environment variable, trigger a redeploy for it to take effect.</small>
        </div>
      </section>
    </div>
  );
}
