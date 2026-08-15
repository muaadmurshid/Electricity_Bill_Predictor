/**
 * variant: "primary" | "secondary" | "ghost" | "danger"
 * Label buttons with what happens: "Save household", not "Submit".
 */
export default function Button({
  children,
  variant = "primary",
  size,
  block = false,
  loading = false,
  disabled = false,
  type = "button",
  className = "",
  ...rest
}) {
  const classes = [
    "btn",
    `btn-${variant}`,
    size === "sm" ? "btn-sm" : "",
    block ? "btn-block" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={classes} disabled={disabled || loading} {...rest}>
      {loading ? "Working…" : children}
    </button>
  );
}
