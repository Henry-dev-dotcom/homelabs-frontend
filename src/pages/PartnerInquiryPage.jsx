import { useMemo, useState } from 'react';
import { ArrowLeft, Building2, CheckCircle2, FlaskConical, Hospital, MessageCircle, Send, Stethoscope, UsersRound } from 'lucide-react';
import { Field } from '../components/dashboard/DashboardPrimitives.jsx';
import { createPartnerLead } from '../services/partnerService.js';

const partnerTypes = [
  { id: 'laboratory', title: 'Laboratory partner', icon: FlaskConical, text: 'Receive HomeLabs-collected samples, confirm receipt and upload results.' },
  { id: 'hospital', title: 'Hospital partner', icon: Hospital, text: 'Refer post-discharge and routine patients for home collection in Kumasi.' },
  { id: 'clinician', title: 'Clinician', icon: Stethoscope, text: 'Create patient requests and receive results through the clinician portal.' },
  { id: 'corporate', title: 'Corporate wellness', icon: UsersRound, text: 'Arrange workplace screening and recurring wellness panels for teams.' }
];

const initialForm = {
  partnerType: 'laboratory',
  organisation: '',
  contactName: '',
  phone: '',
  email: '',
  location: 'Kumasi',
  message: ''
};

export function PartnerInquiryPage({ onBackHome, onLogin }) {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [leadResult, setLeadResult] = useState(null);
  const [submitState, setSubmitState] = useState({ loading: false, error: '' });

  const selectedType = useMemo(() => partnerTypes.find((item) => item.id === form.partnerType) || partnerTypes[0], [form.partnerType]);
  const SelectedIcon = selectedType.icon;

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setSubmitState({ loading: true, error: '' });
    try {
      const result = await createPartnerLead(form);
      setLeadResult(result);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setSubmitState({ loading: false, error: error.message || 'Unable to submit partnership enquiry.' });
    } finally {
      setSubmitState((current) => ({ ...current, loading: false }));
    }
  }

  if (submitted) {
    return (
      <main className="booking-page public-tool-page">
        <section className="booking-success container partner-success">
          <div className="success-icon"><CheckCircle2 size={48} /></div>
          <span>Partnership lead created</span>
          <h1>HomeLabs can review this lead.</h1>
          <p>This enquiry has been prepared for the admin partner queue. In connected mode, the backend stores this lead for follow-up by the partnerships or operations team.</p>
          <div className="summary-card">
            <h2>Lead summary</h2>
            <div className="summary-row"><span>Lead ID</span><strong>{leadResult?.id || 'Generated after backend submission'}</strong></div>
            <div className="summary-row"><span>Partner type</span><strong>{selectedType.title}</strong></div>
            <div className="summary-row"><span>Organisation</span><strong>{form.organisation || 'Not provided'}</strong></div>
            <div className="summary-row"><span>Contact</span><strong>{form.contactName || 'Not provided'} · {form.phone || 'No phone'}</strong></div>
            <div className="summary-row"><span>Location</span><strong>{form.location || 'Kumasi'}</strong></div>
          </div>
          <div className="booking-actions centered-actions">
            <button className="primary-button" type="button" onClick={() => { setSubmitted(false); setForm(initialForm); }}>Create another lead</button>
            <button className="secondary-button" type="button" onClick={onBackHome}>Back to website</button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="booking-page public-tool-page">
      <section className="booking-hero">
        <div className="container booking-hero-inner">
          <button className="ghost-button" type="button" onClick={onBackHome}><ArrowLeft size={17} /> Back to website</button>
          <div>
            <span>Partnership enquiry</span>
            <h1>Partner with HomeLabs.</h1>
            <p>Register interest as a laboratory, hospital, clinician or corporate wellness partner for the Kumasi MVP rollout.</p>
          </div>
          <button className="whatsapp-button dark" type="button" onClick={onLogin}>Portal preview</button>
        </div>
      </section>

      <section className="container partner-shell">
        <div className="section-heading centered compact-heading">
          <span>One partner platform</span>
          <h2>Labs, clinicians and hospitals can grow through one shared workflow.</h2>
          <p>HomeLabs handles collection, sample movement and result routing while partners keep clinical visibility.</p>
        </div>

        <div className="partner-type-grid">
          {partnerTypes.map((item) => {
            const Icon = item.icon;
            const active = form.partnerType === item.id;
            return (
              <button key={item.id} type="button" className={`choice-card partner-type-card ${active ? 'selected' : ''}`} onClick={() => update('partnerType', item.id)}>
                <Icon size={24} />
                <strong>{item.title}</strong>
                <span>{item.text}</span>
              </button>
            );
          })}
        </div>

        <div className="partner-form-grid">
          <section className="dashboard-card">
            <div className="dash-section-title">
              <span>Selected pathway</span>
              <h2><SelectedIcon size={26} /> {selectedType.title}</h2>
              <p>{selectedType.text}</p>
            </div>
            <div className="partner-pilot-steps">
              <article><strong>01</strong><span>Exploratory call</span><small>Confirm partner need, workflow, location and launch fit.</small></article>
              <article><strong>02</strong><span>4–8 week pilot</span><small>Test collection quality, logistics and result turnaround.</small></article>
              <article><strong>03</strong><span>Sign and scale</span><small>Move to full partnership, preferred listing or institutional route.</small></article>
            </div>
            <a className="secondary-button full" href="https://wa.me/233000000000?text=Hello%20HomeLabs%2C%20I%20want%20to%20discuss%20a%20partnership" target="_blank" rel="noreferrer"><MessageCircle size={17} /> Discuss on WhatsApp</a>
          </section>

          <form className="dashboard-card" onSubmit={submit}>
            <div className="dash-section-title">
              <span>Lead form</span>
              <h2>Partnership details</h2>
              <p>This frontend form is ready to connect to a backend lead endpoint.</p>
            </div>
            <div className="form-grid two">
              <Field label="Organisation"><input value={form.organisation} onChange={(event) => update('organisation', event.target.value)} placeholder="Organisation name" /></Field>
              <Field label="Contact name"><input value={form.contactName} onChange={(event) => update('contactName', event.target.value)} placeholder="Full name" /></Field>
              <Field label="Phone"><input value={form.phone} onChange={(event) => update('phone', event.target.value)} placeholder="+233..." /></Field>
              <Field label="Email"><input value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="name@organisation.com" /></Field>
              <Field label="Location"><input value={form.location} onChange={(event) => update('location', event.target.value)} placeholder="Kumasi" /></Field>
              <Field label="Partner type"><select value={form.partnerType} onChange={(event) => update('partnerType', event.target.value)}>{partnerTypes.map((type) => <option key={type.id} value={type.id}>{type.title}</option>)}</select></Field>
              <Field label="Message"><textarea value={form.message} onChange={(event) => update('message', event.target.value)} placeholder="Tell HomeLabs what you want to set up" /></Field>
            </div>
            {submitState.error && <div className="form-error-list"><strong>Submission issue</strong><ul><li>{submitState.error}</li></ul></div>}
            <button className="primary-button full" type="submit" disabled={submitState.loading}><Send size={17} /> {submitState.loading ? 'Submitting...' : 'Submit enquiry'}</button>
          </form>
        </div>
      </section>
    </main>
  );
}
