import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck, UserRoundPlus } from 'lucide-react';
import { BrandMark } from '../components/BrandMark.jsx';
import { googleLogin, login, register } from '../services/authService.js';
import { GOOGLE_CLIENT_ID, loadGoogleIdentityScript } from '../services/googleIdentityService.js';

export function LoginPage({ onBackHome, onLogin, initialMode = 'signin' }) {
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const googleButtonRef = useRef(null);

  const signup = mode === 'signup';

  function switchMode(nextMode) {
    setMode(nextMode);
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
      const result = await googleLogin({ credential: response.credential });
      onLogin(result.user.role, result.user);
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
          text: signup ? 'signup_with' : 'continue_with',
          shape: 'pill',
          width: Math.min(340, availableWidth)
        });
      })
      .catch(() => {
        if (!cancelled) setError('Google sign-in is not available right now. Please use email and password.');
      });

    return () => { cancelled = true; };
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(event) {
    event.preventDefault();
    if (!email || !password || (signup && !name)) return;
    setLoading(true);
    setError('');
    try {
      const result = signup
        ? await register({ name, email, phone, password })
        : await login({ email, password });
      onLogin(result.user.role, result.user);
    } catch (err) {
      setError(err.message || (signup ? 'Could not create your account. Please try again.' : 'Sign-in failed. Check your email and password, then try again.'));
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
          <span className="login-eyebrow">{signup ? 'Join HomeLabs' : 'Portal access'}</span>
          <h1>{signup ? 'Create your patient account.' : 'Sign into HomeLabs.'}</h1>
          <p>
            {signup
              ? 'Book home lab visits, follow every collection step, and receive your results securely — all from your personal patient portal.'
              : 'One login for patients and staff. Your account determines which portal opens — patients book visits and receive results, staff manage operations.'}
          </p>
          <div className="login-assurance">
            <ShieldCheck size={22} />
            <span>Your sign-in is encrypted and each account only sees what its role allows.</span>
          </div>
        </div>

        <div className="login-card">
          <div className="login-card-head">
            <div className="step-emblem">{signup ? <UserRoundPlus size={22} /> : <LockKeyhole size={22} />}</div>
            <div>
              <span>{signup ? 'New patient' : 'Secure login'}</span>
              <h2>{signup ? 'Create account' : 'Welcome back'}</h2>
            </div>
          </div>

          <div className="auth-mode-tabs" role="tablist">
            <button type="button" role="tab" aria-selected={!signup} className={signup ? '' : 'active'} onClick={() => switchMode('signin')}>Sign in</button>
            <button type="button" role="tab" aria-selected={signup} className={signup ? 'active' : ''} onClick={() => switchMode('signup')}>Create account</button>
          </div>

          <form className="form-grid" onSubmit={handleSubmit}>
            {signup && (
              <label className="field">
                <span>Full name</span>
                <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your full name" autoComplete="name" required minLength={2} />
              </label>
            )}
            <label className="field">
              <span>Email</span>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" autoComplete="email" required />
            </label>
            {signup && (
              <label className="field">
                <span>Phone (optional)</span>
                <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+233..." autoComplete="tel" />
              </label>
            )}
            <label className="field">
              <span>Password</span>
              <div className="input-with-action">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={signup ? 'Create a password' : 'Enter your password'}
                  autoComplete={signup ? 'new-password' : 'current-password'}
                  required
                  minLength={signup ? 8 : undefined}
                />
                <button className="input-action-button" type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>
            {signup && <small className="form-note">At least 8 characters, with an uppercase letter, a lowercase letter and a number.</small>}

            {error && <div className="form-error-list" role="alert"><strong>{signup ? 'Sign-up issue' : 'Sign-in issue'}</strong><ul><li>{error}</li></ul></div>}

            <button className="primary-button full" type="submit" disabled={loading || googleLoading || !email || !password || (signup && !name)}>
              {loading ? (signup ? 'Creating account…' : 'Signing in…') : (signup ? 'Create my account' : 'Sign in')} <ArrowRight size={17} />
            </button>
          </form>

          <div className="google-auth-block">
            <span className="login-divider">or continue with</span>
            {GOOGLE_CLIENT_ID ? (
              <div className="google-button-wrap" ref={googleButtonRef} aria-busy={googleLoading ? 'true' : 'false'} />
            ) : (
              <div className="google-config-note">Google sign-in is not enabled on this deployment yet.</div>
            )}
            <small>Google sign-in creates a patient account automatically if you are new.</small>
          </div>

          <small className="form-note">
            {signup
              ? 'Staff accounts are created by a HomeLabs administrator — no self sign-up needed for staff.'
              : 'New to HomeLabs? Choose “Create account” above. Staff logins are issued by your administrator.'}
          </small>
        </div>
      </section>
    </main>
  );
}
