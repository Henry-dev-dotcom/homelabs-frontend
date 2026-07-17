import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { BrandMark } from './BrandMark.jsx';
import { contactInfo } from '../data/contactInfo.js';

export function PublicFooter({ onBook, onTrack, onPartner }) {
  return (
    <footer className="footer" id="contact">
      <div className="container footer-grid">
        <div>
          <BrandMark />
          <p className="footer-text">Leader in mobile phlebotomy services, Ghana. HomeLabs collects, tracks and delivers your samples to your referred or preferred laboratory for timely reports.</p>
          <div className="footer-cta-stack"><button className="primary-button" type="button" onClick={onBook}>Book a Home Lab Visit</button><button className="outline-button footer-outline" type="button" onClick={onTrack}>Track booking</button></div>
        </div>
        <div>
          <h3>Contact</h3>
          <ul className="contact-list">
            <li><Phone size={17} /> {contactInfo.phone}</li>
            <li><Mail size={17} /> {contactInfo.email}</li>
            <li><MessageCircle size={17} /> WhatsApp booking available</li>
            <li><MapPin size={17} /> {contactInfo.location}</li>
          </ul>
        </div>
        <div>
          <h3>Quick links</h3>
          <ul className="footer-links">
            <li><a href="#how">How it works</a></li>
            <li><a href="#patients">Patients</a></li>
            <li><a href="#clinicians">Clinicians</a></li>
            <li><a href="#labs">Laboratories</a></li>
            <li><button type="button" onClick={onPartner}>Partner enquiry</button></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} HomeLabs Ghana</span>
        <span>Ghana data-law compliance ready · Full chain of custody · Certified collection</span>
      </div>
    </footer>
  );
}
