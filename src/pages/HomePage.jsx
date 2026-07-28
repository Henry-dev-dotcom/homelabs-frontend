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
  Plus,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Thermometer,
  Truck,
  UserRoundCheck
} from 'lucide-react';
import { faqs } from '../data/homelabsData.js';
import { buildWhatsAppBookingUrl } from '../services/notificationService.js';
import { useReveal } from '../lib/useReveal.js';
import heroHomeVisit from '../assets/hero-home-visit.jpg';

const howSteps = [
  { icon: ClipboardCheck, title: 'Order or request', text: 'Patients, clinicians or support staff create a booking from web, phone or WhatsApp.' },
  { icon: CheckCircle2, title: 'Request confirmed', text: 'HomeLabs confirms your request and prepares collection.' },
  { icon: UserRoundCheck, title: 'Certified collection', text: 'A certified phlebotomist visits you to collect samples with care.' },
  { icon: Truck, title: 'Lab delivery', text: 'Samples move to your chosen or clinician-recommended laboratory.' },
  { icon: FlaskConical, title: 'Reports delivered', text: 'You receive reports as hard copy, soft copy or both.' }
];

const trustItems = [
  { icon: ShieldCheck, title: 'Certified mobile phlebotomists', text: 'Trained collection staff for safe field sample collection.' },
  { icon: Thermometer, title: 'Temperature control', text: 'Suitable temperature is maintained for samples throughout transport.' },
  { icon: ClipboardCheck, title: 'Full chain of custody', text: 'Each sample is documented from collection to lab receipt.' },
  { icon: MessageCircle, title: 'WhatsApp-assisted booking', text: 'Patients can book through WhatsApp and support staff can complete requests.' }
];

