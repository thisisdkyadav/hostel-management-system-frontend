// One combined bill (accommodation + GST + mess) paid by the student, plus any
// date-change charges added later.
export const h4Bills = (request) => [
  ...(request.payment ? [{ ...request.payment, _id: "main", label: "Accommodation and mess" }] : []),
  ...(request.additionalPayments || []),
]

export const h4BillAction = (bill) => (bill._id !== "main" ? { additionalPaymentId: bill._id } : {})

// "Accommodation ₹118.00 incl. GST + Mess ₹250.00" for the main bill.
export const h4BillParts = (request, money) => {
  if (!request.quote && !request.h4?.messCharge) return ""
  const parts = [`Accommodation ${money(request.quote?.total)}${request.quote?.gstAmount ? " incl. GST" : ""}`]
  if (request.h4?.mess === "with") parts.push(`Mess ${money(request.h4.messCharge?.amount)}`)
  return parts.join(" + ")
}
