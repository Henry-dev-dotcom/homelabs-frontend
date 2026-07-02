import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Info, LockKeyhole, ShieldCheck } from 'lucide-react';
import { BrandMark } from '../components/BrandMark.jsx';
import { roles } from '../data/dashboardData.js';
import { googleLogin, login } from '../services/authService.js';
import { GOOGLE_CLIENT_ID, loadGoogleIdentityScript } from '../services/googleIdentityService.js';

export function LoginPage({ onBackHome, onLogin, selectedRole, onRoleChange }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const googleButtonRef = useRef(null);

  const activeRole = roles.find((role) => role.id === selectedRole);

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
        const availableWidth = googleButtonRef.current.offsetWidth || 340;
        google.accounts.id.renderButton(googleButtonRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
          width: Math.min(340, availableWidth)
        });
      })
      .catch(() => {
        if (!cancelled) setError('Google sign-in is not available right now. Please use email and password.');
      });

    return () => { cancelled = true; };
  }, [selectedRole]);

  async function handleLogin(event) {
    event?.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError('');
    try {
      const result = await login({ email, password, role: selectedRole });
      onLogin(result.user?.role || selectedRole);
    } catch (err) {
      setError(err.message || 'Sign-in failed. Check your email and password, then try again.');
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
          <p>One login for patients, clinicians, phlebotomists, labs, operations and admin. Choose your portal, sign in, and continue where you left off.</p>
          <div className="login-assurance">
            <ShieldCheck size={22} />
            <span>Your sign-in is encrypted and each portal only shows what your role is allowed to see.</span>
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
          {activeRole?.description && (
            <span className="role-hint"><Info size={16} /> {activeRole.description}</span>
          )}

          <form className="form-grid" onSubmit={handleLogin}>
            <label className="field">
              <span>Email</span>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@yourdomain.com" autoComplete="email" />
            </label>
            <label className="field">
              <span>Password</span>
              <div className="input-with-action">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" autoComplete="current-password" />
                <button className="input-action-button" type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            {error && <div className="form-error-list" role="alert"><strong>Sign-in issue</strong><ul><li>{error}</li></ul></div>}

            <button className="primary-button full" type="submit" disabled={loading || googleLoading || !email || !password}>
              {loading ? 'Signing in...' : 'Sign in'} <ArrowRight size={17} />
            </button>
          </form>

          <div className="google-auth-block">
            <span className="login-divider">or continue with</span>
            {GOOGLE_CLIENT_ID ? (
              <div className="google-button-wrap" ref={googleButtonRef} aria-busy={googleLoading ? 'true' : 'false'} />
            ) : (
              <div className="google-config-note">Google sign-in is not enabled on this deployment yet.</div>
            )}
            <small>New Google sign-ups are created as patient accounts. Staff access must match an approved account email.</small>
          </div>

          <small className="form-note">Need access or forgot your password? Contact the HomeLabs team and an administrator will help you.</small>
        </div>
      </section>
    </main>
  );
}
