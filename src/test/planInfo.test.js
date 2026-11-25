import { describe, expect, it } from 'vitest';
import { autoPayIsOn, daysLeft, productFor, renewLink } from '../components/billing/planInfo';

describe('plan info', () => {
  it('counts days left', () => {
    const now = new Date('2026-11-25T10:00:00Z').getTime();
    expect(daysLeft('2026-12-02T10:00:00Z', now)).toBe(7);
    expect(daysLeft('2026-11-20T10:00:00Z', now)).toBeLessThan(0);
    expect(daysLeft(null, now)).toBeNull();
  });
  it('builds renew links for each product', () => {
    expect(renewLink('moitech', { plan: 'premium', billingCycle: 'yearly' }, 'auto'))
      .toBe('/pricing?product=moitech&plan=premium&cycle=yearly&way=auto');
    expect(renewLink('moitech', { plan: 'free' })).toBe('/pricing?product=moitech&plan=standard&cycle=monthly&way=once');
    expect(renewLink('mahal', { plan: 'mahal-free', billingCycle: 'yearly' })).toBe('/pricing?product=mahal&plan=mahal-yearly&cycle=yearly&way=once');
  });
  it('knows the product and AutoPay state', () => {
    expect(productFor('MU')).toBe('mahal');
    expect(productFor('AU')).toBe('moitech');
    expect(autoPayIsOn({ status: 'active' })).toBe(true);
    expect(autoPayIsOn({ status: 'cancelled' })).toBe(false);
  });
});
