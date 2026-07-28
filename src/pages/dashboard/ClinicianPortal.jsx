import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, FileText, FileUp, Search, Send, Stethoscope, X } from 'lucide-react';
import { Field, MiniRecord, SectionTitle, StatsGrid, StatusBadge } from '../../components/dashboard/DashboardPrimitives.jsx';
import { getBookingOptions } from '../../services/bookingService.js';

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

const initialRequestForm = {
  fullName: '',
  phone: '',
  email: '',
  testSearch: '',
  selectedTestIds: [],
  category: '',
  customTest: '',
  prescriptionName: '',
  prescriptionFile: null,
  labChoice: 'recommend',
  partnerLabId: '',
  payment: 'Patient pays',
  releaseRule: 'Clinician first',
  notes: ''
};

function NewRequest({ actions }) {
  const [form, setForm] = useState(initialRequestForm);
  const [options, setOptions] = useState({ tests: [], partnerLabs: [], testCategories: [] });
  const [optionsStatus, setOptionsStatus] = useState('loading');
  const [optionsRetryCount, setOptionsRetryCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [submitStatus, setSubmitStatus] = useState({ loading: false, error: '' });
  const [createdRequest, setCreatedRequest] = useState(null);

  useEffect(() => {
    let active = true;
    setOptionsStatus('loading');
    getBookingOptions()
      .then((next) => {
        if (!active) return;
        setOptions(next);
        setOptionsStatus('ready');
      })
      .catch(() => { if (active) setOptionsStatus('error'); });
    return () => { active = false; };
  }, [optionsRetryCount]);

  const tests = options.tests;
  const selectedTests = useMemo(() => tests.filter((test) => form.selectedTestIds.includes(test.id)), [tests, form.selectedTestIds]);
  const testsTotal = selectedTests.reduce((sum, test) => sum + test.price, 0);

  const filteredTests = useMemo(() => tests.filter((test) => {
    const matchesSearch = `${test.name} ${test.category}`.toLowerCase().includes(form.testSearch.toLowerCase());
    const matchesCategory = !form.category || test.category === form.category;
    return matchesSearch && matchesCategory;
  }), [tests, form.testSearch, form.category]);

  const searchSuggestions = useMemo(() => {
    const query = form.testSearch.trim().toLowerCase();
    if (!query) return [];
    return tests.filter((test) => `${test.name} ${test.category}`.toLowerCase().includes(query)).slice(0, 8);
  }, [tests, form.testSearch]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function toggleTest(testId) {
    setForm((current) => ({
      ...current,
      selectedTestIds: current.selectedTestIds.includes(testId)
        ? current.selectedTestIds.filter((id) => id !== testId)
        : [...current.selectedTestIds, testId]
    }));
  }

  function selectSuggestion(test) {
    if (!form.selectedTestIds.includes(test.id)) toggleTest(test.id);
    update('testSearch', '');
    setSearchOpen(false);
  }

  function resetForm() {
    setForm(initialRequestForm);
    setValidationErrors([]);
  }

  async function submitRequest() {
    const errors = [];
    if (!form.fullName.trim()) errors.push('Enter the patient full name.');
    if (!form.phone.trim()) errors.push('Enter the patient phone number.');
    if (!form.selectedTestIds.length && !form.customTest.trim()) errors.push('Select at least one test, or describe a custom test request.');
    if (form.labChoice === 'partner' && !form.partnerLabId) errors.push('Choose a partner laboratory.');
    setValidationErrors(errors);
    if (errors.length) return;

    setSubmitStatus({ loading: true, error: '' });
    try {
      const created = await actions.createClinicianRequest({
        patient: { fullName: form.fullName.trim(), phone: form.phone.trim(), email: form.email.trim() },
        testIds: form.selectedTestIds,
        testNames: selectedTests.map((test) => test.name),
        customTest: form.customTest.trim(),
        prescriptionFile: form.prescriptionFile,
        labChoice: form.labChoice,
        partnerLabId: form.partnerLabId,
        payment: form.payment,
        releaseRule: form.releaseRule,
        notes: form.notes.trim()
      });
      setCreatedRequest({ id: created.id, patient: form.fullName.trim(), tests: selectedTests.length ? selectedTests.map((test) => test.name) : [form.customTest.trim()] });
      setSubmitStatus({ loading: false, error: '' });
      resetForm();
    } catch (error) {
      setSubmitStatus({ loading: false, error: error.message || 'Could not submit this request. Please try again.' });
    }
  }

  if (createdRequest) {
    return (
      <div className="dashboard-content">
        <section className="dashboard-card">
          <div className="success-icon"><CheckCircle2 size={40} /></div>
          <SectionTitle eyebrow="Request sent" title="Patient lab request created" text={`${createdRequest.id} has been created for ${createdRequest.patient}. The patient will receive a confirmation link to set their address, schedule and payment before a phlebotomist is assigned.`} />
          <div className="summary-card">
            <SummaryRow label="Request ID" value={createdRequest.id} />
            <SummaryRow label="Patient" value={createdRequest.patient} />
            <SummaryRow label="Tests" value={createdRequest.tests.join(', ')} />
          </div>
          <div className="field-actions">
            <button className="primary-button" type="button" onClick={() => setCreatedRequest(null)}><Send size={17} /> Create another request</button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      <section className="dashboard-grid two-columns">
        <div className="dashboard-card">
          <SectionTitle eyebrow="Clinician request" title="Create patient lab request" text="Search and select as many tests as this patient needs, then send it for patient confirmation." />

          {submitStatus.error && (
            <div className="validation-panel" role="alert">
              <strong>Submission issue</strong>
              <ul><li>{submitStatus.error}</li></ul>
            </div>
          )}
          {validationErrors.length > 0 && (
            <div className="validation-panel" role="alert">
              <strong>Complete these before sending</strong>
              <ul>{validationErrors.map((error) => <li key={error}>{error}</li>)}</ul>
            </div>
          )}

          <div className="form-grid two">
            <Field label="Patient name"><input value={form.fullName} onChange={(e) => update('fullName', e.target.value)} placeholder="Search or add patient" /></Field>
            <Field label="Patient phone"><input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+233..." /></Field>
            <Field label="Patient email (optional)"><input value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="name@example.com" /></Field>
            <Field label="Who pays?"><select value={form.payment} onChange={(e) => update('payment', e.target.value)}><option>Patient pays</option><option>Clinician pays</option><option>Hospital / clinic billed</option></select></Field>
          </div>

          <div className="test-step">
            <div className="form-grid two">
              <Field label="Search tests">
                <div className="search-suggest">
                  <div className="input-with-icon">
                    <Search size={18} />
                    <input
                      value={form.testSearch}
                      onChange={(e) => { update('testSearch', e.target.value); setSearchOpen(true); }}
                      onFocus={() => setSearchOpen(true)}
                      onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') setSearchOpen(false);
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (searchSuggestions.length > 0) selectSuggestion(searchSuggestions[0]);
                        }
                      }}
                      placeholder="Start typing: FBC, Malaria, HbA1c..."
                      role="combobox"
                      aria-expanded={searchOpen && form.testSearch.trim() !== ''}
                      aria-autocomplete="list"
                    />
                  </div>
                  {searchOpen && form.testSearch.trim() !== '' && (
                    <div className="suggest-list" role="listbox">
                      {searchSuggestions.map((test) => {
                        const selected = form.selectedTestIds.includes(test.id);
                        return (
                          <button
                            key={test.id}
                            type="button"
                            role="option"
                            aria-selected={selected}
                            className={`suggest-item ${selected ? 'selected' : ''}`}
                            onMouseDown={(e) => { e.preventDefault(); selectSuggestion(test); }}
                          >
                            <span className="suggest-name">{selected && <CheckCircle2 size={15} />} {test.name}</span>
                            <span className="suggest-meta">{test.category} · GHS {test.price}</span>
                          </button>
                        );
                      })}
                      {searchSuggestions.length === 0 && <div className="suggest-empty">No matching test found. Type it in the custom test box below.</div>}
                    </div>
                  )}
                </div>
              </Field>
              <Field label="Category"><select value={form.category} onChange={(e) => update('category', e.target.value)}><option value="">All categories</option>{options.testCategories.map((category) => <option key={category}>{category}</option>)}</select></Field>
            </div>

            {form.selectedTestIds.length > 0 && (
              <div className="chip-list">
                {selectedTests.map((test) => (
                  <button key={test.id} type="button" className="chip" onClick={() => toggleTest(test.id)}>
                    {test.name} <X size={13} />
                  </button>
                ))}
              </div>
            )}

            <div className="test-list">
              {filteredTests.map((test) => (
                <button key={test.id} type="button" className={`test-card ${form.selectedTestIds.includes(test.id) ? 'selected' : ''}`} onClick={() => toggleTest(test.id)}>
                  <span>{test.category}</span>
                  <strong>{test.name}</strong>
                  <small>{test.sample} · {test.turnaround} · {test.fasting ? 'Fasting required' : 'No fasting'}</small>
                  <b>GHS {test.price}</b>
                </button>
              ))}
            </div>

            {filteredTests.length === 0 && (
              <div className="empty-tests-note">
                {optionsStatus === 'loading' && <span>Loading the available tests…</span>}
                {optionsStatus === 'error' && (
                  <>
                    <span>We could not load the test list. Check your connection and try again, or type the test below.</span>
                    <button className="secondary-button small" type="button" onClick={() => setOptionsRetryCount((count) => count + 1)}>Retry loading tests</button>
                  </>
                )}
                {optionsStatus === 'ready' && <span>No tests match your search. Try a different keyword, or type the test below.</span>}
              </div>
            )}

            <div className="manual-request-box">
              <FileUp size={22} />
              <div>
                <h3>Can't find the test?</h3>
                <p>Type the requested test or upload the request form. Admin can review and confirm the final price.</p>
              </div>
              <input value={form.customTest} onChange={(e) => update('customTest', e.target.value)} placeholder="Type custom test request" />
              <label className="file-input">
                <input type="file" onChange={(e) => { const file = e.target.files?.[0] || null; setForm((current) => ({ ...current, prescriptionName: file?.name || '', prescriptionFile: file })); }} />
                {form.prescriptionName || 'Upload request form'}
              </label>
            </div>

            {selectedTests.length > 0 && <div className="mini-summary inline-summary"><span>Estimated test cost</span><strong>GHS {testsTotal.toLocaleString()}</strong></div>}
          </div>

          <div className="form-grid two">
            <Field label="Lab routing">
              <select value={form.labChoice} onChange={(e) => update('labChoice', e.target.value)}>
                <option value="recommend">Let HomeLabs recommend</option>
                <option value="homelabs">Use HomeLabs Laboratory</option>
                <option value="partner">Choose partner laboratory</option>
              </select>
            </Field>
            {form.labChoice === 'partner' && (
              <Field label="Partner laboratory">
                <select value={form.partnerLabId} onChange={(e) => update('partnerLabId', e.target.value)}>
                  <option value="">Select a partner laboratory</option>
                  {options.partnerLabs.map((lab) => <option key={lab.id} value={lab.id}>{lab.name} · {lab.location}</option>)}
                </select>
              </Field>
            )}
            <Field label="Result release"><select value={form.releaseRule} onChange={(e) => update('releaseRule', e.target.value)}><option>Clinician first</option><option>Clinician and patient</option><option>Admin review first</option></select></Field>
            <Field label="Clinical notes"><textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} placeholder="Brief clinical notes or diagnosis" /></Field>
          </div>

          <button className="primary-button full" type="button" onClick={submitRequest} disabled={submitStatus.loading}><Send size={17} /> {submitStatus.loading ? 'Sending request...' : 'Send patient confirmation link'}</button>
        </div>

        <div className="dashboard-card">
          <SectionTitle eyebrow="Patient confirmation" title="What the patient receives" text="The patient confirms address, time, consent and payment before operations assigns the phlebotomist." />
          <div className="message-preview">
            <strong>Hello from HomeLabs.</strong>
            <p>Your clinician has requested a lab collection{selectedTests.length ? ` for ${selectedTests.map((test) => test.name).join(', ')}` : ''}. Please confirm your address, preferred time and payment so a certified phlebotomist can be scheduled.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return <div className="summary-row"><span>{label}</span><strong>{value}</strong></div>;
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
