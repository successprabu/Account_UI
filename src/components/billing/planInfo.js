import { useCallback, useEffect, useState } from 'react';
import { myAutoPay } from '../../api/autoPay';

const DAY = 24 * 60 * 60 * 1000;

/** Owners who pay for a plan: AU = Moitech owner, MU = Mahal owner. */
export const PLAN_OWNER_ROLES = ['AU', 'MU'];
export const productFor = (userType) => (userType === 'MU' ? 'mahal' : 'moitech');

const NAMES = {
  free: 'Free trial',
  standard: 'Standard',
  premium: 'Premium',
  'mahal-free': 'Free trial',
  'mahal-monthly': 'Mahal Management',
  'mahal-yearly': 'Mahal Management',
};
export const planName = (id) => NAMES[id] || id || '';

/** Whole days from now until end (negative once it has passed); null without a date. */
export const daysLeft = (end, now = Date.now()) => {
  if (!end) return null;
  const t = new Date(end).getTime();
  return Number.isNaN(t) ? null : Math.ceil((t - now) / DAY);
};

export const autoPayIsOn = (a) => !!a && ['created', 'authenticated', 'active', 'pending'].includes(a.status);

/** Link that opens payment for this plan on the Pricing page (works signed in or out). */
export const renewLink = (product, sub, way = 'once') => {
  let plan = sub?.plan;
  let cycle = sub?.billingCycle === 'yearly' ? 'yearly' : 'monthly';
  if (product === 'mahal') {
    plan = cycle === 'yearly' ? 'mahal-yearly' : 'mahal-monthly';
  } else if (plan !== 'standard' && plan !== 'premium') {
    plan = 'standard';
  }
  return `/pricing?product=${product}&plan=${plan}&cycle=${cycle}&way=${way}`;
};

/** The signed-in owner's plan: { loading, sub, autoPay, days, reload }. */
export const usePlanInfo = () => {
  const [state, setState] = useState({ loading: true, sub: null, autoPay: null });
  const reload = useCallback(async () => {
    const r = await myAutoPay();
    setState({ loading: false, sub: r.ok ? r.data?.subscription || null : null, autoPay: r.ok ? r.data?.autoPay || null : null });
  }, []);
  useEffect(() => { reload(); }, [reload]);
  return { ...state, days: daysLeft(state.sub?.endDate), reload };
};
