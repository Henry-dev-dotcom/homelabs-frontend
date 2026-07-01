import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, LockKeyhole, ShieldCheck } from 'lucide-react';
import { BrandMark } from '../components/BrandMark.jsx';
import { roles } from '../data/dashboardData.js';
import { googleLogin, login } from '../services/authService.js';
import { GOOGLE_CLIENT_ID, loadGoogleIdentityScript } from '../services/googleIdentityService.js';

export function LoginPage({ onBackHome, onLogin, selectedRole, onRoleChange }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const googleButtonRef = useRef(null);

  function changeRole(role) {
    onRoleChange(role);
    setError('');
  }


  async function handleGoogleCredential(response) {
    if (!response?.credential) {
      setError('Google did not return a valid sign-in credential.');
      return;
    }
    setGoogleLoading(true);
    setError('');
    try {
      const result = await googleLogin({ credential: response.credential, role: selectedRole });
      onLogin(result.user?.role || selectedRole);
    } catch (err) {
      setError(err.message || 'Google sign-in failed. Please try again or use email and password.');
    } finally {
      setGoogleLoading(false);
    }
  }

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !googleButtonRef.current) return undefined;
    let cancelled = false;

    loadGoogleIdentityScript()
      .then((google) => {
        if (cancelled || !googleButtonRef.current) return;
        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredential,
          ux_mode: 'popup',
          auto_select: false,
          cancel_on_tap_outside: true
        });
        googleButtonRef.current.replaceChildren();
        google.accounts.id.renderButton(googleButtonRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
          width: 340
        });
      })
      .catch(() => {
        if (!cancelled) setError('Google sign-in is not available. Check the frontend Google Client ID configuration.');
      });

    return () => { cancelled = true; };
  }, [selectedRole]);

  async function handleLogin() {
    setLoading(true);
    setError('');
    try {
      const result = await login({ email, password, role: selectedRole });
      onLogin(result.user?.role || selectedRole);
    } catch (err) {
      setError(err.message || 'Login failed. Check your credentials and backend connection.');
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
          <h1>Sign into HomeLabs.</h1>
          <p>Use credentials issued by an administrator. All portal access is authenticated through the production backend.</p>
          <div className="login-assurance">
            <ShieldCheck size={22} />
            <span>Backend authentication, rate limiting and role-based access controls are active.</span>
          </div>
        </div>

        <div className="login-card">
          <div className="login-card-head">
            <div className="step-emblem"><LockKeyhole size={22} /></div>
            <div>
              <span>Secure login</span>
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
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@yourdomain.com" autoComplete="email" />
            </label>
            <label className="field">
              <span>Password</span>
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" autoComplete="current-password" />
            </label>
          </div>

          <div className="google-auth-block">
            <span className="login-divider">Continue securely</span>
            {GOOGLE_CLIENT_ID ? (
              <div className="google-button-wrap" ref={googleButtonRef} aria-busy={googleLoading ? 'true' : 'false'} />
            ) : (
              <div className="google-config-note">Google sign-in is ready in the codebase. Add VITE_GOOGLE_CLIENT_ID to enable the button in production.</div>
            )}
            <small>New Google sign-ups are created as patient accounts. Staff Google access must match an approved account email.</small>
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

          <button className="primary-button full" type="button" onClick={handleLogin} disabled={loading || googleLoading || !email || !password}>{loading ? 'Signing in...' : 'Open selected portal'} <ArrowRight size={17} /></button>
          <small className="form-note">The frontend must be configured with VITE_API_BASE_URL before deployment.</small>
        </div>
      </section>
    </main>
  );
}
