import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  FileUp,
  FlaskConical,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
  UserRound
} from 'lucide-react';
import { partnerLabs as defaultPartnerLabs, serviceAreas as defaultServiceAreas, testCategories as defaultTestCategories, tests as defaultTests, timeSlots } from '../data/homelabsData.js';
import { createBooking, getBookingOptions, uploadPrescription } from '../services/bookingService.js';
import { initialisePaystackPayment, mapPaymentMethodToPaystackChannel } from '../services/paymentService.js';
import { buildWhatsAppBookingUrl } from '../services/notificationService.js';
import { hasBlockingErrors, validateBookingForm, validateBookingStep } from '../utils/bookingValidation.js';

const steps = [
  { id: 'patient', label: 'Patient', icon: UserRound },
  { id: 'tests', label: 'Tests', icon: ClipboardList },
  { id: 'lab', label: 'Lab', icon: FlaskConical },
  { id: 'location', label: 'Location', icon: MapPin },
  { id: 'schedule', label: 'Schedule', icon: CalendarDays },
  { id: 'review', label: 'Review', icon: CreditCard }
];

const initialForm = {
  fullName: '',
  phone: '',
  email: '',
  dob: '',
  gender: '',
  testSearch: '',
  selectedTestIds: [],
  category: '',
  customTest: '',
  prescriptionName: '',
  prescriptionFile: null,
  labChoice: 'homelabs',
  partnerLabId: '',
  areaId: '',
  address: '',
  landmark: '',
  facilityType: 'Home',
  notes: '',
  date: '',
  timeSlot: '7:00 AM – 9:00 AM',
  urgency: 'Routine',
  paymentMethod: 'Paystack Mobile Money',
  consent: false
};

