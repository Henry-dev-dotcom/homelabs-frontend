import { useState } from 'react';
import { PublicFooter } from './components/PublicFooter.jsx';
import { PublicHeader } from './components/PublicHeader.jsx';
import { BookingPage } from './pages/BookingPage.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { PartnerInquiryPage } from './pages/PartnerInquiryPage.jsx';
import { TrackPage } from './pages/TrackPage.jsx';

export default function App() {
  const [view, setView] = useState('home');
  const [role, setRole] = useState('operations');

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
    return <BookingPage onBackHome={showHome} onTrack={showTrack} />;
  }

  if (view === 'login') {
    return <LoginPage onBackHome={showHome} onLogin={openDashboard} selectedRole={role} onRoleChange={setRole} />;
  }

  if (view === 'track') {
    return <TrackPage onBackHome={showHome} onBook={showBooking} onLogin={showLogin} />;
  }

  if (view === 'partner') {
    return <PartnerInquiryPage onBackHome={showHome} onLogin={showLogin} />;
  }

  if (view === 'dashboard') {
    return <Dashboard role={role} onRoleChange={setRole} onBackHome={showHome} onLogout={showLogin} />;
  }

  return (
    <>
      <PublicHeader onBook={showBooking} onLogin={showLogin} onTrack={showTrack} onPartner={showPartnerInquiry} />
      <HomePage onBook={showBooking} onLogin={showLogin} onTrack={showTrack} onPartner={showPartnerInquiry} />
      <PublicFooter onBook={showBooking} onTrack={showTrack} onPartner={showPartnerInquiry} />
    </>
  );
}
