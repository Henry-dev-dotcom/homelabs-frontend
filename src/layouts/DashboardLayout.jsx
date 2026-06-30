import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  CalendarClock,
  Cable,
  ClipboardCheck,
  CreditCard,
  FileText,
  FlaskConical,
  Home,
  ListChecks,
  MapPin,
  MessageCircle,
  Plus,
  Search,
  Settings,
  Stethoscope,
  Truck,
  UserRound,
  UsersRound
} from 'lucide-react';
import { BrandMark } from '../components/BrandMark.jsx';
import { roles } from '../data/dashboardData.js';
import { dashboardAccessLabels } from '../lib/permissions.js';

export const sidebarItems = {
  operations: [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'queue', label: 'Booking Queue', icon: ClipboardCheck },
    { id: 'whatsapp', label: 'WhatsApp Booking', icon: MessageCircle },
    { id: 'assignment', label: 'Assignment Board', icon: Truck },
    { id: 'exceptions', label: 'Exceptions', icon: AlertTriangle }
  ],
  admin: [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users & Staff', icon: UsersRound },
    { id: 'tests', label: 'Test Catalog', icon: FlaskConical },
    { id: 'labs', label: 'Labs & Partners', icon: Home },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'qa', label: 'QA Center', icon: ListChecks },
    { id: 'integration', label: 'API Readiness', icon: Cable },
    { id: 'settings', label: 'Settings', icon: Settings }
  ],
  patient: [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'bookings', label: 'My Bookings', icon: CalendarClock },
    { id: 'details', label: 'Booking Details', icon: ClipboardCheck },
    { id: 'results', label: 'Results', icon: FileText },
    { id: 'profile', label: 'Profile', icon: UserRound }
  ],
  clinician: [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'new', label: 'New Request', icon: Plus },
    { id: 'active', label: 'Active Requests', icon: Stethoscope },
    { id: 'completed', label: 'Completed', icon: ClipboardCheck },
    { id: 'results', label: 'Results Inbox', icon: FileText }
  ],
  phlebotomist: [
    { id: 'overview', label: 'Today', icon: CalendarClock },
    { id: 'assignment', label: 'Assignments', icon: MapPin },
    { id: 'checklist', label: 'Checklist', icon: ListChecks },
    { id: 'handover', label: 'Handover', icon: Truck }
  ],
  lab: [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'incoming', label: 'Incoming Samples', icon: FlaskConical },
    { id: 'processing', label: 'Processing', icon: ClipboardCheck },
    { id: 'results', label: 'Result Upload', icon: FileText },
    { id: 'rejected', label: 'Rejected Samples', icon: AlertTriangle }
  ]
};

const roleTitles = {
  operations: 'Operations Dashboard',
  admin: 'Admin Control Centre',
  patient: 'Patient Portal',
  clinician: 'Clinician Portal',
  phlebotomist: 'Phlebotomist Portal',
  lab: 'Laboratory Portal'
};

export function getFirstSectionForRole(role) {
  return sidebarItems[role]?.[0]?.id || 'overview';
}

export function DashboardLayout({ role, activePage, onActivePageChange, onRoleChange, onBackHome, onLogout, children }) {
  const roleDetails = roles.find((item) => item.id === role) || roles[0];
  const items = sidebarItems[role] || sidebarItems.operations;

  return (
    <main className="dashboard-app">
      <aside className="dashboard-sidebar">
        <button className="back-button" type="button" onClick={onBackHome}><ArrowLeft size={16} /> Website</button>
        <BrandMark />
        <div className="portal-switcher">
          <span>Preview role</span>
          <select value={role} onChange={(event) => onRoleChange(event.target.value)}>
            {roles.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </div>
        <nav className="dashboard-nav">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} type="button" className={activePage === item.id ? 'active' : ''} onClick={() => onActivePageChange(item.id)}>
                <Icon size={18} /> {item.label}
              </button>
            );
          })}
        </nav>
        <button className="secondary-button full" type="button" onClick={onLogout}>Logout</button>
      </aside>

      <section className="dashboard-main">
        <header className="dashboard-topbar">
          <div>
            <span>{roleDetails.name}</span>
            <h1>{roleTitles[role]}</h1>
            <p>{dashboardAccessLabels[role] || roleDetails.description}</p>
          </div>
          <div className="dashboard-search"><Search size={18} /><input placeholder="Search bookings, patients, samples..." /></div>
        </header>
        {children}
      </section>
    </main>
  );
}
