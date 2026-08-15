/** An empty screen is an invitation to act, so it always offers the action. */
export default function EmptyState({ title, message, action }) {
  return (
    <div className="empty">
      <div className="empty-mark" aria-hidden="true">
        <span style={{ height: "10px" }} />
        <span style={{ height: "16px" }} />
        <span style={{ height: "22px" }} />
        <span style={{ height: "28px" }} />
      </div>
      <p className="empty-title">{title}</p>
      {message && <p className="empty-text">{message}</p>}
      {action}
    </div>
  );
}
