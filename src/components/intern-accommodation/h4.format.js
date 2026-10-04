export const date = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—"
export const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" })
export const dateTime = (value) =>
  value
    ? `${new Date(value).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false })} IST`
    : "—"
export const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
export const labels = {
  "Pending FA Recommendation": "Faculty review",
  "Pending CWO Capacity Check": "Office review",
  "Pending CW Approval": "Chief Warden review",
  "Returned to Student": "Changes requested",
  "CW Approved": "Ready for charges",
  "Payment Requested": "Awaiting payment",
}
