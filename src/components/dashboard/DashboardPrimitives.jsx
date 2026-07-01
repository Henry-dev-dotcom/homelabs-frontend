export function StatsGrid({ stats }) {
  return (
    <section className="stats-grid">
      {stats.map(([label, value, helper]) => (
        <article key={label} className="stat-card">
          <span>{label}</span>
          <strong>{value}</strong>
          {helper && <small>{helper}</small>}
        </article>
      ))}
    </section>
  );
}

export function SectionTitle({ eyebrow, title, text }) {
  return (
    <div className="dash-section-title">
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}

export function StatusBadge({ status }) {
  const key = String(status).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return <span className={`status-badge status-${key}`}>{status}</span>;
}

export function MiniRecord({ title, meta, status, footer, action }) {
  return (
    <article className="mini-record">
      <div>
        <strong>{title}</strong>
        {meta && <span>{meta}</span>}
        {footer && <small>{footer}</small>}
      </div>
      <div className="mini-record-actions">
        {status && <StatusBadge status={status} />}
        {action}
      </div>
    </article>
  );
}

export function Field({ label, children, helper }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {helper && <small>{helper}</small>}
    </label>
  );
}

export function Timeline({ items }) {
  return (
    <div className="timeline">
      {items.map((item, index) => (
        <article key={`${item.label}-${index}`} className={`timeline-item ${item.done ? 'done' : ''}`}>
          <span>{index + 1}</span>
          <div>
            <strong>{item.label}</strong>
            <small>{item.time || item.description}</small>
          </div>
        </article>
      ))}
    </div>
  );
}

export function PaginationControls({ meta, onPageChange, label = 'records' }) {
  if (!meta || !meta.total || meta.totalPages <= 1) return null;
  const start = ((meta.page - 1) * meta.limit) + 1;
  const end = Math.min(meta.page * meta.limit, meta.total);

  return (
    <div className="pagination-controls">
      <span>Showing {start}–{end} of {meta.total} {label}</span>
      <div>
        <button className="secondary-button tiny" type="button" disabled={!meta.hasPreviousPage} onClick={() => onPageChange(meta.page - 1)}>Previous</button>
        <strong>Page {meta.page} of {meta.totalPages}</strong>
        <button className="secondary-button tiny" type="button" disabled={!meta.hasNextPage} onClick={() => onPageChange(meta.page + 1)}>Next</button>
      </div>
    </div>
  );
}
