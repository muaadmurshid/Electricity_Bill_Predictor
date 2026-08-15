/**
 * variant: "error" | "warning" | "info" | "success"
 * Say what happened and what to do next — never "Error 400".
 */
export default function ErrorMessage({ message, variant = "error", onRetry }) {
  if (!message) return null;

  return (
    <div className={`alert alert-${variant}`} role="alert">
      <span>{message}</span>
      {onRetry && (
        <button type="button" className="btn btn-ghost btn-sm" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
