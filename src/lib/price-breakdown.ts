/** The artisan receives 100% of the listed price; the buyer pays a 5% certificate fee on top. Shipping is charged separately to the buyer. */
export function getPriceBreakdown(priceMxn: number) {
  const baseCents = Math.round(priceMxn * 100);
  const feeCents = Math.round((baseCents * 5) / 100);
  return {
    totalMxn: (baseCents + feeCents) / 100,
    commissionMxn: feeCents / 100,
    artisanMxn: baseCents / 100,
    commissionPercent: 5,
    artisanPercent: 100,
    shippingMxn: 0,
  };
}
