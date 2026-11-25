import { describe, expect, it } from 'vitest';
import { hallMessage } from '../components/mahal/hallMessages';

describe('Mahal Phase 2 messages', () => {
  const row = { customerName: 'Ravi', mahalName: 'Lakshmi Mahal', bookingRef: 'MB7K3Q9P', fromDate: '2026-11-20T06:00:00', toDate: '2026-11-20T22:00:00' };
  it('thank-you asks for a review with the booking reference', () => {
    expect(hallMessage('thanks', row, 'en')).toMatch(/mahals\/review\?ref=MB7K3Q9P/);
    expect(hallMessage('thanks', row, 'ta')).toMatch(/mahals\/review\?ref=MB7K3Q9P/);
  });
});
