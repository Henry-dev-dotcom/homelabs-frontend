import { CheckCircle2, Home } from 'lucide-react';

export function BrandMark({ compact = false }) {
  return (
    <div className="brand-mark" aria-label="HomeLabs brand">
      <div className="brand-icon">
        <Home size={compact ? 22 : 28} strokeWidth={2.2} />
        <CheckCircle2 className="brand-check" size={compact ? 16 : 18} strokeWidth={2.4} />
      </div>
      {!compact && (
        <div>
          <strong>HomeLabs</strong>
          <span>Bringing the Lab to You</span>
        </div>
      )}
    </div>
  );
}
