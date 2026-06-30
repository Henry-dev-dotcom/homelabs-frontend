import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, LockKeyhole, ShieldCheck } from 'lucide-react';
import { BrandMark } from '../components/BrandMark.jsx';
import { roles } from '../data/dashboardData.js';
import { login, roleToDemoEmail } from '../services/authService.js';
import { USE_MOCKS } from '../services/apiClient.js';

export function LoginPage({ onBackHome, onLogin, selectedRole, onRoleChange }) {
  const defaultEmail = useMemo(() => roleToDemoEmail[selectedRole] || 'operations@homelabs.gh', [selectedRole]);
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function changeRole(role) {
    onRoleChange(role);
    setEmail(roleToDemoEmail[role] || `${role}@homelabs.gh`);
    setError('');
  }

  async function handleLogin() {
    setLoading(true);
    setError('');
    try {
      const result = await login({ email, password, role: selectedRole });
      onLogin(result.user?.role || selectedRole);
    } catch (err) {
      setError(err.message || 'Login failed. Check the backend connection and credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-shell container">
        <div className="login-panel">
          <button className="ghost-button dark-text" type="button" onClick={onBackHome}><ArrowLeft size={17} /> Back to website</button>
          <BrandMark />
          <span className="login-eyebrow">Portal access</span>
          <h1>{USE_MOCKS ? 'Choose a role to preview the HomeLabs dashboard.' : 'Sign into the connected HomeLabs backend.'}</h1>
          <p>{USE_MOCKS ? 'This frontend stage includes the authenticated shell and role-based dashboard previews for operations, admin, patients, clinicians, phlebotomists and lab staff.' : 'Connected mode uses the Express backend, seeded demo users and role-based API authorization.'}</p>
          <div className="login-assurance">
            <ShieldCheck size={22} />
            <span>{USE_MOCKS ? 'Mock role-based access is active.' : 'Backend authentication is active. Demo password: password123.'}</span>
          </div>
        </div>

        <div className="login-card">
          <div className="login-card-head">
            <div className="step-emblem"><LockKeyhole size={22} /></div>
            <div>
              <span>{USE_MOCKS ? 'Demo login' : 'Backend login'}</span>
              <h2>Access dashboard</h2>
            </div>
          </div>

          <label className="field">
            <span>Select portal</span>
            <select value={selectedRole} onChange={(event) => changeRole(event.target.value)}>
              {roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
            </select>
          </label>

          <div className="form-grid">
            <label className="field">
              <span>Email</span>
              <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder={defaultEmail} />
            </label>
            <label className="field">
              <span>Password</span>
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="password123" />
            </label>
          </div>

          {error && <div className="form-error-list"><strong>Login issue</strong><ul><li>{error}</li></ul></div>}

          <div className="role-preview-list">
            {roles.map((role) => (
              <button key={role.id} type="button" className={`role-preview ${selectedRole === role.id ? 'active' : ''}`} onClick={() => changeRole(role.id)}>
                <strong>{role.name}</strong>
                <span>{role.description}</span>
              </button>
            ))}
          </div>

          <button className="primary-button full" type="button" onClick={handleLogin} disabled={loading}>{loading ? 'Signing in...' : 'Open selected portal'} <ArrowRight size={17} /></button>
          <small className="form-note">{USE_MOCKS ? 'Set VITE_USE_MOCKS=false to use the backend API.' : 'Backend mode expects the backend at VITE_API_BASE_URL.'}</small>
        </div>
      </section>
    </main>
  );
}