export function HomePage({ onBook, onLogin, onTrack, onPartner }) {
  const howRef = useReveal();
  const patientsRef = useReveal();
  const audienceRef = useReveal();
  const labsRef = useReveal();
  const coverageRef = useReveal();
  const faqRef = useReveal();

  return (
    <main>
      <section className="hero-section" id="home" style={{ '--hero-photo': `url(${heroHomeVisit})` }}>
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="eyebrow"><span /> Leader in mobile phlebotomy services, Ghana</div>
            <h1>We bring the lab to the patient.</h1>
            <p className="hero-text">Certified phlebotomists collect your samples at home, office or care facility and deliver them to your lab of choice.</p>
            <div className="hero-actions">
              <button className="primary-button large" type="button" onClick={onBook}>Book a Home Lab Visit <span className="btn-icon-chip"><ArrowRight size={14} /></span></button>
              <a className="whatsapp-button dark" href={buildWhatsAppBookingUrl('Hello HomeLabs, I want to book a home lab visit')} target="_blank" rel="noreferrer"><MessageCircle size={18} /> Book on WhatsApp</a>
            </div>
          </div>

          <div className="bezel-outer">
            <div className="hero-card bezel-inner" aria-label="HomeLabs service summary">
              <div className="hero-card-top">
                <span>Field-ready collection</span>
                <strong>Lab tests shouldn't be stress tests.</strong>
              </div>
              <div className="hero-card-body">
                <div><span>Location</span><strong>Remote</strong></div>
                <div><span>Collection</span><strong>Home · Office · Care facility</strong></div>
                <div><span>Payment</span><strong>Paystack Mobile Money</strong></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section light reveal" id="how" ref={howRef}>
        <div className="container">
          <div className="section-heading centered">
            <h2>Five steps. Zero disruption.</h2>
            <p>HomeLabs manages the path from request to sample collection, lab delivery and secure result release.</p>
          </div>
          <div className="steps-rail">
            {howSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <article className="step-item" key={step.title}>
                  <span className="step-item-number">{String(index + 1).padStart(2, '0')}</span>
                  <Icon size={24} />
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section reveal" id="patients" ref={patientsRef}>
        <div className="container split-section">
          <div className="section-heading">
            <h2>Book your lab test without leaving your space.</h2>
            <p>Select a test, upload a request form, choose a preferred laboratory or let HomeLabs recommend one, then pay by mobile money.</p>
            <button className="primary-button" type="button" onClick={onBook}>Book a Home Lab Visit</button>
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

      <section className="section light reveal" id="clinicians" ref={audienceRef}>
        <div className="container">
          <div className="section-heading centered">
            <h2>One platform for patients, clinicians, labs and hospitals.</h2>
          </div>
          <div className="audience-bento">
            <article className="audience-card featured" id="patients-audience">
              <div className="audience-icon"><Home size={26} /></div>
              <h3>Patients</h3>
              <p>Book lab collection from your home, office or care facility without joining a clinic queue.</p>
              <button type="button" onClick={onBook}>Book a Home Lab Visit <span className="btn-icon-chip"><ArrowRight size={13} /></span></button>
            </article>
            <article className="audience-card" id="clinicians-audience">
              <div className="audience-icon"><Stethoscope size={22} /></div>
              <div className="audience-copy">
                <h3>Clinicians</h3>
                <p>Request tests for patients, track collection and receive released results.</p>
                <button type="button" onClick={onLogin}>Open clinician portal <ArrowRight size={16} /></button>
              </div>
            </article>
            <article className="audience-card" id="labs-audience">
              <div className="audience-icon"><FlaskConical size={22} /></div>
              <div className="audience-copy">
                <h3>Laboratories</h3>
                <p>Receive lab-ready samples, confirm receipt and upload results.</p>
                <button type="button" onClick={onPartner}>Partner with us <ArrowRight size={16} /></button>
              </div>
            </article>
            <article className="audience-card" id="hospitals-audience">
              <div className="audience-icon"><Hospital size={22} /></div>
              <div className="audience-copy">
                <h3>Hospitals</h3>
                <p>Extend care beyond the facility and reduce routine draw pressure.</p>
                <button type="button" onClick={onPartner}>Partner with us <ArrowRight size={16} /></button>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="section reveal" id="labs" ref={labsRef}>
        <div className="container lab-section-card">
          <div>
            <div className="eyebrow dark"><span /> Laboratory routing</div>
            <h2>HomeLabs Laboratory + partner labs.</h2>
            <p>Use HomeLabs Laboratory, select a partner laboratory, or let HomeLabs recommend based on test availability, location and turnaround time.</p>
          </div>
          <div className="lab-choice-list">
            <div className="lab-choice-row">
              <Building2 size={22} />
              <div><strong>HomeLabs Lab</strong><span>Owned processing pathway</span></div>
            </div>
            <div className="lab-choice-row">
              <FlaskConical size={22} />
              <div><strong>Partner Lab</strong><span>Patient-selected pathway</span></div>
            </div>
            <div className="lab-choice-row recommended">
              <HeartPulse size={22} />
              <div><strong>Recommended</strong><span>HomeLabs-assisted matching</span></div>
              <span className="badge"><Sparkles size={12} style={{ marginRight: 4, verticalAlign: -2 }} />Most chosen</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section light reveal" ref={coverageRef}>
        <div className="container service-area-card photo" style={{ backgroundImage: 'url(https://picsum.photos/seed/homelabs-ghana-coverage/1200/500)' }}>
          <MapPin size={34} />
          <div>
            <span>Coverage</span>
            <h2>Remote-first. We come to you.</h2>
            <p>Book online, by phone or on WhatsApp, and a certified phlebotomist is dispatched to your home, office or care facility.</p>
          </div>
          <div className="service-area-actions">
            <button className="secondary-button" type="button" onClick={onBook}>Book a Home Lab Visit</button>
            <button className="outline-button" type="button" onClick={onPartner}>Partner with us</button>
          </div>
        </div>
      </section>

      <section className="section reveal" id="faq" ref={faqRef}>
        <div className="container">
          <div className="section-heading centered">
            <h2>Common patient questions.</h2>
          </div>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <details className="faq-item" key={faq.question} open={index === 0}>
                <summary>{faq.question} <Plus size={18} /></summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
