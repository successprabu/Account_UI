import { useCallback, useEffect, useState } from 'react';
import {
  Alert, Box, Button, Card, Chip, Container, Dialog, DialogActions, DialogContent, Grid, IconButton, InputAdornment, Menu, MenuItem,
  Skeleton, Stack, Tab, Tabs, TextField, Tooltip, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import CallReceivedIcon from '@mui/icons-material/CallReceived';
import CallMadeIcon from '@mui/icons-material/CallMade';
import CheckIcon from '@mui/icons-material/Check';
import { deleteInvite, listInvites, saveInvite, setInviteStatus } from '../../api/family';
import { compareGiven } from '../../api/moiGiven';
import { rupees } from '../moitech/shared';
import { ConfirmDialog, EmptyState, notify } from '../ui';
import { useTx } from '../../language/site';

const empty = { id: 0, name: '', initial: '', place: '', phone: '', eventName: '', eventDate: '', plannedAmount: '', remarks: '' };
const day = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '');
const ymd = (d) => (d ? String(d).slice(0, 10) : '');

/** Google Calendar link: an all-day reminder on the function date. */
const calendarLink = (e) => {
  const d = ymd(e.eventDate).replace(/-/g, '');
  const next = new Date(new Date(ymd(e.eventDate)).getTime() + 86400000).toISOString().slice(0, 10).replace(/-/g, '');
  const text = `Moi: ${[e.initial, e.name].filter(Boolean).join('. ')}${e.eventName ? ` - ${e.eventName}` : ''}`;
  const details = `Planned moi ${e.plannedAmount ? rupees(e.plannedAmount) : ''}. They gave us ${rupees(e.theyGave)}.`;
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(text)}&dates=${d}/${next}&details=${encodeURIComponent(details)}`;
};

/** Add / edit an invitation, showing what this person gave us before as the name is typed. */
const InviteDialog = ({ open, value, onClose, onSaved }) => {
  const tx = useTx();
  const [f, setF] = useState(empty);
  const [history, setHistory] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) setF(value ? { ...empty, ...value, eventDate: ymd(value.eventDate), plannedAmount: value.plannedAmount ?? '' } : empty);
    setHistory(null);
  }, [open, value]);

  // Look up past give & take for the name (or mobile) being typed.
  useEffect(() => {
    if (!open) return undefined;
    const q = (f.phone.replace(/\D/g, '').length >= 10 ? f.phone : f.name).trim();
    if (q.length < 3) {
      setHistory(null);
      return undefined;
    }
    const t = setTimeout(async () => {
      const r = await compareGiven({ search: q });
      if (r.ok) setHistory((r.data?.items || []).slice(0, 4));
    }, 400);
    return () => clearTimeout(t);
  }, [open, f.name, f.phone]);

  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const pick = (p) => setF((x) => ({ ...x, name: p.name, initial: p.initial || '', place: p.place || '', phone: p.phone || x.phone, plannedAmount: x.plannedAmount || p.theyGave || '' }));

  const save = async () => {
    if (f.name.trim().length < 2) return notify.error(tx('Enter the name.'));
    if (!f.eventDate) return notify.error(tx('Enter the function date.'));
    setBusy(true);
    const r = await saveInvite({ ...f, plannedAmount: f.plannedAmount === '' ? null : Number(f.plannedAmount) });
    setBusy(false);
    if (!r.ok) return notify.error(tx(r.message));
    notify.success(tx('Saved'));
    onSaved();
    return undefined;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent sx={{ pt: 3 }}>
        <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>{tx(f.id ? 'Edit invitation' : 'New invitation')}</Typography>
        <Grid container spacing={1.5}>
          <Grid item xs={8}><TextField fullWidth size="small" label={tx('Name')} value={f.name} onChange={set('name')} autoFocus /></Grid>
          <Grid item xs={4}><TextField fullWidth size="small" label={tx('Initial')} value={f.initial} onChange={set('initial')} /></Grid>
          <Grid item xs={6}><TextField fullWidth size="small" label={tx('Place')} value={f.place} onChange={set('place')} /></Grid>
          <Grid item xs={6}><TextField fullWidth size="small" label={tx('Mobile')} value={f.phone} onChange={set('phone')} inputProps={{ inputMode: 'tel' }} /></Grid>
          {history && history.length > 0 && (
            <Grid item xs={12}>
              <Alert severity="info" icon={false}>
                <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5 }}>{tx('Past give & take')}</Typography>
                {history.map((p) => (
                  <Stack key={p.key} direction="row" spacing={1} alignItems="center" sx={{ py: 0.25 }}>
                    <Typography variant="body2" sx={{ flex: 1 }} noWrap>{[p.initial, p.name].filter(Boolean).join('. ')} · {p.place}</Typography>
                    <Chip size="small" icon={<CallReceivedIcon />} label={rupees(p.theyGave)} color="success" variant="outlined" />
                    <Chip size="small" icon={<CallMadeIcon />} label={rupees(p.weGave)} variant="outlined" />
                    <Button size="small" onClick={() => pick(p)}>{tx('Use')}</Button>
                  </Stack>
                ))}
              </Alert>
            </Grid>
          )}
          {history && history.length === 0 && (
            <Grid item xs={12}><Typography variant="body2" color="text.secondary">{tx('No past moi found for this name.')}</Typography></Grid>
          )}
          <Grid item xs={12} sm={7}><TextField fullWidth size="small" label={tx('Their function')} placeholder={tx('e.g. Arun wedding')} value={f.eventName} onChange={set('eventName')} /></Grid>
          <Grid item xs={12} sm={5}><TextField fullWidth size="small" type="date" label={tx('Function date')} value={f.eventDate} onChange={set('eventDate')} InputLabelProps={{ shrink: true }} /></Grid>
          <Grid item xs={12} sm={5}>
            <TextField fullWidth size="small" label={tx('Moi to give')} value={f.plannedAmount} onChange={(e) => setF((x) => ({ ...x, plannedAmount: e.target.value.replace(/[^\d.]/g, '') }))}
              InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} inputProps={{ inputMode: 'decimal' }} />
          </Grid>
          <Grid item xs={12} sm={7}><TextField fullWidth size="small" label={tx('Note')} value={f.remarks} onChange={set('remarks')} /></Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>{tx('Cancel')}</Button>
        <Button variant="contained" disabled={busy} onClick={save}>{tx('Save')}</Button>
      </DialogActions>
    </Dialog>
  );
};

/** Moi to return: invitations we got, with what each person gave us, so the family knows what to give back. */
const MoiReturn = () => {
  const tx = useTx();
  const [tab, setTab] = useState('Planned');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [edit, setEdit] = useState(null);
  const [menu, setMenu] = useState(null);
  const [giving, setGiving] = useState(null);
  const [givenAmount, setGivenAmount] = useState('');
  const [removing, setRemoving] = useState(null);

  const load = useCallback(async () => {
    const r = await listInvites(tab);
    if (r.ok) {
      setData(r.data);
      setError('');
    } else {
      setError(tx(r.message));
      setData({ items: [], planned: 0, given: 0, skipped: 0, dueWeek: 0 });
    }
  }, [tab, tx]);

  useEffect(() => {
    setData(null);
    load();
  }, [load]);

  const status = async (e, s, amount) => {
    const r = await setInviteStatus({ id: e.id, status: s, amount });
    if (!r.ok) return notify.error(tx(r.message));
    notify.success(tx(r.message || 'Saved'));
    setGiving(null);
    load();
    return undefined;
  };

  const remove = async () => {
    const r = await deleteInvite(removing.id);
    setRemoving(null);
    if (!r.ok) return notify.error(tx(r.message));
    load();
    return undefined;
  };

  const dueLabel = (n) => (n < 0 ? tx('{{n}} days ago', { n: -n }) : n === 0 ? tx('Today') : n === 1 ? tx('Tomorrow') : tx('In {{n}} days', { n }));

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>{tx('Moi to return')}</Typography>
          <Typography color="text.secondary">{tx('When you get an invitation, add it here. You will see what that person gave at your functions and what you gave them before.')}</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setEdit({})} sx={{ flexShrink: 0 }}>{tx('Add invitation')}</Button>
      </Stack>

      {data?.dueWeek > 0 && tab === 'Planned' && (
        <Alert severity="warning" sx={{ mb: 2 }}>{tx('{{n}} functions to attend in the next 7 days.', { n: data.dueWeek })}</Alert>
      )}
      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tab value="Planned" label={`${tx('To attend')} (${data?.planned ?? '…'})`} />
        <Tab value="Given" label={`${tx('Given')} (${data?.given ?? '…'})`} />
        <Tab value="Skipped" label={`${tx('Skipped')} (${data?.skipped ?? '…'})`} />
      </Tabs>

      {!data ? (
        <Stack spacing={1.5}>{[0, 1, 2].map((i) => <Skeleton key={i} variant="rounded" height={110} />)}</Stack>
      ) : data.items.length === 0 ? (
        <Card><EmptyState icon={<EventOutlinedIcon />} title={tx('Nothing here yet')} description={tx('Add each invitation you get, with the date, and plan the moi to give.')} /></Card>
      ) : (
        <Grid container spacing={2}>
          {data.items.map((e) => (
            <Grid item xs={12} md={6} key={e.id}>
              <Card sx={{ p: 2, height: '100%' }}>
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography fontWeight={800} noWrap>{[e.initial, e.name].filter(Boolean).join('. ')}</Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>{[e.place, e.eventName].filter(Boolean).join(' · ')}</Typography>
                  </Box>
                  <Chip size="small" color={tab === 'Planned' && e.daysLeft >= 0 && e.daysLeft <= 7 ? 'warning' : 'default'}
                    label={`${day(e.eventDate)}${tab === 'Planned' ? ` · ${dueLabel(e.daysLeft)}` : ''}`} />
                  <IconButton size="small" onClick={(ev) => setMenu({ anchor: ev.currentTarget, e })}><MoreVertIcon fontSize="small" /></IconButton>
                </Stack>
                <Stack direction="row" spacing={1} sx={{ mt: 1.5 }} flexWrap="wrap" useFlexGap>
                  <Tooltip title={tx('What they gave at our functions')}><Chip icon={<CallReceivedIcon />} color="success" variant="outlined" label={`${tx('They gave')} ${rupees(e.theyGave)}`} /></Tooltip>
                  <Tooltip title={tx('What we gave them before')}><Chip icon={<CallMadeIcon />} variant="outlined" label={`${tx('We gave')} ${rupees(e.weGave)}`} /></Tooltip>
                  {e.plannedAmount > 0 && <Chip color="primary" label={`${tx(tab === 'Given' ? 'Given' : 'To give')} ${rupees(e.plannedAmount)}`} />}
                </Stack>
                {e.got?.length > 0 && (
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                    {e.got.map((g) => `${g.functionName || ''} ${rupees(g.amount)}`).join(' · ')}
                  </Typography>
                )}
                {tab === 'Planned' && (
                  <Stack direction="row" spacing={1} sx={{ mt: 1.5 }} justifyContent="flex-end">
                    <Button size="small" href={calendarLink(e)} target="_blank" rel="noopener" startIcon={<EventOutlinedIcon />}>{tx('Remind me')}</Button>
                    <Button size="small" color="inherit" onClick={() => status(e, 'Skipped')}>{tx('Skip')}</Button>
                    <Button size="small" variant="contained" color="success" startIcon={<CheckIcon />}
                      onClick={() => { setGiving(e); setGivenAmount(String(e.plannedAmount || e.theyGave || '')); }}>{tx('Mark given')}</Button>
                  </Stack>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Menu anchorEl={menu?.anchor} open={!!menu} onClose={() => setMenu(null)}>
        {menu?.e.status !== 'Given' && <MenuItem onClick={() => { setEdit(menu.e); setMenu(null); }}>{tx('Edit')}</MenuItem>}
        {menu?.e.status === 'Skipped' && <MenuItem onClick={() => { status(menu.e, 'Planned'); setMenu(null); }}>{tx('Move back to To attend')}</MenuItem>}
        <MenuItem onClick={() => { setRemoving(menu.e); setMenu(null); }} sx={{ color: 'error.main' }}>{tx('Delete')}</MenuItem>
      </Menu>

      <InviteDialog open={!!edit} value={edit?.id ? edit : null} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); load(); }} />

      <Dialog open={!!giving} onClose={() => setGiving(null)} maxWidth="xs" fullWidth>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="h6" fontWeight={800}>{tx('How much did you give?')}</Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>{tx('It is added to Moi we gave.')}</Typography>
          <TextField autoFocus fullWidth label={tx('Amount')} value={givenAmount} onChange={(e) => setGivenAmount(e.target.value.replace(/[^\d.]/g, ''))}
            InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} inputProps={{ inputMode: 'decimal' }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setGiving(null)}>{tx('Cancel')}</Button>
          <Button variant="contained" color="success" disabled={!(Number(givenAmount) > 0)} onClick={() => status(giving, 'Given', Number(givenAmount))}>{tx('Save')}</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={!!removing} title={tx('Delete this invitation?')}
        message={removing ? [removing.initial, removing.name].filter(Boolean).join('. ') : ''}
        confirmLabel={tx('Delete')} onConfirm={remove} onClose={() => setRemoving(null)} danger />
    </Container>
  );
};

export default MoiReturn;
