// Single source of truth for public contact details.
// Update via .env (VITE_HOMELABS_PHONE / VITE_HOMELABS_EMAIL / VITE_HOMELABS_WHATSAPP)
// or change the fallback values here.
export const contactInfo = {
  phone: import.meta.env.VITE_HOMELABS_PHONE || '+233 246662248',
  email: import.meta.env.VITE_HOMELABS_EMAIL || 'homelabsphleb@gmail.com',
  whatsapp: import.meta.env.VITE_HOMELABS_WHATSAPP || '233246662248',
  location: 'Remote — serving clients across Ghana'
};
