import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  FlaskConical,
  HeartPulse,
  Home,
  Hospital,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Stethoscope,
  Thermometer,
  Truck,
  UserRoundCheck
} from 'lucide-react';
import { faqs } from '../data/homelabsData.js';
import { buildWhatsAppBookingUrl } from '../services/notificationService.js';

const howSteps = [
  { icon: ClipboardCheck, title: 'Order or request', text: 'Patients, clinicians or support staff create a booking from web, phone or WhatsApp.' },
  { icon: CheckCircle2, title: 'Patient scheduled', text: 'HomeLabs confirms the patient details, location, preparation instructions and time slot.' },
  { icon: UserRoundCheck, title: 'Certified collection', text: 'A certified phlebotomist collects the sample using sterile, single-use equipment.' },
  { icon: Truck, title: 'Safe delivery', text: 'Specimens are transported to HomeLabs Lab or a selected partner lab with tracking.' },
  { icon: FlaskConical, title: 'Results delivered', text: 'Results are uploaded and released to the patient, clinician, or both according to the request.' }
];

const trustItems = [
  { icon: ShieldCheck, title: 'Certified mobile phlebotomists', text: 'Trained collection staff for safe field sample collection.' },
  { icon: Thermometer, title: 'Temperature-aware transport', text: 'Specimen movement designed to protect sample integrity.' },
  { icon: ClipboardCheck, title: 'Full chain of custody', text: 'Each sample is documented from collection to lab receipt.' },
  { icon: MessageCircle, title: 'WhatsApp-assisted booking', text: 'Patients can book through WhatsApp and support staff can complete requests.' }
];

const audiences = [
  { id: 'patients', icon: Home, title: 'Patients', text: 'Book lab collection from your home, office or care facility without joining a clinic queue.', cta: 'Book a visit' },
  { id: 'clinicians', icon: Stethoscope, title: 'Clinicians', text: 'Request tests for patients, track collection progress and receive released results.', cta: 'Open clinician portal' },
  { id: 'labs', icon: FlaskConical, title: 'Laboratories', text: 'Receive lab-ready samples, confirm receipt and upload results through the lab portal.', cta: 'Become a partner lab' },
  { id: 'hospitals', icon: Hospital, title: 'Hospitals', text: 'Extend care beyond the facility, improve follow-up completion and reduce routine draw pressure.', cta: 'Partner with us' }
];

export function HomePage({ onBook, onLogin, onTrack, onPartner }) {
  return (
    <main>
      <section className="hero-section" id="home">
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="eyebrow"><span /> Ghana's mobile phlebotomy service</div>
            <h1>We Bring the Lab to the Patient.</h1>
            <p className="hero-text">Certified blood and sample collection at home, office, or care facility in Kumasi — with reliable transport to HomeLabs Laboratory or the patient’s preferred partner lab.</p>
            <div className="hero-actions">
              <button className="primary-button large" type="button" onClick={onBook}>Book a Home Lab Visit <ArrowRight size={18} /></button>
              <a className="secondary-button large" href={buildWhatsAppBookingUrl('Hello HomeLabs, I want to book a home lab visit')} target="_blank" rel="noreferrer"><MessageCircle size={18} /> Book on WhatsApp</a>
              <button className="outline-button large" type="button" onClick={onTrack}>Track booking</button>
            </div>
            <div className="hero-note">Patients choose their lab, use HomeLabs Laboratory, or allow HomeLabs to recommend the best option.</div>
          </div>

          <div className="hero-card" aria-label="HomeLabs service summary">
            <div className="hero-card-top">
              <div className="floating-icon"><Home size={38} /><CheckCircle2 size={25} /></div>
              <p>Lab Tests Shouldn’t Be</p>
              <strong>Stress Tests.</strong>
            </div>
            <div className="hero-card-body">
              <div><span>Launch city</span><strong>Kumasi</strong></div>
              <div><span>Collection</span><strong>Home · Office · Care facility</strong></div>
              <div><span>Payment</span><strong>Paystack Mobile Money</strong></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section light" id="how">
        <div className="container">
          <div className="section-heading centered">
            <span>How it works</span>
            <h2>Five steps. Zero disruption.</h2>
            <p>HomeLabs manages the path from request to sample collection, lab delivery and secure result release.</p>
          </div>
          <div className="steps-grid">
            {howSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <article className="step-card" key={step.title}>
                  <div className="step-number">{String(index + 1).padStart(2, '0')}</div>
                  <Icon size={26} />
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section" id="patients">
        <div className="container split-section">
          <div className="section-heading">
            <span>For patients</span>
            <h2>Book your lab test without leaving your space.</h2>
            <p>Patients can select a test, upload a request form, choose a preferred laboratory or ask HomeLabs to recommend one, then pay through Paystack-supported mobile money.</p>
            <button className="primary-button" type="button" onClick={onBook}>Start patient booking</button>
          </div>
          <div className="feature-stack">
            {trustItems.map((item) => {
              const Icon = item.icon;
              return (
                <article className="feature-row" key={item.title}>
                  <div><Icon size={24} /></div>
                  <section>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </section>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section light" id="clinicians">
        <div className="container">
          <div className="section-heading centered">
            <span>Who we serve</span>
            <h2>One platform for patients, clinicians, labs and hospitals.</h2>
          </div>
          <div className="audience-grid">
            {audiences.map((item) => {
              const Icon = item.icon;
              return (
                <article className="audience-card" id={item.id} key={item.title}>
                  <div className="audience-icon"><Icon size={26} /></div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                  <button type="button" onClick={item.id === 'patients' ? onBook : onPartner}>{item.cta}</button>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section" id="labs">
        <div className="container lab-section-card">
          <div>
            <div className="eyebrow dark"><span /> laboratory routing</div>
            <h2>HomeLabs Laboratory + partner labs.</h2>
            <p>Patients can use HomeLabs Laboratory, select a partner laboratory, or let HomeLabs recommend based on test availability, location, turnaround time and operational capacity.</p>
          </div>
          <div className="lab-choice-grid">
            <div><Building2 size={24} /><strong>HomeLabs Lab</strong><span>Owned processing pathway</span></div>
            <div><FlaskConical size={24} /><strong>Partner Lab</strong><span>Patient-selected pathway</span></div>
            <div><HeartPulse size={24} /><strong>Recommended</strong><span>HomeLabs-assisted matching</span></div>
          </div>
        </div>
      </section>

      <section className="section light">
        <div className="container service-area-card">
          <MapPin size={34} />
          <div>
            <span>Launch coverage</span>
            <h2>Kumasi first. Built to expand.</h2>
            <p>The frontend is configured for Kumasi as the MVP launch location, while keeping the structure ready for Accra, Takoradi and Tamale expansion later.</p>
          </div>
          <div className="service-area-actions"><button className="secondary-button" type="button" onClick={onBook}>Check booking form</button><button className="outline-button" type="button" onClick={onPartner}>Partner with us</button></div>
        </div>
      </section>

      <section className="section" id="faq">
        <div className="container">
          <div className="section-heading centered">
            <span>FAQ</span>
            <h2>Common patient questions.</h2>
          </div>
          <div className="faq-grid">
            {faqs.map((faq) => (
              <article className="faq-card" key={faq.question}>
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
