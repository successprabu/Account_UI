import { describe, expect, it } from 'vitest';
import { upiLink } from '../components/moitech/PayModeToggle';

describe('upiLink', () => {
  it('builds a UPI pay link with encoded name and note', () => {
    expect(upiLink('ravi@okaxis', 'Ravi & Family', 'Wedding Moi'))
      .toBe('upi://pay?pa=ravi%40okaxis&pn=Ravi%20%26%20Family&cu=INR&tn=Wedding%20Moi');
  });
  it('leaves the note out when empty', () => {
    expect(upiLink('a@upi', '', '')).toBe('upi://pay?pa=a%40upi&pn=&cu=INR');
  });
});
