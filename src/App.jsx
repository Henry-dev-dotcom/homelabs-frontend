import { lazy, Suspense, useState } from 'react';
import { PublicFooter } from './components/PublicFooter.jsx';
import { PublicHeader } from './components/PublicHeader.jsx';

const lazyNamed = (loader, exportName) => lazy(() => loader().then((module) => ({ default: module[exportName] })));

const BookingPage = lazyNamed(() => import('./pages/BookingPage.jsx'), 'BookingPage');
const Dashboard = lazyNamed(() => import('./pages/Dashboard.jsx'), 'Dashboard');
const HomePage = lazyNamed(() => import('./pages/HomePage.jsx'), 'HomePage');
const LoginPage = lazyNamed(() => import('./pages/LoginPage.jsx'), 'LoginPage');
const PartnerInquiryPage = lazyNamed(() => import('./pages/PartnerInquiryPage.jsx'), 'PartnerInquiryPage');
const TrackPage = lazyNamed(() => import('./pages/TrackPage.jsx'), 'TrackPage');

function RouteLoader({ label = 'Loading page' }) {
  return (
    <main className="route-loader" role="status" aria-live="polite">
      <span className="route-loader__spinner" aria-hidden="true" />
      <strong>{label}</strong>
      <small>Preparing only the code needed for this section.</small>
    </main>
  );
}

function LazyRoute({ label, children }) {
  return <Suspense fallback={<RouteLoader label={label} />}>{children}</Suspense>;
}

export default function App() {
  const [view, setView] = useState('home');
  const [role, setRole] = useState('patient');

  function goTo(nextView) {
    setView(nextView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showBooking() {
    goTo('booking');
  }

  function showHome() {
    goTo('home');
  }

  function showLogin() {
    goTo('login');
  }

  function showTrack() {
    goTo('track');
  }

  function showPartnerInquiry() {
    goTo('partner');
  }

  function openDashboard(selectedRole = role) {
    setRole(selectedRole);
    goTo('dashboard');
  }

  if (view === 'booking') {
    return (
      <LazyRoute label="Loading booking page">
        <BookingPage onBackHome={showHome} onTrack={showTrack} />
      </LazyRoute>
    );
  }

  if (view === 'login') {
    return (
      <LazyRoute label="Loading login page">
        <LoginPage onBackHome={showHome} onLogin={openDashboard} selectedRole={role} onRoleChange={setRole} />
      </LazyRoute>
    );
  }

  if (view === 'track') {
    return (
      <LazyRoute label="Loading tracking page">
        <TrackPage onBackHome={showHome} onBook={showBooking} onLogin={showLogin} />
      </LazyRoute>
    );
  }

  if (view === 'partner') {
    return (
      <LazyRoute label="Loading partner inquiry page">
        <PartnerInquiryPage onBackHome={showHome} onLogin={showLogin} />
      </LazyRoute>
    );
  }

  if (view === 'dashboard') {
    return (
      <LazyRoute label="Loading dashboard">
        <Dashboard role={role} onRoleChange={setRole} onBackHome={showHome} onLogout={showLogin} />
      </LazyRoute>
    );
  }

  return (
    <>
      <PublicHeader onBook={showBooking} onLogin={showLogin} onTrack={showTrack} onPartner={showPartnerInquiry} />
      <LazyRoute label="Loading HomeLabs homepage">
        <HomePage onBook={showBooking} onLogin={showLogin} onTrack={showTrack} onPartner={showPartnerInquiry} />
      </LazyRoute>
      <PublicFooter onBook={showBooking} onTrack={showTrack} onPartner={showPartnerInquiry} />
    </>
  );
}
