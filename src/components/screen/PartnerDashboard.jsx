import { useCallback, useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Alert, Box, Button, Card, Chip, Container, Grid, MenuItem, Skeleton, Stack, TextField, Typography } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined';
import { applyPartner, getMyPartner } from '../../api/partner';
import { rupees } from '../moitech/shared';
import { EmptyState, StatCard, notify } from '../ui';
import { useTx } from '../../language/site';

const KINDS = ['Printer', 'Organiser', 'Hall', 'Shop', 'Other'];
const day = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '');

/** Resellers and partners: apply, share the signup link, see families brought in and the share earned. */
const PartnerDashboard = () => {
  const tx = useTx();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ kind: 'Printer', town: '', upiId: '', note: '' });
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const r = await getMyPartner();
    if (r.ok) {
      setData(r.data);
      if (r.data.partner) setForm({ kind: r.data.partner.kind, town: r.data.partner.town || '', upiId: r.data.partner.upiId || '', note: '' });
    } else setError(tx(r.message));
  }, [tx]);

  useEffect(() => {
    load();
  }, [load]);

  const apply = async () => {
    setBusy(true);
    const r = await applyPartner(form);
    setBusy(false);
    if (!r.ok) return notify.error(tx(r.message));
    notify.success(tx(r.message));
    load();
    return undefined;
  };

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      notify.success(tx('Link copied'));
    } catch (e) {
      notify.error(text);
    }
  };

  const p = data?.partner;
  const share = p ? `${tx('Record moi on your phone with Moitech. Free trial:')} ${p.moitechLink}` : '';

  const formCard = (
    <Card sx={{ p: 2.5 }}>
      <Typography fontWeight={800} sx={{ mb: 1 }}>{tx(p ? 'Your details' : 'Become a partner')}</Typography>
      {!p && <Typography color="text.secondary" sx={{ mb: 2 }}>{tx('Printers, function organisers, halls and shops: sign families up for Moitech and Mahal Management, and earn a share of every payment they make.')}</Typography>}
      <Grid container spacing={1.5}>
        <Grid item xs={12} sm={4}>
          <TextField select fullWidth size="small" label={tx('You are a')} value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>
            {KINDS.map((k) => <MenuItem key={k} value={k}>{tx(k)}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={4}><TextField fullWidth size="small" label={tx('Town')} value={form.town} onChange={(e) => setForm({ ...form, town: e.target.value })} /></Grid>
        <Grid item xs={12} sm={4}><TextField fullWidth size="small" label={tx('UPI ID for your share')} value={form.upiId} onChange={(e) => setForm({ ...form, upiId: e.target.value })} /></Grid>
        {!p && <Grid item xs={12}><TextField fullWidth size="small" label={tx('Anything we should know (optional)')} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></Grid>}
      </Grid>
      <Button variant="contained" sx={{ mt: 2 }} disabled={busy} onClick={apply}>{tx(p ? 'Save' : 'Apply')}</Button>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <Typography variant="h4" fontWeight={800}>{tx('Partner dashboard')}</Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>{tx('Bring families and halls to MySuccess and earn a share of what they pay.')}</Typography>
      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}
      {!data ? (!error && <Skeleton variant="rounded" height={240} />) : !p ? formCard : (
        <>
          {p.status === 'Pending' && <Alert severity="info" sx={{ mb: 2 }}>{tx('Thank you for applying. We will call you and switch on your partner account.')}</Alert>}
          {p.status === 'Stopped' && <Alert severity="warning" sx={{ mb: 2 }}>{tx('Your partner account is paused. Please contact us.')}</Alert>}
          {p.status === 'Active' && (
            <>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6} md={3}><StatCard label={tx('Families signed up')} value={p.familyCount} color="primary" /></Grid>
                <Grid item xs={6} md={3}><StatCard label={tx('Paid by them')} value={rupees(p.paidByFamilies)} color="info" /></Grid>
                <Grid item xs={6} md={3}><StatCard label={tx('Your share ({{n}}%)', { n: p.sharePercent })} value={rupees(p.earned)} color="success" /></Grid>
                <Grid item xs={6} md={3}><StatCard label={tx('To be paid to you')} value={rupees(p.balance)} color="warning" /></Grid>
              </Grid>
              <Card sx={{ p: 2.5, mb: 2 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
                  <Box sx={{ p: 1.5, bgcolor: '#fff', borderRadius: 2 }}><QRCodeSVG value={p.moitechLink} size={140} /></Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography fontWeight={800}>{tx('Your code')}: <Chip label={p.code} color="primary" sx={{ fontWeight: 800 }} /></Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{tx('Families who sign up from your link or QR within 60 days are counted for you.')}</Typography>
                    {[['Moitech', p.moitechLink], ['Mahal Management', p.mahalLink]].map(([label, url]) => (
                      <Stack key={label} direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                        <Typography variant="body2" sx={{ minWidth: 130 }}>{label}</Typography>
                        <Typography variant="body2" sx={{ flex: 1, wordBreak: 'break-all' }}>{url}</Typography>
                        <Button size="small" startIcon={<ContentCopyIcon />} onClick={() => copy(url)}>{tx('Copy')}</Button>
                      </Stack>
                    ))}
                    <Button sx={{ mt: 1.5 }} variant="contained" color="success" startIcon={<WhatsAppIcon />}
                      href={`https://wa.me/?text=${encodeURIComponent(share)}`} target="_blank" rel="noopener">{tx('Share on WhatsApp')}</Button>
                  </Box>
                </Stack>
              </Card>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>{tx('Families')}</Typography>
              {!p.families?.length ? (
                <Card sx={{ mb: 2 }}><EmptyState icon={<HandshakeOutlinedIcon />} title={tx('No families yet')} description={tx('Share your link or QR with families planning a function.')} /></Card>
              ) : (
                <Card sx={{ mb: 2 }}>
                  {p.families.map((f, i) => (
                    <Stack key={`${f.phone}-${i}`} direction="row" spacing={1.5} alignItems="center" sx={{ px: 2, py: 1.25, borderBottom: i < p.families.length - 1 ? 1 : 0, borderColor: 'divider' }}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography fontWeight={700} noWrap>{f.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{f.product} · {f.phone} · {day(f.joined)}</Typography>
                      </Box>
                      <Typography fontWeight={700}>{f.paid ? rupees(f.paid) : tx('Trial')}</Typography>
                    </Stack>
                  ))}
                </Card>
              )}
              {p.payouts?.length > 0 && (
                <>
                  <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>{tx('Paid to you')}</Typography>
                  <Card sx={{ mb: 2 }}>
                    {p.payouts.map((x, i) => (
                      <Stack key={x.id} direction="row" sx={{ px: 2, py: 1.25, borderBottom: i < p.payouts.length - 1 ? 1 : 0, borderColor: 'divider' }}>
                        <Typography sx={{ flex: 1 }}>{day(x.paidDt)}{x.reference ? ` · ${x.reference}` : ''}</Typography>
                        <Typography fontWeight={700}>{rupees(x.amount)}</Typography>
                      </Stack>
                    ))}
                  </Card>
                </>
              )}
            </>
          )}
          {formCard}
        </>
      )}
    </Container>
  );
};

export default PartnerDashboard;
