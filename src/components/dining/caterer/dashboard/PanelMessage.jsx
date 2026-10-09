/** Calm inline state for a panel that has nothing to show or could not load. */
const PanelMessage = ({ title, text, tone = "neutral", children }) => (
  <div className="cdb-message" data-tone={tone} role={tone === "danger" ? "alert" : undefined}>
    <p className="cdb-message-title">{title}</p>
    {text && <p className="cdb-message-text">{text}</p>}
    {children}
  </div>
)

export default PanelMessage
