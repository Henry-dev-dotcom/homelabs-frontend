import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, ClipboardCheck, Download, FlaskConical, Search, ShieldCheck, Truck } from 'lucide-react';
import { MiniRecord, StatusBadge, Timeline } from '../components/dashboard/DashboardPrimitives.jsx';
import { trackBooking } from '../services/trackingService.js';

export function TrackPage({ onBackHome, onBook, onLogin }) {
  const recentBooking = readRecentBooking();
  const defaultId = recentBooking?.id || '';
  const [query, setQuery] = useState(defaultId);
  const [submittedQuery, setSubmittedQuery] = useState(defaultId);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const trimmedQuery = String(submittedQuery || '').trim();
    if (!trimmedQuery) {
      setTracking(null);
      setLoading(false);
      setError('');
      return undefined;
    }
    let active = true;
    setLoading(true);
    setError('');
    trackBooking(trimmedQuery)
      .then((result) => { if (active) setTracking(result); })
      .catch((err) => { if (active) setError(err.message || 'Unable to track booking.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [submittedQuery]);

  const booking = tracking?.booking || recentBooking || {
    id: defaultId,
    patient: 'Patient',
    tests: ['Tracking details loading'],
    area: 'Kumasi',
    source: 'Tracking portal',
    lab: 'Pending',
    labMode: 'Pending',
    time: 'Schedule pending',
    address: 'Address hidden',
    status: 'Under Review',
    payment: 'Pending',
    phlebotomist: 'Unassigned',
    priority: 'Routine'
  };
  const progress = tracking?.progress || 0;
  const timeline = (tracking?.timeline || []).slice(0, 14);

  function handleSubmit(event) {
    event.preventDefault();
    const value = String(query || '').trim();
    if (!value) {
      setError('Enter your secure booking code to track a booking.');
      return;
    }
    setSubmittedQuery(value);
  }

  return (
    <main className="booking-page public-tool-page">
      <section className="booking-hero">
        <div className="container booking-hero-inner">
          <button className="ghost-button" type="button" onClick={onBackHome}><ArrowLeft size={17} /> Back to website</button>
          <div>
            <span>Public tracking</span>
            <h1>Track a HomeLabs booking.</h1>
            <p>Patients and clinicians can preview how a real booking status will move from review to collection, lab processing and result release.</p>
          </div>
          <button className="whatsapp-button dark" type="button" onClick={onBook}>Book new visit</button>
        </div>
      </section>

      <section className="container tracker-shell">
        <div className="tracker-search-card">
          <form onSubmit={handleSubmit}>
            <label>
              <span>Booking ID</span>
              <div className="input-with-icon">
                <Search size={18} />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Enter your secure booking code" />
              </div>
            </label>
            <button className="primary-button" type="submit" disabled={loading}>{loading ? 'Tracking...' : 'Track booking'}</button>
          </form>
          <small>Enter the secure booking code returned after booking.</small>
          {error && <div className="form-error-list"><strong>Tracking issue</strong><ul><li>{error}</li></ul></div>}
        </div>

        <div className="tracker-grid">
          <section className="dashboard-card tracker-main-card">
            <div className="tracker-heading">
              <div>
                <span>Current booking</span>
                <h2>{booking.id} · {booking.patient}</h2>
                <p>{booking.tests.join(', ')} · {booking.area}</p>
              </div>
              <StatusBadge status={booking.status} />
            </div>

            <div className="progress-shell">
              <div className="progress-bar"><span style={{ width: `${progress}%` }} /></div>
              <strong>{progress}% workflow progress</strong>
            </div>

            <div className="detail-grid compact-details">
              <span>Source</span><strong>{booking.source}</strong>
              <span>Laboratory</span><strong>{booking.lab}</strong>
              <span>Lab model</span><strong>{booking.labMode}</strong>
              <span>Appointment</span><strong>{booking.time}</strong>
              <span>Address</span><strong>{booking.address}</strong>
              <span>Payment</span><strong>{booking.payment}</strong>
              <span>Phlebotomist</span><strong>{booking.phlebotomist}</strong>
              <span>Priority</span><strong>{booking.priority}</strong>
            </div>

            {tracking?.nextAction && <div className="alert-card"><ShieldCheck size={20} /><span>{tracking.nextAction}</span></div>}

            <div className="tracker-actions">
              <button className="secondary-button" type="button" onClick={onLogin}><ClipboardCheck size={17} /> Open portal preview</button>
              <button className="primary-button" type="button" disabled={!tracking?.resultAvailable}><Download size={17} /> {tracking?.resultAvailable ? 'Result available' : 'Result pending'}</button>
            </div>
          </section>

          <section className="dashboard-card">
            <div className="dash-section-title">
              <span>Status timeline</span>
              <h2>Chain of custody view</h2>
              <p>The connected backend stores timestamps, staff ID, sample ID, handover notes and result release logs.</p>
            </div>
            <Timeline items={timeline} />
          </section>
        </div>

        <section className="tracking-milestones">
          <MiniRecord title="Collection confirmed" meta="Patient identity, consent and sample type are checked before collection." status="Field standard" action={<CheckCircle2 size={20} />} />
          <MiniRecord title="Transport protected" meta="Sample is moved to HomeLabs Laboratory or partner lab with documented handover." status="Chain of custody" action={<Truck size={20} />} />
          <MiniRecord title="Lab processing" meta="Lab confirms receipt before processing and result upload." status="Lab workflow" action={<FlaskConical size={20} />} />
          <MiniRecord title="Secure release" meta="Result goes to patient, clinician or both based on request type and release rule." status="Access controlled" action={<ShieldCheck size={20} />} />
        </section>
      </section>
    </main>
  );
}

function readRecentBooking() {
  try {
    const raw = sessionStorage.getItem('homelabs_recent_booking') || localStorage.getItem('homelabs_recent_booking');
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.id ? { id: parsed.id } : null;
  } catch {
    return null;
  }
}
