import { Menu, MessageCircle, X } from 'lucide-react';
import { useState } from 'react';
import { BrandMark } from './BrandMark.jsx';

const nav = [
  { label: 'Home', href: '#home' },
  { label: 'How it works', href: '#how' },
  { label: 'For clinicians', href: '#clinicians' },
  { label: 'For labs', href: '#labs' },
  { label: 'FAQ', href: '#faq' }
];

export function PublicHeader({ onBook, onLogin, onTrack, onPartner }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="container header-inner">
        <a className="logo-link" href="#home" aria-label="HomeLabs home">
          <BrandMark />
        </a>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {nav.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
        </nav>

        <div className="header-actions">
          <a className="whatsapp-button" href="https://wa.me/233000000000?text=Hello%20HomeLabs%2C%20I%20want%20to%20book%20a%20home%20lab%20visit" target="_blank" rel="noreferrer">
            <MessageCircle size={17} /> WhatsApp
          </a>
          <button className="secondary-button small portal-login-button" type="button" onClick={onTrack}>Track</button>
          <button className="secondary-button small portal-login-button" type="button" onClick={onLogin}>Portal login</button>
          <button className="primary-button small" type="button" onClick={onBook}>Book visit</button>
          <button className="mobile-menu-button" type="button" onClick={() => setOpen((value) => !value)} aria-label="Open menu">
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="mobile-nav container" aria-label="Mobile navigation">
          {nav.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setOpen(false)}>{item.label}</a>
          ))}
          <button className="secondary-button" type="button" onClick={() => { setOpen(false); onTrack(); }}>Track booking</button>
          <button className="secondary-button" type="button" onClick={() => { setOpen(false); onPartner(); }}>Partner with us</button>
          <button className="secondary-button" type="button" onClick={() => { setOpen(false); onLogin(); }}>Portal login</button>
          <button className="primary-button" type="button" onClick={() => { setOpen(false); onBook(); }}>Book a Home Lab Visit</button>
        </nav>
      )}
    </header>
  );
}