export function BookingPage({ onBackHome, onTrack, embedded = false, initialPatient = null, onBooked }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState(() => ({
    ...initialForm,
    fullName: initialPatient?.fullName || initialForm.fullName,
    phone: initialPatient?.phone || initialForm.phone,
    email: initialPatient?.email || initialForm.email
  }));
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [searchOpen, setSearchOpen] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [submitStatus, setSubmitStatus] = useState({ loading: false, error: '', paymentUrl: '' });
  const [options, setOptions] = useState({
    serviceAreas: defaultServiceAreas,
    tests: defaultTests,
    partnerLabs: defaultPartnerLabs,
    testCategories: defaultTestCategories
  });
  const [optionsStatus, setOptionsStatus] = useState('loading');
  const [optionsRetryCount, setOptionsRetryCount] = useState(0);

  useEffect(() => {
    let active = true;
    setOptionsStatus('loading');
    getBookingOptions()
      .then((nextOptions) => {
        if (!active) return;
        setOptions(nextOptions);
        setOptionsStatus('ready');
        setForm((current) => ({
          ...current,
          areaId: nextOptions.serviceAreas.some((area) => area.id === current.areaId) ? current.areaId : nextOptions.serviceAreas[0]?.id || current.areaId,
          partnerLabId: nextOptions.partnerLabs.some((lab) => lab.id === current.partnerLabId) ? current.partnerLabId : nextOptions.partnerLabs[0]?.id || current.partnerLabId
        }));
      })
      .catch((error) => {
        console.warn('Booking options fetch failed.', error);
        if (active) setOptionsStatus('error');
      });
    return () => { active = false; };
  }, [optionsRetryCount]);

  const serviceAreas = options.serviceAreas;
  const tests = options.tests;
  const partnerLabs = options.partnerLabs;
  const testCategories = options.testCategories;

  const selectedTests = useMemo(
    () => tests.filter((test) => form.selectedTestIds.includes(test.id)),
    [form.selectedTestIds, tests]
  );

  const selectedArea = serviceAreas.find((area) => area.id === form.areaId) || serviceAreas[0] || { id: '', name: 'Service area unavailable', fee: 0 };
  const selectedPartnerLab = partnerLabs.find((lab) => lab.id === form.partnerLabId) || partnerLabs[0] || { id: '', name: 'Laboratory unavailable' };
  const testsTotal = selectedTests.reduce((sum, item) => sum + item.price, 0);
  const customReviewFee = form.customTest || form.prescriptionName ? 50 : 0;
  const total = Number(selectedArea.fee || 0) + testsTotal + customReviewFee;
  const needsFasting = selectedTests.some((test) => test.fasting);

  const filteredTests = useMemo(() => {
    return tests.filter((test) => {
      const matchesSearch = `${test.name} ${test.category}`.toLowerCase().includes(form.testSearch.toLowerCase());
      const matchesCategory = !form.category || test.category === form.category;
      return matchesSearch && matchesCategory;
    });
  }, [form.testSearch, form.category, tests]);

  const searchSuggestions = useMemo(() => {
    const query = form.testSearch.trim().toLowerCase();
    if (!query) return [];
    return tests
      .filter((test) => `${test.name} ${test.category}`.toLowerCase().includes(query))
      .slice(0, 8);
  }, [form.testSearch, tests]);

  function selectSuggestion(test) {
    if (!form.selectedTestIds.includes(test.id)) toggleTest(test.id);
    update('testSearch', '');
    setSearchOpen(false);
  }

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [currentStep.id]: [] }));
  }

  function toggleTest(testId) {
    setForm((current) => ({
      ...current,
      selectedTestIds: current.selectedTestIds.includes(testId)
        ? current.selectedTestIds.filter((id) => id !== testId)
        : [...current.selectedTestIds, testId]
    }));
  }

  function next() {
    const stepErrors = validateBookingStep(form, currentStep.id, { hasServiceAreas: serviceAreas.length > 0 });
    if (stepErrors.length) {
      setErrors((current) => ({ ...current, [currentStep.id]: stepErrors }));
      return;
    }
    setStepIndex((index) => Math.min(index + 1, steps.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goToStep(index) {
    if (index <= stepIndex) {
      setStepIndex(index);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    next();
  }

  function previous() {
    setStepIndex((index) => Math.max(index - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function submitBooking() {
    const allErrors = validateBookingForm(form, steps, { hasServiceAreas: serviceAreas.length > 0 });
    setErrors(allErrors);

    if (hasBlockingErrors(allErrors)) {
      const firstInvalidIndex = steps.findIndex((step) => allErrors[step.id]?.length);
      setStepIndex(Math.max(firstInvalidIndex, 0));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitStatus({ loading: true, error: '', paymentUrl: '' });
    try {
      const uploadedPrescription = form.prescriptionFile ? await uploadPrescription(form.prescriptionFile) : null;
      const createdBooking = await createBooking(buildApiBookingPayload({ form, selectedTests, selectedArea, selectedPartnerLab, total, uploadedPrescription }));
      const createdId = createdBooking.id || `HLB-${Math.floor(2400 + Math.random() * 700)}`;
      let paymentUrl = '';

      const paymentChannel = mapPaymentMethodToPaystackChannel(form.paymentMethod);
      if (['mobile_money', 'card'].includes(paymentChannel)) {
        const payment = await initialisePaystackPayment({
          bookingId: createdId,
          email: form.email,
          phone: form.phone,
          amount: total,
          method: paymentChannel
        });
        paymentUrl = payment.authorizationUrl || payment.authorization_url || '';
      }

      setBookingId(createdId);
      sessionStorage.setItem('homelabs_recent_booking', JSON.stringify({ id: createdId, paymentUrl }));
      localStorage.removeItem('homelabs_recent_booking');
      setSubmitStatus({ loading: false, error: '', paymentUrl });
      setSubmitted(true);
      if (onBooked) onBooked(createdId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setSubmitStatus({ loading: false, error: error.message || 'Booking submission failed.', paymentUrl: '' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  const currentStep = steps[stepIndex];
  const currentErrors = errors[currentStep.id] || [];
  const today = new Date().toISOString().slice(0, 10);

  if (submitted) {
    return (
      <main className={embedded ? 'booking-page embedded' : 'booking-page'}>
        <section className="booking-success container">
          <div className="success-icon"><CheckCircle2 size={48} /></div>
          <span>Booking request created</span>
          <h1>HomeLabs will confirm this collection.</h1>
          <p>Your booking has been submitted to the operations queue. Prescription uploads and Paystack checkout will be handled by the production backend where configured.</p>
          <div className="recent-booking-callout"><strong>{bookingId}</strong><span>Use this booking ID on the public tracking page. {submitStatus.paymentUrl ? 'Paystack checkout has also been prepared.' : 'Payment can be completed or confirmed through operations.'}</span></div>
          <div className="summary-card">
            <h2>Booking summary</h2>
            <SummaryRow label="Booking ID" value={bookingId || 'Generated after submission'} />
            <SummaryRow label="Patient" value={form.fullName || 'Not provided'} />
            <SummaryRow label="Phone" value={form.phone || 'Not provided'} />
            <SummaryRow label="Tests" value={selectedTests.length ? selectedTests.map((item) => item.name).join(', ') : form.customTest || 'Manual review'} />
            <SummaryRow label="Laboratory" value={form.labChoice === 'recommend' ? 'HomeLabs recommendation' : selectedPartnerLab.name} />
            <SummaryRow label="Area" value={selectedArea.name} />
            <SummaryRow label="Appointment" value={`${form.date || 'Date pending'} · ${form.timeSlot}`} />
            <SummaryRow label="Estimated total" value={`GHS ${total.toLocaleString()}`} />
            <SummaryRow label="Payment method" value={form.paymentMethod} />
          </div>
          <div className="booking-actions centered-actions">
            <button className="primary-button" type="button" onClick={() => { setSubmitted(false); setForm(initialForm); setStepIndex(0); }}>Create another booking</button>
            {onTrack && <button className="secondary-button" type="button" onClick={onTrack}>Track booking</button>}
            {submitStatus.paymentUrl && <a className="secondary-button" href={submitStatus.paymentUrl} target="_blank" rel="noreferrer">Open Paystack checkout</a>}
            <button className="secondary-button" type="button" onClick={onBackHome}>{embedded ? 'Back to overview' : 'Back to website'}</button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className={embedded ? 'booking-page embedded' : 'booking-page'}>
      {!embedded && (
        <section className="booking-hero">
          <div className="container booking-hero-inner">
            <button className="ghost-button" type="button" onClick={onBackHome}><ArrowLeft size={17} /> Back to website</button>
            <div>
              <span>Patient booking</span>
              <h1>Book a Home Lab Visit</h1>
              <p>Complete the request below. Patients can choose HomeLabs Laboratory, choose a partner lab, or let HomeLabs recommend a lab.</p>
            </div>
            <a className="whatsapp-button dark" href={buildWhatsAppBookingUrl('Hello HomeLabs, I want to book a home lab visit')} target="_blank" rel="noreferrer"><MessageCircle size={17} /> Book on WhatsApp</a>
          </div>
        </section>
      )}

      <section className="container booking-shell">
        <aside className="booking-sidebar">
          <div className="step-list">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const active = index === stepIndex;
              const complete = index < stepIndex;
              return (
                <button key={step.id} type="button" className={`step-button ${active ? 'active' : ''} ${complete ? 'complete' : ''}`} onClick={() => goToStep(index)}>
                  <Icon size={18} />
                  <span>{step.label}</span>
                  {complete && <CheckCircle2 size={17} />}
                </button>
              );
            })}
          </div>
          <div className="mini-summary">
            <span>Estimated total</span>
            <strong>GHS {total.toLocaleString()}</strong>
            <small>Includes collection fee and selected test estimates. Final amount can be adjusted by admin.</small>
          </div>
        </aside>

        <section className="booking-card">
          {submitStatus.error && (
            <div className="validation-panel" role="alert">
              <strong>Submission issue</strong>
              <ul><li>{submitStatus.error}</li></ul>
            </div>
          )}

          {currentErrors.length > 0 && (
            <div className="validation-panel" role="alert">
              <strong>Complete this step before continuing</strong>
              <ul>{currentErrors.map((error) => <li key={error}>{error}</li>)}</ul>
            </div>
          )}

          <div className="booking-card-heading">
            <div className="step-emblem"><currentStep.icon size={22} /></div>
            <div>
              <span>Step {stepIndex + 1} of {steps.length}</span>
              <h2>{currentStep.label}</h2>
            </div>
          </div>

          {currentStep.id === 'patient' && (
            <div className="form-grid two">
              <Field label="Full name"><input value={form.fullName} onChange={(e) => update('fullName', e.target.value)} placeholder="Patient full name" /></Field>
              <Field label="Phone number"><input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+233..." /></Field>
              <Field label="Email address"><input value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="name@example.com" /></Field>
              <Field label="Date of birth"><input type="date" value={form.dob} onChange={(e) => update('dob', e.target.value)} /></Field>
              <Field label="Gender"><select value={form.gender} onChange={(e) => update('gender', e.target.value)}><option value="">Select gender</option><option>Female</option><option>Male</option><option>Prefer not to say</option></select></Field>
            </div>
          )}

          {currentStep.id === 'tests' && (
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
                        {searchSuggestions.length === 0 && (
                          <div className="suggest-empty">
                            No matching test found. Type it in the “Can’t find the test?” box below and our team will confirm it.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Field>
                <Field label="Category"><select value={form.category} onChange={(e) => update('category', e.target.value)}><option value="">All categories</option>{testCategories.map((category) => <option key={category}>{category}</option>)}</select></Field>
              </div>
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
                      <span>We could not load the test list. Check your internet connection and try again — or type your test below and we will handle it manually.</span>
                      <button className="secondary-button small" type="button" onClick={() => setOptionsRetryCount((count) => count + 1)}>Retry loading tests</button>
                    </>
                  )}
                  {optionsStatus === 'ready' && <span>No tests match your search. Try a different keyword, or type the test below and our team will confirm it.</span>}
                </div>
              )}
              <div className="manual-request-box">
                <FileUp size={22} />
                <div>
                  <h3>Can’t find the test?</h3>
                  <p>Type the requested test or upload the doctor’s request form. Admin can review and confirm the final price.</p>
                </div>
                <input value={form.customTest} onChange={(e) => update('customTest', e.target.value)} placeholder="Type custom test request" />
                <label className="file-input">
                  <input type="file" onChange={(e) => { const file = e.target.files?.[0] || null; setForm((current) => ({ ...current, prescriptionName: file?.name || '', prescriptionFile: file })); }} />
                  {form.prescriptionName || 'Upload request form'}
                </label>
              </div>
            </div>
          )}

          {currentStep.id === 'lab' && (
            <div className="choice-grid">
              <ChoiceCard title="Use HomeLabs Laboratory" text="Route the sample to HomeLabs-owned laboratory processing." selected={form.labChoice === 'homelabs'} onClick={() => update('labChoice', 'homelabs')} />
              <ChoiceCard title="Choose partner laboratory" text="Select one of the available partner labs in Kumasi." selected={form.labChoice === 'partner'} onClick={() => update('labChoice', 'partner')} />
              <ChoiceCard title="Let HomeLabs recommend" text="HomeLabs will recommend the best lab based on test, location and turnaround time." selected={form.labChoice === 'recommend'} onClick={() => update('labChoice', 'recommend')} />
              {form.labChoice === 'partner' && (
                <div className="partner-selector">
                  <h3>Select partner lab</h3>
                  {partnerLabs.map((lab) => (
                    <label key={lab.id} className="radio-row">
                      <input type="radio" name="partnerLab" checked={form.partnerLabId === lab.id} onChange={() => update('partnerLabId', lab.id)} />
                      <span><strong>{lab.name}</strong><small>{lab.type} · {lab.location} · {lab.turnaround}</small></span>
                    </label>
                  ))}
                  {partnerLabs.length === 0 && (
                    <p className="form-note">The partner lab list is not available right now. Choose “Use HomeLabs Laboratory” or “Let HomeLabs recommend” to continue.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {currentStep.id === 'location' && (
            <div className="form-grid two">
              <Field label="Kumasi area"><select value={form.areaId} onChange={(e) => update('areaId', e.target.value)}>{serviceAreas.map((area) => <option key={area.id} value={area.id}>{area.name} — GHS {area.fee}</option>)}</select></Field>
              <Field label="Collection place"><select value={form.facilityType} onChange={(e) => update('facilityType', e.target.value)}><option>Home</option><option>Office</option><option>Care facility</option><option>Hotel</option><option>Other</option></select></Field>
              <Field label="Full address"><textarea value={form.address} onChange={(e) => update('address', e.target.value)} placeholder="House number, street, area, GPS if available" /></Field>
              <Field label="Landmark"><textarea value={form.landmark} onChange={(e) => update('landmark', e.target.value)} placeholder="Nearest landmark or access instructions" /></Field>
              <Field label="Special notes"><textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} placeholder="Gate access, patient mobility, preferred call instructions..." /></Field>
            </div>
          )}

          {currentStep.id === 'schedule' && (
            <div className="form-grid two">
              <Field label="Preferred date"><input type="date" min={today} value={form.date} onChange={(e) => update('date', e.target.value)} /></Field>
              <Field label="Preferred time slot"><select value={form.timeSlot} onChange={(e) => update('timeSlot', e.target.value)}>{timeSlots.map((slot) => <option key={slot}>{slot}</option>)}</select></Field>
              <Field label="Urgency"><select value={form.urgency} onChange={(e) => update('urgency', e.target.value)}><option>Routine</option><option>Urgent</option><option>Post-discharge follow-up</option><option>Chronic care monitoring</option></select></Field>
              {needsFasting && <div className="alert-card"><ShieldCheck size={22} /><span>One or more selected tests may require fasting. HomeLabs will confirm preparation instructions before collection.</span></div>}
            </div>
          )}

          {currentStep.id === 'review' && (
            <div className="review-layout">
              <div className="summary-card">
                <h3>Review details</h3>
                <SummaryRow label="Patient" value={form.fullName || 'Not provided'} />
                <SummaryRow label="Phone" value={form.phone || 'Not provided'} />
                <SummaryRow label="Tests" value={selectedTests.length ? selectedTests.map((item) => item.name).join(', ') : form.customTest || 'Manual review'} />
                <SummaryRow label="Lab option" value={form.labChoice === 'recommend' ? 'HomeLabs recommendation' : selectedPartnerLab.name} />
                <SummaryRow label="Location" value={`${selectedArea.name} · ${form.facilityType}`} />
                <SummaryRow label="Schedule" value={`${form.date || 'Date pending'} · ${form.timeSlot}`} />
                <SummaryRow label="Payment method" value={form.paymentMethod} />
              </div>
              <div className="payment-card">
                <h3>Payment estimate</h3>
                <Field label="Payment method"><select value={form.paymentMethod} onChange={(e) => update('paymentMethod', e.target.value)}><option>Paystack Mobile Money</option><option>Paystack Card</option><option>Admin/manual confirmation</option><option>Institution billed</option></select></Field>
                <SummaryRow label="Tests" value={`GHS ${testsTotal.toLocaleString()}`} />
                <SummaryRow label="Collection fee" value={`GHS ${selectedArea.fee.toLocaleString()}`} />
                <SummaryRow label="Manual review" value={`GHS ${customReviewFee.toLocaleString()}`} />
                <div className="total-row"><span>Total</span><strong>GHS {total.toLocaleString()}</strong></div>
                <label className="consent-row"><input type="checkbox" checked={form.consent} onChange={(e) => update('consent', e.target.checked)} /> I consent to HomeLabs collecting my details and coordinating this sample collection.</label>
                <button className="primary-button full" type="button" onClick={submitBooking} disabled={!form.consent || submitStatus.loading}>{submitStatus.loading ? 'Submitting booking...' : 'Continue to Paystack / Submit'}</button>
                <small>Submission uses the production backend API and initializes Paystack when payment is enabled.</small>
              </div>
            </div>
          )}

          <div className="booking-actions">
            <button className="secondary-button" type="button" onClick={previous} disabled={stepIndex === 0}><ArrowLeft size={17} /> Previous</button>
            {stepIndex < steps.length - 1 ? (
              <button className="primary-button" type="button" onClick={next}>Next <ArrowRight size={17} /></button>
            ) : null}
          </div>
        </section>
      </section>
    </main>
  );
}

function Field({ label, children }) {
  return <label className="field"><span>{label}</span>{children}</label>;
}

function ChoiceCard({ title, text, selected, onClick }) {
  return (
    <button type="button" className={`choice-card ${selected ? 'selected' : ''}`} onClick={onClick}>
      <CheckCircle2 size={22} />
      <strong>{title}</strong>
      <span>{text}</span>
    </button>
  );
}

function SummaryRow({ label, value }) {
  return <div className="summary-row"><span>{label}</span><strong>{value}</strong></div>;
}


function buildApiBookingPayload({ form, selectedTests, selectedArea, selectedPartnerLab, total, uploadedPrescription }) {
  const paymentMethod = mapPaymentMethodToPaystackChannel(form.paymentMethod);
  const labChoice = form.labChoice === 'partner' ? 'partner' : form.labChoice === 'recommend' ? 'recommend' : 'homelabs';
  return {
    source: 'website',
    patient: {
      fullName: form.fullName,
      phone: form.phone,
      email: form.email,
      dob: form.dob,
      gender: form.gender
    },
    tests: selectedTests.map((test) => test.id),
    customTest: form.customTest,
    prescriptionFileId: uploadedPrescription?.fileId,
    prescriptionUrl: uploadedPrescription?.fileUrl,
    labChoice,
    selectedLabId: labChoice === 'partner' ? selectedPartnerLab.id || null : null,
    location: {
      areaId: selectedArea.id || null,
      address: form.address,
      landmark: form.landmark,
      facilityType: form.facilityType
    },
    schedule: {
      date: form.date,
      timeSlot: form.timeSlot,
      urgency: form.urgency
    },
    consent: form.consent,
    amount: total,
    paymentMethod
  };
}

function buildRecentBooking(id, form, selectedTests, selectedArea, selectedPartnerLab, total) {
  return {
    id,
    patient: form.fullName || 'Patient pending',
    phone: form.phone || 'Not provided',
    source: 'Website',
    tests: selectedTests.length ? selectedTests.map((item) => item.name) : [form.customTest || 'Manual test review'],
    lab: form.labChoice === 'recommend' ? 'HomeLabs recommended lab pending' : selectedPartnerLab.name,
    labMode: form.labChoice === 'recommend' ? 'Recommendation' : selectedPartnerLab.type,
    time: `${form.date || 'Date pending'} · ${form.timeSlot}`,
    area: selectedArea.name,
    address: form.address || 'Address pending',
    status: 'Under Review',
    payment: form.paymentMethod === 'Institution billed' ? 'Institution billed' : 'Pending',
    phlebotomist: 'Pending assignment',
    priority: form.urgency,
    amount: total,
    createdAt: new Date().toISOString()
  };
}
