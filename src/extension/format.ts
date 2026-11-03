/** ₹1,23,456 — rounded to whole rupees, Indian digit grouping. */
export const inr = (amount: number) => `₹${Math.round(amount).toLocaleString('en-IN')}`;

/** ₹1,23,456.78 — for itemised figures where paise matter. */
export const inrPaise = (amount: number) =>
  `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
