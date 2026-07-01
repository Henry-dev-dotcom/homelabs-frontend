const GOOGLE_SCRIPT_ID = 'google-identity-services-script';
const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

export const GOOGLE_CLIENT_ID = String(import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim();

export function loadGoogleIdentityScript() {
  if (!GOOGLE_CLIENT_ID) return Promise.reject(new Error('VITE_GOOGLE_CLIENT_ID is not configured.'));
  if (window.google?.accounts?.id) return Promise.resolve(window.google);

  const existing = document.getElementById(GOOGLE_SCRIPT_ID);
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', () => resolve(window.google), { once: true });
      existing.addEventListener('error', () => reject(new Error('Google sign-in script could not load.')), { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = GOOGLE_SCRIPT_ID;
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = () => reject(new Error('Google sign-in script could not load.'));
    document.head.appendChild(script);
  });
}
