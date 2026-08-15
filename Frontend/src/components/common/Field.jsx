/**
 * One labelled input with its hint and error line.
 * `error` is whatever the backend or the form validation returned.
 */
export default function Field({
  id,
  label,
  hint,
  error,
  type = "text",
  numeric = false,
  as = "input",
  children,
  ...rest
}) {
  const classes = [
    as === "select" ? "select" : as === "textarea" ? "textarea" : "input",
    numeric ? "input-numeric" : "",
    error ? "input-invalid" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>
        {label}
      </label>

      {as === "select" ? (
        <select id={id} className={classes} aria-invalid={Boolean(error)} {...rest}>
          {children}
        </select>
      ) : as === "textarea" ? (
        <textarea id={id} className={classes} aria-invalid={Boolean(error)} {...rest} />
      ) : (
        <input
          id={id}
          type={type}
          className={classes}
          aria-invalid={Boolean(error)}
          {...rest}
        />
      )}

      {hint && !error && <span className="field-hint">{hint}</span>}
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}
