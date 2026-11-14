import { describe, expect, it } from 'vitest';
import { getPriceBreakdown } from '@/lib/price-breakdown';

describe('buyer-premium craft price breakdown', () => {
  it('adds a 5% platform certificate fee on top of the listed price', () => {
    expect(getPriceBreakdown(450).commissionMxn).toBe(22.5);
    expect(getPriceBreakdown(1850).commissionMxn).toBe(92.5);
    expect(getPriceBreakdown(450).commissionPercent).toBe(5);
    expect(getPriceBreakdown(450).totalMxn).toBe(472.5);
  });
  it('allocates 100% of the listed price to the artisan', () => {
    const price = getPriceBreakdown(450);
    expect(price.artisanMxn).toBe(450);
    expect(price.artisanPercent).toBe(100);
    expect(price.artisanMxn + price.commissionMxn).toBe(472.5);
  });
  it('excludes shipping, which the buyer covers separately', () => {
    expect(getPriceBreakdown(3200).shippingMxn).toBe(0);
    expect(getPriceBreakdown(3200).totalMxn).toBe(3360);
  });
});
