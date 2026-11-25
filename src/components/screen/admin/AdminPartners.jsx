import { useCallback, useEffect, useState } from 'react';
import { Alert, Box, Button, Card, Chip, Container, Dialog, DialogActions, DialogContent, Grid, InputAdornment, Skeleton, Stack, TextField, Typography } from '@mui/material';
import { addPartnerPayout, getPartnerDetail, listPartners, updatePartner } from '../../../api/partner';
import { rupees } from '../../moitech/shared';
import { EmptyState, notify } from '../../ui';
import { useTx } from '../../../language/site';

const color = { Active: 'success', Pending: 'warning', Stopped: 'default' };
const day = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '');

/** Super admin: approve partners, set their share, see what they earned and record payouts. */
const AdminPartners = () => {
  const tx = useTx();
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(null);
  const [share, setShare] = useState('');
  const [pay, setPay] = useState({ amount: '', reference: '' });

  const load = useCallback(async () => {
    const r = await listPartners();
    if (r.ok) setItems(r.data.items);
    else {
      setError(tx(r.message));
      setItems([]);
    }
  }, [tx]);

  useEffect(() => {
    load();
  }, [load]);

  const show = async (id) => {
    const r = await getPartnerDetail(id);
    if (!r.ok) return notify.error(tx(r.message));
    setOpen(r.data);
    setShare(String(r.data.sharePercent));
    setPay({ amount: r.data.balance > 0 ? String(r.data.balance) : '', reference: '' });
    return undefined;
  };

  const update = async (status) => {
    const r = await updatePartner({ id: open.id, status, sharePercent: share === '' ? null : Number(share) });
    if (!r.ok) return notify.error(tx(r.message));
    notify.success(tx('Saved'));
    await show(open.id);
    load();
    return undefined;
  };

  const payout = async () => {
    const r = await addPartnerPayout({ partnerId: open.id, amount: Number(pay.amount), reference: pay.reference });
    if (!r.ok) return notify.error(tx(r.message));
    notify.success(tx('Saved'));
    setOpen(r.data);
    setPay({ amount: '', reference: '' });
    load();
    return undefined;
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <Typography variant="h4" fontWeight={800}>{tx('Partners')}</Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>{tx('Approve resellers, set their share and record what you paid them.')}</Typography>
      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}
      {!items ? <Skeleton variant="rounded" height={200} /> : !items.length ? (
        <Card><EmptyState title={tx('No partners yet')} description={tx('Partners apply from the Partner dashboard after signing in.')} /></Card>
      ) : (
        <Card>
          {items.map((p, i) => (
            <Stack key={p.id} direction="row" spacing={1.5} alignItems="center" sx={{ px: 2, py: 1.25, borderBottom: i < items.length - 1 ? 1 : 0, borderColor: 'divider', cursor: 'pointer' }} onClick={() => show(p.id)}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography fontWeight={700} noWrap>{p.name} · {p.code}</Typography>
                <Typography variant="body2" color="text.secondary" noWrap>{[tx(p.kind), p.town, p.phone].filter(Boolean).join(' · ')}</Typography>
              </Box>
              <Typography variant="body2">{p.familyCount} {tx('families')}</Typography>
              <Typography fontWeight={700} sx={{ minWidth: 90, textAlign: 'right' }}>{rupees(p.balance)}</Typography>
              <Chip size="small" color={color[p.status]} label={tx(p.status)} />
            </Stack>
          ))}
        </Card>
      )}
      <Dialog open={!!open} onClose={() => setOpen(null)} maxWidth="sm" fullWidth>
        {open && (
          <DialogContent sx={{ pt: 3 }}>
            <Typography variant="h6" fontWeight={800}>{open.name} · {open.code}</Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>{[tx(open.kind), open.town, open.phone, open.upiId].filter(Boolean).join(' · ')}</Typography>
            <Grid container spacing={1} sx={{ mb: 2 }}>
              {[['Families', open.familyCount], ['Paid by them', rupees(open.paidByFamilies)], ['Earned', rupees(open.earned)], ['Paid out', rupees(open.paidOut)], ['Balance', rupees(open.balance)]].map(([k, v]) => (
                <Grid item xs={4} key={k}><Typography variant="caption" color="text.secondary">{tx(k)}</Typography><Typography fontWeight={800}>{v}</Typography></Grid>
              ))}
            </Grid>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
              <TextField size="small" label={tx('Share %')} value={share} onChange={(e) => setShare(e.target.value.replace(/[^\d.]/g, ''))} sx={{ width: 110 }} />
              {open.status !== 'Active' && <Button variant="contained" color="success" onClick={() => update('Active')}>{tx('Approve')}</Button>}
              {open.status === 'Active' && <Button variant="outlined" onClick={() => update('Active')}>{tx('Save share')}</Button>}
              {open.status !== 'Stopped' && <Button color="error" onClick={() => update('Stopped')}>{tx('Pause')}</Button>}
            </Stack>
            <Typography fontWeight={800} sx={{ mb: 1 }}>{tx('Record a payout')}</Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <TextField size="small" label={tx('Amount')} value={pay.amount} onChange={(e) => setPay({ ...pay, amount: e.target.value.replace(/[^\d.]/g, '') })}
                InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
              <TextField size="small" label={tx('UPI reference')} value={pay.reference} onChange={(e) => setPay({ ...pay, reference: e.target.value })} sx={{ flex: 1 }} />
              <Button variant="contained" disabled={!(Number(pay.amount) > 0)} onClick={payout}>{tx('Save')}</Button>
            </Stack>
            {open.families?.length > 0 && (
              <>
                <Typography fontWeight={800} sx={{ mb: 1 }}>{tx('Families')}</Typography>
                {open.families.map((f, i) => (
                  <Stack key={i} direction="row" sx={{ py: 0.5 }}>
                    <Typography variant="body2" sx={{ flex: 1 }}>{f.name} · {f.product} · {day(f.joined)}</Typography>
                    <Typography variant="body2" fontWeight={700}>{rupees(f.paid)}</Typography>
                  </Stack>
                ))}
              </>
            )}
          </DialogContent>
        )}
        <DialogActions sx={{ px: 3, pb: 2 }}><Button onClick={() => setOpen(null)}>{tx('Close')}</Button></DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPartners;
