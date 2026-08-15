/**
 * A panel. Pass `title` to get a header row, and `action` for a button
 * on the right of that header.
 */
export default function Card({ title, subtitle, action, footer, children, className = "" }) {
  return (
    <section className={`card ${className}`}>
      {(title || action) && (
        <header className="card-header">
          <div>
            {title && <h3>{title}</h3>}
            {subtitle && <p className="text-sm muted">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </section>
  );
}
