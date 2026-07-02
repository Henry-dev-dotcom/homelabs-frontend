import { lazy, Suspense, useEffect, useState } from 'react';
import { PublicFooter } from './components/PublicFooter.jsx';
import { PublicHeader } from './components/PublicHeader.jsx';
import { getSession, getStoredUser, logout as clearSession } from './services/authService.js';

const lazyNamed = (loader, exportName) => lazy(() => loader().then((module) => ({ default: module[exportName] })));

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
  const [user, setUser] = useState(() => getStoredUser());
  const [bookingIntent, setBookingIntent] = useState(false);
  const [authMode, setAuthMode] = useState('signin');

  // Silently verify a restored session; clear it if the token is stale.
  useEffect(() => {
    if (!getStoredUser()) return;
    getSession()
      .then((session) => setUser({ ...session.user, role: session.role }))
      .catch((error) => {
        // Only drop the session when the backend explicitly rejects the
        // token — a flaky network should not log the patient out.
        if (error?.status === 401 || error?.status === 403) {
          clearSession();
          setUser(null);
        }
      });
  }, []);

  function goTo(nextView) {
    setView(nextView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showHome() {
    setBookingIntent(false);
    goTo('home');
  }

  function showLogin() {
    setAuthMode('signin');
    goTo('login');
  }

  function showSignup() {
    setAuthMode('signup');
    goTo('login');
  }

  function showTrack() {
    goTo('track');
  }

  function showPartnerInquiry() {
    goTo('partner');
  }

  // Booking now lives inside the patient portal. Guests are sent to
  // sign in / sign up first, then land directly on the booking section.
  function showBooking() {
    if (user) {
      setBookingIntent(user.role === 'patient');
      goTo('dashboard');
      return;
    }
    setBookingIntent(true);
    setAuthMode('signup');
    goTo('login');
  }

  function handleLogin(role, loggedInUser) {
    setUser({ ...(loggedInUser || {}), role });
    goTo('dashboard');
  }

  function handleLogout() {
    clearSession();
    setUser(null);
    setBookingIntent(false);
    goTo('login');
  }

  if (view === 'login') {
    return (
      <LazyRoute label="Loading login page">
        <LoginPage onBackHome={showHome} onLogin={handleLogin} initialMode={authMode} />
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

  if (view === 'dashboard' && user) {
    return (
      <LazyRoute label="Loading dashboard">
        <Dashboard
          role={user.role}
          user={user}
          initialSection={bookingIntent && user.role === 'patient' ? 'book' : undefined}
          onBackHome={showHome}
          onLogout={handleLogout}
        />
      </LazyRoute>
    );
  }

  return (
    <>
      <PublicHeader onBook={showBooking} onLogin={showLogin} onSignup={showSignup} onTrack={showTrack} onPartner={showPartnerInquiry} />
      <LazyRoute label="Loading HomeLabs homepage">
        <HomePage onBook={showBooking} onLogin={showLogin} onTrack={showTrack} onPartner={showPartnerInquiry} />
      </LazyRoute>
      <PublicFooter onBook={showBooking} onTrack={showTrack} onPartner={showPartnerInquiry} />
    </>
  );
}
