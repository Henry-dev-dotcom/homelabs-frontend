import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { BrandMark } from './BrandMark.jsx';

export function PublicFooter({ onBook, onTrack, onPartner }) {
  return (
    <footer className="footer" id="contact">
      <div className="container footer-grid">
        <div>
          <BrandMark />
          <p className="footer-text">Certified mobile sample collection in Kumasi. HomeLabs collects, tracks and delivers specimens to HomeLabs Laboratory or selected partner labs.</p>
          <div className="footer-cta-stack"><button className="primary-button" type="button" onClick={onBook}>Book a Home Lab Visit</button><button className="outline-button footer-outline" type="button" onClick={onTrack}>Track booking</button></div>
        </div>
        <div>
          <h3>Contact</h3>
          <ul className="contact-list">
            <li><Phone size={17} /> +233 00 000 0000</li>
            <li><Mail size={17} /> hello@homelabs.gh</li>
            <li><MessageCircle size={17} /> WhatsApp booking available</li>
            <li><MapPin size={17} /> Kumasi, Ghana</li>
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
