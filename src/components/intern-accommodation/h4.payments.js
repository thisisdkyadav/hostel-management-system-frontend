export const h4Bills = (request) => [
  ...(request.payment ? [{ ...request.payment, _id: "main", label: "Accommodation", paymentType: "accommodation" }] : []),
  ...(request.additionalPayments || []).map((p) => ({ ...p, paymentType: "accommodation" })),
  ...(request.h4?.messPayment ? [{ ...request.h4.messPayment, _id: "mess", label: "Mess", paymentType: "mess" }] : []),
]

export const h4BillAction = (bill) => ({
  paymentType: bill.paymentType,
  ...(!["main", "mess"].includes(bill._id) ? { additionalPaymentId: bill._id } : {}),
})
