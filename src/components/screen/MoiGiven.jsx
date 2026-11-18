import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import LinkIcon from '@mui/icons-material/Link';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CallMadeIcon from '@mui/icons-material/CallMade';
import CallReceivedIcon from '@mui/icons-material/CallReceived';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import RedeemOutlinedIcon from '@mui/icons-material/RedeemOutlined';
import { ConfirmDialog, EmptyState, PageHeader, notify } from '../ui';
import { compareGiven, deleteGiven, linkGiven, listGiven, saveGiven } from '../../api/moiGiven';
import { exportExcel } from '../moitech/reportExport';
import { AnimatedNumber, rupees } from '../moitech/shared';

/**
 * "Moi we gave": the admin records moi they gave at other people's functions, then sees, person by person,
 * what we gave and what they gave at our functions, to decide what to return at their next function.
 */

export const STATUS = {
  theyMore: { label: 'They gave more', color: 'success' },
  weMore: { label: 'We gave more', color: 'warning' },
  even: { label: 'Even', color: 'info' },
  onlyWe: { label: 'Only we gave', color: 'secondary' },
  onlyThey: { label: 'Only they gave', color: 'primary' },
};
const STATUS_TABS = ['', 'theyMore', 'weMore', 'onlyWe', 'onlyThey', 'even'];

const fmtDate = (v) => (v ? new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '');
const fullName = (x) => [x.initial, x.name].filter(Boolean).join(' ');

/** What to tell the admin about one person. */
export const advice = (p) => {
  switch (p.status) {
    case 'theyMore':
      return `They gave ${rupees(p.difference)} more than we did. Return at least ${rupees(p.theyGave)} at their next function.`;
    case 'onlyThey':
      return `We have not given them yet. Return at least ${rupees(p.theyGave)} at their next function.`;
    case 'weMore':
      return `We gave ${rupees(-p.difference)} more than they gave us.`;
    case 'onlyWe':
      return 'They have not given at our functions yet.';
    default:
      return 'Even: we gave the same as they gave us.';
  }
};

const emptyEntry = { id: 0, name: '', initial: '', place: '', phone: '', amount: '', eventName: '', eventDate: '', remarks: '' };

/** Add or edit one "we gave" entry. */
const EntryDialog = ({ open, entry, onClose, onSaved }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [form, setForm] = useState(emptyEntry);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(entry ? { ...emptyEntry, ...entry, amount: String(entry.amount ?? ''), eventDate: entry.eventDate ? String(entry.eventDate).slice(0, 10) : '' } : emptyEntry);
      setErrors({});
    }
  }, [open, entry]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const save = async () => {
    const er = {};
    if (!form.name.trim()) er.name = 'Enter the name';
    if (!(Number(form.amount) > 0)) er.amount = 'Enter the amount you gave';
    if (form.phone && form.phone.replace(/\D/g, '').length < 10) er.phone = 'Enter a 10 digit mobile number, or leave it empty';
    setErrors(er);
    if (Object.keys(er).length) return;
    setSaving(true);
    const res = await saveGiven({ ...form, amount: Number(form.amount), eventDate: form.eventDate || null });
    setSaving(false);
    if (!res.ok) {
      notify.error(res.message);
      return;
    }
    notify.success(form.id ? 'Entry updated' : 'Saved');
    onSaved();
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="sm" fullScreen={fullScreen}>
      <DialogTitle sx={{ pr: 6 }}>
        {form.id ? 'Edit moi we gave' : 'Add moi we gave'}
        <IconButton onClick={onClose} disabled={saving} aria-label="Close" sx={{ position: 'absolute', right: 12, top: 12 }}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={8}><TextField label="Name *" value={form.name} onChange={set('name')} error={!!errors.name} helperText={errors.name} fullWidth autoFocus /></Grid>
          <Grid item xs={12} sm={4}><TextField label="Surname / initial" value={form.initial} onChange={set('initial')} fullWidth /></Grid>
          <Grid item xs={12} sm={6}><TextField label="Place / village" value={form.place} onChange={set('place')} fullWidth /></Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Mobile" value={form.phone} onChange={set('phone')} error={!!errors.phone} helperText={errors.phone || 'Best way to match them with what they give you'} fullWidth inputProps={{ inputMode: 'tel' }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Amount we gave *" type="number" value={form.amount} onChange={set('amount')} error={!!errors.amount} helperText={errors.amount} fullWidth InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
          </Grid>
          <Grid item xs={12} sm={6}><TextField label="Date of their function" type="date" value={form.eventDate} onChange={set('eventDate')} fullWidth InputLabelProps={{ shrink: true }} /></Grid>
          <Grid item xs={12}><TextField label="Their function" placeholder="e.g. Arun wedding" value={form.eventName} onChange={set('eventName')} fullWidth /></Grid>
          <Grid item xs={12}><TextField label="Remarks" value={form.remarks} onChange={set('remarks')} fullWidth multiline minRows={2} /></Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button variant="contained" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
      </DialogActions>
    </Dialog>
  );
};

