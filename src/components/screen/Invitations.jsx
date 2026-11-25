import { useCallback, useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Alert, Box, Button, Card, Chip, Container, Grid, Skeleton, Stack, Tab, Tabs, Typography } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import { getInvite } from '../../api/moiPlus';
import { EmptyState, StatCard, notify } from '../ui';
import { useTx } from '../../language/site';

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user')) || {};
  } catch (e) {
    return {};
  }
};
const day = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '');

/** Invitations: a WhatsApp invitation with the function page, and who is coming (expected guests for catering). */
const Invitations = () => {
  const tx = useTx();
  const user = readUser();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('coming');

  const load = useCallback(async () => {
    if (!user.functionId) {
      setError(tx('Choose one of your functions first.'));
      return;
    }
    const r = await getInvite(user.functionId);
    if (r.ok) {
      setData(r.data);
      setError('');
    } else setError(tx(r.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.functionId]);

  useEffect(() => {
    load();
  }, [load]);

  const text = data ? [
    `🙏 ${data.functionName}`,
    data.funPersionNames,
    `📅 ${day(data.functionDate)}`,
    data.mahalName ? `📍 ${data.mahalName}` : null,
    data.funMessage,
    '',
    `${tx('Please let us know if you are coming')}: ${data.url}`,
  ].filter((x) => x !== null && x !== undefined).join('\n') : '';

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      notify.success(tx('Link copied'));
    } catch (e) {
      notify.error(data.url);
    }
  };

  const shown = (data?.replies || []).filter((r) => (tab === 'coming' ? r.coming : !r.coming));

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>{tx('Invitations')}</Typography>
          <Typography color="text.secondary">{tx('Send the invitation on WhatsApp. Guests reply coming or not, so you know how many to cook for.')}</Typography>
        </Box>
        <Button startIcon={<RefreshIcon />} onClick={load}>{tx('Refresh')}</Button>
      </Stack>
      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}
      {!data ? (!error && <Skeleton variant="rounded" height={240} />) : (
        <>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={7}>
              <Card sx={{ p: 2, height: '100%' }}>
                <Typography fontWeight={800} sx={{ mb: 1 }}>{tx('Invitation message')}</Typography>
                <Box sx={{ whiteSpace: 'pre-wrap', bgcolor: 'action.hover', borderRadius: 2, p: 1.5, fontSize: 14, mb: 1.5, wordBreak: 'break-word' }}>{text}</Box>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Button variant="contained" color="success" startIcon={<WhatsAppIcon />}
                    href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener">{tx('Share on WhatsApp')}</Button>
                  <Button startIcon={<ContentCopyIcon />} onClick={copy}>{tx('Copy')}</Button>
                  <Button href={data.url} target="_blank" rel="noopener">{tx('Open page')}</Button>
                </Stack>
              </Card>
            </Grid>
            <Grid item xs={12} md={5}>
              <Card sx={{ p: 2, height: '100%', textAlign: 'center' }}>
                <Typography fontWeight={800} sx={{ mb: 1 }}>{tx('QR for printed invitations')}</Typography>
                <Box sx={{ display: 'inline-block', p: 1.5, bgcolor: '#fff', borderRadius: 2 }}><QRCodeSVG value={data.url} size={150} /></Box>
              </Card>
            </Grid>
          </Grid>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={4}><StatCard label={tx('Families coming')} value={data.coming} color="success" /></Grid>
            <Grid item xs={4}><StatCard label={tx('Expected guests')} value={data.expectedGuests} color="primary" /></Grid>
            <Grid item xs={4}><StatCard label={tx('Not coming')} value={data.notComing} color="warning" /></Grid>
          </Grid>
          <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Tab value="coming" label={`${tx('Coming')} (${data.coming})`} />
            <Tab value="not" label={`${tx('Not coming')} (${data.notComing})`} />
          </Tabs>
          {shown.length === 0 ? (
            <Card><EmptyState icon={<MailOutlineIcon />} title={tx('No replies yet')} description={tx('Replies appear here as guests answer the invitation.')} /></Card>
          ) : (
            <Card>
              {shown.map((r, i) => (
                <Stack key={r.id} direction="row" spacing={1.5} alignItems="center" sx={{ px: 2, py: 1.25, borderBottom: i < shown.length - 1 ? 1 : 0, borderColor: 'divider' }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography fontWeight={700} noWrap>{r.name}</Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>{[r.place, r.phone, r.note].filter(Boolean).join(' · ')}</Typography>
                  </Box>
                  {r.coming && <Chip size="small" color="success" label={tx('{{n}} people', { n: r.guests })} />}
                </Stack>
              ))}
            </Card>
          )}
        </>
      )}
    </Container>
  );
};

export default Invitations;