/** One person: what we gave, what they gave, and the advice. Click to see each gift. */
const PersonCard = ({ p, index, onLink }) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const meta = STATUS[p.status] || STATUS.even;
  const color = theme.palette[meta.color].main;
  return (
    <Card component={motion.div} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25, delay: Math.min(index, 12) * 0.03 }} variant="outlined" sx={{ borderRadius: 3, borderLeft: `4px solid ${color}` }}>
      <Box
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setOpen((o) => !o))}
        sx={{ p: 2, pb: 1, cursor: 'pointer' }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
            <Avatar sx={{ bgcolor: alpha(color, 0.15), color, fontWeight: 800 }}>{(p.name || '?').charAt(0).toUpperCase()}</Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 800 }} noWrap>{fullName(p)}</Typography>
              <Typography variant="body2" color="text.secondary" noWrap>{[p.place, p.phone].filter(Boolean).join(' · ')}</Typography>
            </Box>
            <Chip size="small" label={meta.label} color={meta.color} variant="outlined" sx={{ ml: 'auto !important', fontWeight: 700, display: { md: 'none' } }} />
          </Stack>
          <Stack direction="row" spacing={{ xs: 1.5, sm: 3 }} alignItems="center" justifyContent={{ xs: 'space-between', md: 'flex-end' }}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="caption" color="text.secondary">We gave</Typography>
              <Typography sx={{ fontWeight: 800 }}>{rupees(p.weGave)}</Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="caption" color="text.secondary">They gave</Typography>
              <Typography sx={{ fontWeight: 800 }}>{rupees(p.theyGave)}</Typography>
            </Box>
            <Box sx={{ textAlign: 'right', minWidth: 90 }}>
              <Typography variant="caption" color="text.secondary">Difference</Typography>
              <Typography sx={{ fontWeight: 900, color: p.difference > 0 ? 'success.main' : p.difference < 0 ? 'warning.dark' : 'text.primary' }}>
                {p.difference > 0 ? '+' : p.difference < 0 ? '−' : ''}{rupees(Math.abs(p.difference))}
              </Typography>
            </Box>
            <Chip size="small" label={meta.label} color={meta.color} variant="outlined" sx={{ fontWeight: 700, display: { xs: 'none', md: 'inline-flex' } }} />
            <ExpandMoreIcon sx={{ transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'none', color: 'text.secondary' }} />
          </Stack>
        </Stack>
      </Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }} sx={{ px: 2, pb: 2 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', flex: 1 }}>{advice(p)}</Typography>
        {p.status === 'onlyWe' && (
          <Button size="small" variant="outlined" startIcon={<LinkIcon />} onClick={() => onLink(p)} sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}>
            Gave under another name? Link
          </Button>
        )}
      </Stack>
      <Collapse in={open} unmountOnExit>
        <Grid container spacing={2} sx={{ px: 2, pb: 2 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.75, display: 'flex', alignItems: 'center', gap: 0.5 }}><CallMadeIcon fontSize="small" color="secondary" /> We gave</Typography>
            {p.gave.length ? p.gave.map((g) => (
              <Stack key={g.id} direction="row" justifyContent="space-between" sx={{ py: 0.75, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="body2">{g.eventName || 'Their function'}{g.eventDate ? ` · ${fmtDate(g.eventDate)}` : ''}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{rupees(g.amount)}</Typography>
              </Stack>
            )) : (
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="body2" color="text.secondary">Nothing recorded.</Typography>
              </Stack>
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.75, display: 'flex', alignItems: 'center', gap: 0.5 }}><CallReceivedIcon fontSize="small" color="success" /> They gave at our functions</Typography>
            {p.got.length ? p.got.map((g) => (
              <Stack key={g.id} direction="row" justifyContent="space-between" sx={{ py: 0.75, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="body2">{g.functionName || 'Our function'}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{rupees(g.amount)}</Typography>
              </Stack>
            )) : (
              <Typography variant="body2" color="text.secondary">Nothing yet.</Typography>
            )}
          </Grid>
        </Grid>
      </Collapse>
    </Card>
  );
};

/** Pick the person who gave at our function, when the spelling differs from ours. */
const LinkDialog = ({ open, person, candidates, onClose, onLinked }) => {
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (open) setQ('');
  }, [open, person]);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return candidates.filter((c) => !s || `${fullName(c)} ${c.place || ''} ${c.phone || ''}`.toLowerCase().includes(s)).slice(0, 50);
  }, [q, candidates]);
  const pick = async (c) => {
    setBusy(true);
    const res = await linkGiven(person.gave[0].id, c.got[0].id);
    setBusy(false);
    if (!res.ok) {
      notify.error(res.message);
      return;
    }
    notify.success(`Linked with ${fullName(c)}`);
    onLinked();
  };
  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ pr: 6 }}>
        Link {person ? fullName(person) : ''}
        <Typography variant="body2" color="text.secondary">Choose the same person from those who gave at our functions. Their mobile (or name and place) is copied to our entry.</Typography>
        <IconButton onClick={onClose} aria-label="Close" sx={{ position: 'absolute', right: 12, top: 12 }}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <TextField size="small" fullWidth placeholder="Search name, place or mobile" value={q} onChange={(e) => setQ(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }} inputProps={{ 'aria-label': 'Search people' }} sx={{ mb: 1 }} />
        {list.length ? (
          <List dense>
            {list.map((c) => (
              <ListItemButton key={c.key} onClick={() => pick(c)} disabled={busy} sx={{ borderRadius: 2 }}>
                <ListItemText primary={fullName(c)} secondary={[c.place, c.phone, `gave ${rupees(c.theyGave)}`].filter(Boolean).join(' · ')} />
              </ListItemButton>
            ))}
          </List>
        ) : (
          <Typography color="text.secondary" sx={{ py: 2 }}>No one found. Only people who gave at our functions and are not matched yet are listed.</Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};

const MoiGiven = () => {
  const theme = useTheme();
  const [params, setParams] = useSearchParams();
  const view = params.get('view') === 'list' ? 'list' : 'compare';
  const setView = (v) => {
    const next = new URLSearchParams(params);
    if (v === 'list') next.set('view', 'list');
    else next.delete('view');
    setParams(next, { replace: true });
  };

  // Give & take
  const [functionId, setFunctionId] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [cmp, setCmp] = useState({ items: [], counts: {}, totals: {}, functions: [] });
  const [cmpLoading, setCmpLoading] = useState(true);
  const [error, setError] = useState('');
  const [linking, setLinking] = useState(null);

  // We gave
  const [rows, setRows] = useState({ items: [], total: 0, all: 0, totalAmount: 0 });
  const [listSearch, setListSearch] = useState('');
  const [listLoading, setListLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const loadCompare = useCallback(async () => {
    setCmpLoading(true);
    const res = await compareGiven({ function_id: functionId || undefined });
    setCmpLoading(false);
    if (!res.ok) return setError(res.message);
    setError('');
    setCmp(res.data);
  }, [functionId]);

  const loadList = useCallback(async () => {
    setListLoading(true);
    const res = await listGiven({ page_size: 500 });
    setListLoading(false);
    if (!res.ok) return setError(res.message);
    setError('');
    setRows(res.data);
  }, []);

  useEffect(() => {
    document.title = 'Moi we gave · My Success';
    loadCompare();
  }, [loadCompare]);
  useEffect(() => {
    loadList();
  }, [loadList]);

  const reloadAll = () => {
    loadCompare();
    loadList();
  };

  const people = useMemo(() => {
    const s = search.trim().toLowerCase();
    return (cmp.items || []).filter((p) => (!status || p.status === status) && (!s || `${fullName(p)} ${p.place || ''} ${p.phone || ''}`.toLowerCase().includes(s)));
  }, [cmp.items, status, search]);
  const linkCandidates = useMemo(() => (cmp.items || []).filter((p) => p.status === 'onlyThey'), [cmp.items]);
  const listed = useMemo(() => {
    const s = listSearch.trim().toLowerCase();
    return (rows.items || []).filter((g) => !s || `${fullName(g)} ${g.place || ''} ${g.phone || ''} ${g.eventName || ''}`.toLowerCase().includes(s));
  }, [rows.items, listSearch]);

  const toReturn = (cmp.items || []).filter((p) => p.status === 'theyMore' || p.status === 'onlyThey').length;

  const doDelete = async () => {
    const res = await deleteGiven(deleting.id);
    if (!res.ok) notify.error(res.message);
    else notify.success('Deleted. It stays in History.');
    setDeleting(null);
    reloadAll();
  };

  const toExcel = () =>
    exportExcel({
      fileName: 'MoiGiveAndTake.xlsx',
      sheetName: 'Give and take',
      columns: [
        { key: 'sNo', label: 'S.No' },
        { key: 'name', label: 'Name', value: (r) => fullName(r) },
        { key: 'place', label: 'Place' },
        { key: 'phone', label: 'Mobile' },
        { key: 'weGave', label: 'We gave' },
        { key: 'theyGave', label: 'They gave' },
        { key: 'difference', label: 'Difference (they − we)' },
        { key: 'status', label: 'Status', value: (r) => STATUS[r.status]?.label },
        { key: 'gave', label: 'Where we gave', value: (r) => r.gave.map((g) => `${g.eventName || 'Their function'}${g.eventDate ? ` (${fmtDate(g.eventDate)})` : ''}: ${g.amount}`).join('; ') },
        { key: 'got', label: 'Where they gave', value: (r) => r.got.map((g) => `${g.functionName || 'Our function'}: ${g.amount}`).join('; ') },
      ],
      rows: people,
    });

  const stats = [
    { label: 'We gave', value: cmp.totals?.weGave || 0, icon: <CallMadeIcon />, color: theme.palette.secondary.main },
    { label: functionId ? 'They gave at this function' : 'They gave at our functions', value: cmp.totals?.theyGave || 0, icon: <CallReceivedIcon />, color: theme.palette.success.main },
    { label: 'People', value: cmp.counts?.all || 0, icon: <PeopleAltOutlinedIcon />, color: theme.palette.info.main, plain: true },
    { label: 'To return', value: toReturn, icon: <RedeemOutlinedIcon />, color: theme.palette.warning.main, plain: true, hint: 'They gave more than we did' },
  ];

  return (
    <Box>
      <PageHeader
        title="Moi we gave"
        subtitle="Moi you gave at other people's functions, and how it compares with what they gave at yours, so you know what to return."
        breadcrumbs={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Moi we gave' }]}
        actions={<Button variant="contained" startIcon={<AddIcon />} onClick={() => setEditing({})}>Add moi we gave</Button>}
      />

      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        {stats.map((s, i) => (
          <Grid item xs={6} md={3} key={s.label}>
            <Card component={motion.div} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.06 } }} variant="outlined" sx={{ p: 2, height: '100%', borderRadius: 3 }}>
              <Stack direction="row" spacing={1.25} alignItems="center">
                <Box sx={{ width: 36, height: 36, borderRadius: 2, display: 'grid', placeItems: 'center', color: s.color, bgcolor: alpha(s.color, 0.12) }}>{s.icon}</Box>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>{s.label}</Typography>
              </Stack>
              <Typography variant="h5" component="p" fontWeight={800} sx={{ mt: 1, fontVariantNumeric: 'tabular-nums' }}>
                {s.plain ? s.value.toLocaleString('en-IN') : <AnimatedNumber value={s.value} />}
              </Typography>
              {s.hint && <Typography variant="caption" color="text.secondary">{s.hint}</Typography>}
            </Card>
          </Grid>
        ))}
      </Grid>

      <Tabs value={view} onChange={(_, v) => setView(v)} sx={{ mb: 2 }}>
        <Tab value="compare" label="Give & take" sx={{ fontWeight: 700 }} />
        <Tab value="list" label={`We gave (${rows.all || 0})`} sx={{ fontWeight: 700 }} />
      </Tabs>

      {error && <Alert severity="error" sx={{ mb: 2 }} action={<Button color="inherit" onClick={reloadAll}>Retry</Button>}>{error}</Alert>}

      {view === 'compare' ? (
        <>
          <Card variant="outlined" sx={{ borderRadius: 3, mb: 2 }}>
            <Tabs value={status} onChange={(_, v) => setStatus(v)} variant="scrollable" allowScrollButtonsMobile sx={{ px: 1, borderBottom: 1, borderColor: 'divider' }}>
              {STATUS_TABS.map((k) => (
                <Tab key={k || 'all'} value={k} label={`${k ? STATUS[k].label : 'All'} (${(k ? cmp.counts?.[k] : cmp.counts?.all) ?? 0})`} sx={{ fontWeight: 700 }} />
              ))}
            </Tabs>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ p: 2 }}>
              <TextField size="small" placeholder="Search name, place or mobile" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ flex: 2, minWidth: 200 }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }} inputProps={{ 'aria-label': 'Search people' }} />
              <TextField select size="small" label="Our function" value={functionId} onChange={(e) => setFunctionId(e.target.value)} sx={{ flex: 1, minWidth: 220 }} InputLabelProps={{ shrink: true }} SelectProps={{ displayEmpty: true }}>
                <MenuItem value="">All our functions</MenuItem>
                {(cmp.functions || []).map((f) => <MenuItem key={f.id} value={f.id}>{f.functionName}{f.functionDate ? ` · ${fmtDate(f.functionDate)}` : ''}</MenuItem>)}
              </TextField>
              <Button variant="outlined" startIcon={<FileDownloadOutlinedIcon />} onClick={toExcel} disabled={!people.length}>Excel</Button>
            </Stack>
          </Card>
          {cmpLoading && !cmp.items?.length ? (
            <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}><CircularProgress /></Box>
          ) : !people.length ? (
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <EmptyState icon={<RedeemOutlinedIcon />} title={cmp.items?.length ? 'No one here' : 'Nothing to compare yet'} description={cmp.items?.length ? 'Try another filter.' : 'Add the moi you gave at other people\'s functions. Once they give at your function, you will see them side by side here.'} action={!cmp.items?.length && <Button variant="contained" startIcon={<AddIcon />} onClick={() => setEditing({})}>Add moi we gave</Button>} />
            </Card>
          ) : (
            <Stack spacing={1.25}>
              <AnimatePresence initial={false}>
                {people.map((p, i) => <PersonCard key={p.key} p={p} index={i} onLink={setLinking} />)}
              </AnimatePresence>
            </Stack>
          )}
        </>
      ) : (
        <>
          <Card variant="outlined" sx={{ borderRadius: 3, mb: 2, p: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
              <TextField size="small" placeholder="Search name, place, mobile or function" value={listSearch} onChange={(e) => setListSearch(e.target.value)} sx={{ flex: 1 }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }} inputProps={{ 'aria-label': 'Search moi we gave' }} />
              <Typography sx={{ fontWeight: 800 }}>Total {rupees(rows.totalAmount)}</Typography>
            </Stack>
          </Card>
          {listLoading && !rows.items.length ? (
            <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}><CircularProgress /></Box>
          ) : !listed.length ? (
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <EmptyState icon={<CallMadeIcon />} title="No moi recorded yet" description="Record the moi you give at other people's functions here." action={<Button variant="contained" startIcon={<AddIcon />} onClick={() => setEditing({})}>Add moi we gave</Button>} />
            </Card>
          ) : (
            <Stack spacing={1}>
              <AnimatePresence initial={false}>
                {listed.map((g, i) => (
                  <Card key={g.id} component={motion.div} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ delay: Math.min(i, 12) * 0.03 }} variant="outlined" sx={{ p: 1.75, borderRadius: 3 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.14), color: 'secondary.main', fontWeight: 800 }}>{(g.name || '?').charAt(0).toUpperCase()}</Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 800 }} noWrap>{fullName(g)}</Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {[g.place, g.phone, g.eventName, g.eventDate && fmtDate(g.eventDate)].filter(Boolean).join(' · ')}
                        </Typography>
                      </Box>
                      <Typography sx={{ fontWeight: 900, whiteSpace: 'nowrap' }}>{rupees(g.amount)}</Typography>
                      <Tooltip title="Edit"><IconButton onClick={() => setEditing(g)} aria-label={`Edit ${g.name}`}><EditOutlinedIcon /></IconButton></Tooltip>
                      <Tooltip title="Delete"><IconButton onClick={() => setDeleting(g)} aria-label={`Delete ${g.name}`} color="error"><DeleteOutlineIcon /></IconButton></Tooltip>
                    </Stack>
                  </Card>
                ))}
              </AnimatePresence>
            </Stack>
          )}
        </>
      )}

      <EntryDialog open={!!editing} entry={editing?.id ? editing : null} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reloadAll(); }} />
      <LinkDialog open={!!linking} person={linking} candidates={linkCandidates} onClose={() => setLinking(null)} onLinked={() => { setLinking(null); reloadAll(); }} />
      <ConfirmDialog
        open={!!deleting}
        danger
        title="Delete this entry?"
        message={deleting ? `${fullName(deleting)}: ${rupees(deleting.amount)}. It is removed from the list but stays in History.` : ''}
        confirmLabel="Delete"
        onConfirm={doDelete}
        onClose={() => setDeleting(null)}
      />
    </Box>
  );
};

export default MoiGiven;
