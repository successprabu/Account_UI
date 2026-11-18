import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Alert, Avatar, Box, Button, Card, Chip, CircularProgress, FormControlLabel, Grid, InputAdornment, MenuItem, Stack, Switch, Tab, Tabs, TextField, Tooltip, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RestoreIcon from '@mui/icons-material/Restore';
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import HistoryIcon from '@mui/icons-material/History';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import { EmptyState, PageHeader } from '../ui';
import { listHistory } from '../../api/history';
import { readUser } from '../moitech/ReportPage';
import { exportExcel } from '../moitech/reportExport';
import { rupees } from '../moitech/shared';

/**
 * Moitech history for the admin: every receipt, expense and gift that was added, edited, deleted or restored,
 * and every handover, with who did it and what changed. Read only: history cannot be edited or deleted.
 */

export const ACTIONS = {
  Added: { label: 'Added', icon: <AddCircleOutlineIcon />, color: 'success' },
  Edited: { label: 'Edited', icon: <EditOutlinedIcon />, color: 'warning' },
  Deleted: { label: 'Deleted', icon: <DeleteOutlineIcon />, color: 'error' },
  Restored: { label: 'Restored', icon: <RestoreIcon />, color: 'info' },
  Handover: { label: 'Handover', icon: <HandshakeOutlinedIcon />, color: 'secondary' },
};
const TABS = ['', 'Edited', 'Deleted', 'Added', 'Restored', 'Handover'];
const ENTITIES = [
  { value: '', label: 'Everything' },
  { value: 'Receipt', label: 'Receipts' },
  { value: 'Expense', label: 'Expenses' },
  { value: 'Others', label: 'Other gifts' },
  { value: 'Handover', label: 'Handovers' },
];
const ENTITY_WORD = { Receipt: 'receipt', Expense: 'expense', Others: 'gift', Handover: 'handover' };

export const FIELD_LABEL = {
  place: 'Place',
  initial: 'Surname',
  name: 'Name',
  oldAmount: 'Old amount',
  newAmount: 'New amount',
  amount: 'Amount',
  others: 'Count',
  othersType: 'Gift type',
  othersRemark: 'Gift details',
  phone: 'Mobile',
  remarks: 'Remarks',
  returnStatus: 'Return status',
  returnRemark: 'Return remark',
  active: 'Active',
};
const MONEY_FIELDS = new Set(['oldAmount', 'newAmount', 'amount']);
const PAGE = 50;

const fmtTime = (v) => (v ? new Date(v).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '');
const showValue = (field, v) => (v === null || v === undefined || v === '' ? '—' : MONEY_FIELDS.has(field) ? rupees(v) : v);

/** One line of history: who did what, the amounts, and each field that changed. */
const HistoryItem = ({ h, index }) => {
  const theme = useTheme();
  const meta = ACTIONS[h.action] || ACTIONS.Edited;
  const color = theme.palette[meta.color].main;
  const reduced = h.entity !== 'Handover' && h.amountBefore != null && (h.action === 'Deleted' || (h.amountAfter != null && h.amountAfter < h.amountBefore));
  const who = h.changedByName || 'Unknown user';
  // The request named a different user than the one signed in (worth a look).
  const claimed = h.claimedBy && /^\d+$/.test(h.claimedBy) && h.changedById && Number(h.claimedBy) !== h.changedById;
  // Gifts like gold coins have no amount: show what was given instead.
  const gift = h.entity === 'Others' && h.snapshot?.others ? [`${h.snapshot.others} ${h.snapshot.othersType || ''}`.trim(), h.snapshot.othersRemark].filter(Boolean).join(' · ') : '';
  const sameAmount = h.amountBefore != null && h.amountAfter != null && Number(h.amountBefore) === Number(h.amountAfter);
  const what = h.entity === 'Handover'
    ? h.action === 'Handover' ? `recorded the handover from ${h.name || 'a helper'}` : `changed the handover from ${h.name || 'a helper'}`
    : `${meta.label.toLowerCase()} ${h.entity === 'Expense' ? 'an' : 'a'} ${ENTITY_WORD[h.entity] || 'entry'}`;

  return (
    <Card
      component={motion.div}
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index, 12) * 0.03 }}
      variant="outlined"
      sx={{ p: 2, borderRadius: 3, borderLeft: `4px solid ${color}`, bgcolor: reduced ? alpha(theme.palette.error.main, 0.04) : 'background.paper' }}
    >
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Avatar sx={{ bgcolor: alpha(color, 0.14), color, width: 40, height: 40 }}>{meta.icon}</Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={0.5}>
            <Typography sx={{ fontWeight: 600 }}>
              <Box component="span" sx={{ fontWeight: 800 }}>{who}</Box> {what}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>{fmtTime(h.changedAt)}</Typography>
          </Stack>
          {h.entity !== 'Handover' ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              {[h.name, h.place].filter(Boolean).join(' · ')}
            </Typography>
          ) : (
            h.place && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>Received by {h.place}</Typography>
          )}

          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
            {gift && <Chip size="small" color="secondary" variant="outlined" label={gift} sx={{ fontWeight: 700 }} />}
            {h.amountBefore != null && !sameAmount && (
              <Typography sx={{ fontWeight: 700, textDecoration: h.action === 'Deleted' ? 'line-through' : 'none', color: h.action === 'Deleted' ? 'error.main' : 'text.secondary' }}>
                {rupees(h.amountBefore)}
              </Typography>
            )}
            {h.amountBefore != null && h.amountAfter != null && !sameAmount && <ArrowForwardIcon fontSize="small" color="disabled" />}
            {h.amountAfter != null && !(gift && Number(h.amountAfter) === 0) && <Typography sx={{ fontWeight: 800 }}>{rupees(h.amountAfter)}</Typography>}
            {reduced && (
              <Chip size="small" color="error" icon={<WarningAmberIcon />} label={`${rupees(h.amountBefore - (h.action === 'Deleted' ? 0 : h.amountAfter))} less`} sx={{ fontWeight: 700 }} />
            )}
            {claimed && (
              <Tooltip title="The entry said it was made by a different user than the one signed in.">
                <Chip size="small" variant="outlined" color="warning" label={`Request said user #${h.claimedBy}`} />
              </Tooltip>
            )}
          </Stack>

          {Array.isArray(h.changes) && h.action !== 'Deleted' && h.changes.length > 0 && (
            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
              {h.changes.map((c) => (
                <Chip
                  key={c.field}
                  size="small"
                  variant="outlined"
                  label={
                    <span>
                      <b>{FIELD_LABEL[c.field] || c.field}:</b> <s style={{ opacity: 0.7 }}>{showValue(c.field, c.from)}</s> → {showValue(c.field, c.to)}
                    </span>
                  }
                />
              ))}
            </Stack>
          )}
        </Box>
      </Stack>
    </Card>
  );
};

const History = () => {
  const theme = useTheme();
  const user = readUser();
  const [params, setParams] = useSearchParams();
  const tab = params.get('action') ?? '';
  const [entity, setEntity] = useState('');
  const [person, setPerson] = useState(params.get('person') ? Number(params.get('person')) : null);
  const [search, setSearch] = useState('');
  const [applied, setApplied] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [allFunctions, setAllFunctions] = useState(false);
  const [data, setData] = useState({ items: [], total: 0, counts: {}, people: [] });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const filters = useMemo(
    () => ({
      function_id: allFunctions ? undefined : user?.functionId || undefined,
      action: tab || undefined,
      entity: entity || undefined,
      changed_by: person ?? undefined,
      search: applied || undefined,
      from: from || undefined,
      to: to || undefined,
    }),
    [allFunctions, tab, entity, person, applied, from, to, user?.functionId]
  );

  const load = useCallback(
    async (pageNo = 1) => {
      setLoading(true);
      const res = await listHistory({ ...filters, page: pageNo, page_size: PAGE });
      setLoading(false);
      if (!res.ok) {
        setError(res.message);
        return;
      }
      setError('');
      setPage(pageNo);
      setData((d) => ({ ...res.data, items: pageNo === 1 ? res.data.items || [] : [...d.items, ...(res.data.items || [])] }));
    },
    [filters]
  );

  useEffect(() => {
    document.title = 'History · My Success';
    load(1);
  }, [load]);

  const counts = data.counts || {};
  const countOf = (k) => (k ? counts[k.charAt(0).toLowerCase() + k.slice(1)] ?? counts[k] : counts.all ?? counts.All) ?? 0;
  const setTab = (v) => {
    const next = new URLSearchParams(params);
    if (v) next.set('action', v);
    else next.delete('action');
    setParams(next, { replace: true });
  };

  const toExcel = () =>
    exportExcel({
      fileName: 'MoitechHistory.xlsx',
      sheetName: 'History',
      columns: [
        { key: 'sNo', label: 'S.No' },
        { key: 'changedAt', label: 'When', value: (r) => fmtTime(r.changedAt) },
        { key: 'changedByName', label: 'Who' },
        { key: 'action', label: 'Action' },
        { key: 'entity', label: 'Type' },
        { key: 'name', label: 'Name' },
        { key: 'place', label: 'Place / received by' },
        { key: 'amountBefore', label: 'Amount before' },
        { key: 'amountAfter', label: 'Amount after' },
        {
          key: 'changes',
          label: 'What changed',
          value: (r) => (Array.isArray(r.changes) ? r.changes.map((c) => `${FIELD_LABEL[c.field] || c.field}: ${c.from ?? ''} -> ${c.to ?? ''}`).join('; ') : ''),
        },
      ],
      rows: data.items,
    });

  return (
    <Box>
      <PageHeader
        title="History"
        subtitle="Every receipt, expense and gift that was added, changed or deleted, and every handover. No one can edit or delete this history."
        breadcrumbs={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'History' }]}
        actions={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<FileDownloadOutlinedIcon />} onClick={toExcel} disabled={!data.items.length}>Excel</Button>
            <Tooltip title="Refresh"><span><Button variant="outlined" onClick={() => load(1)} aria-label="Refresh" sx={{ minWidth: 0, px: 1.25 }}><RefreshIcon /></Button></span></Tooltip>
          </Stack>
        }
      />

      <Alert icon={<LockOutlinedIcon />} severity="info" sx={{ mb: 2.5, borderRadius: 3 }}>
        History is saved automatically when anyone adds, edits or deletes an entry, or records a handover. It cannot be changed or deleted, by anyone.
      </Alert>

      {/* Who changed what: one card per person, people with edits and deletes first. */}
      {data.people?.length > 0 && (
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>By person</Typography>
          <Grid container spacing={1.5}>
            {data.people.map((p, i) => {
              const on = person === p.changedById;
              const flagged = p.deleted > 0 || p.reduced > 0;
              return (
                <Grid item xs={12} sm={6} md={4} key={`${p.changedById}-${i}`}>
                  <Card
                    component={motion.button}
                    type="button"
                    whileHover={{ y: -3 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setPerson(on ? null : p.changedById)}
                    aria-pressed={on}
                    variant="outlined"
                    sx={{ width: '100%', textAlign: 'left', p: 1.75, borderRadius: 3, cursor: 'pointer', font: 'inherit', color: 'inherit', borderColor: on ? 'primary.main' : flagged ? alpha(theme.palette.error.main, 0.5) : 'divider', bgcolor: on ? alpha(theme.palette.primary.main, 0.06) : 'background.paper', borderWidth: on ? 2 : 1 }}
                  >
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <Avatar sx={{ bgcolor: flagged ? 'error.main' : 'primary.main', width: 36, height: 36, fontSize: 16 }}>{(p.name || '?').charAt(0).toUpperCase()}</Avatar>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography sx={{ fontWeight: 800 }} noWrap>{p.name || 'Unknown user'}</Typography>
                        <Typography variant="caption" color="text.secondary">Last change {fmtTime(p.last)}</Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 1.25 }}>
                      <Chip size="small" label={`${p.added} added`} />
                      <Chip size="small" color={p.edited ? 'warning' : 'default'} label={`${p.edited} edited`} />
                      <Chip size="small" color={p.deleted ? 'error' : 'default'} label={`${p.deleted} deleted`} />
                      {p.restored > 0 && <Chip size="small" color="info" label={`${p.restored} restored`} />}
                      {p.handovers > 0 && <Chip size="small" color="secondary" label={`${p.handovers} handover${p.handovers > 1 ? 's' : ''}`} />}
                      {p.reduced > 0 && <Chip size="small" color="error" variant="outlined" label={`${rupees(p.reduced)} reduced`} sx={{ fontWeight: 700 }} />}
                    </Stack>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      <Card variant="outlined" sx={{ borderRadius: 3, mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" allowScrollButtonsMobile sx={{ px: 1, borderBottom: 1, borderColor: 'divider' }}>
          {TABS.map((k) => (
            <Tab key={k || 'all'} value={k} label={`${k ? ACTIONS[k].label : 'All'} (${countOf(k)})`} sx={{ fontWeight: 700 }} />
          ))}
        </Tabs>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ p: 2 }} alignItems={{ md: 'center' }}>
          <TextField
            size="small"
            placeholder="Search name, place or person"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setApplied(search.trim())}
            onBlur={() => setApplied(search.trim())}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
            sx={{ flex: 2, minWidth: 200 }}
            inputProps={{ 'aria-label': 'Search history' }}
          />
          <TextField select size="small" label="Type" value={entity} onChange={(e) => setEntity(e.target.value)} sx={{ minWidth: 150 }}>
            {ENTITIES.map((e) => <MenuItem key={e.value} value={e.value}>{e.label}</MenuItem>)}
          </TextField>
          <TextField size="small" type="date" label="From" value={from} onChange={(e) => setFrom(e.target.value)} InputLabelProps={{ shrink: true }} />
          <TextField size="small" type="date" label="To" value={to} onChange={(e) => setTo(e.target.value)} InputLabelProps={{ shrink: true }} />
          <FormControlLabel control={<Switch checked={allFunctions} onChange={(e) => setAllFunctions(e.target.checked)} />} label="All functions" sx={{ whiteSpace: 'nowrap' }} />
        </Stack>
        {person != null && (
          <Box sx={{ px: 2, pb: 2 }}>
            <Chip label={`Only ${data.people?.find((p) => p.changedById === person)?.name || 'this person'}`} onDelete={() => setPerson(null)} color="primary" />
          </Box>
        )}
      </Card>

      {error ? (
        <Alert severity="error" action={<Button color="inherit" onClick={() => load(1)}>Retry</Button>}>{error}</Alert>
      ) : loading && !data.items.length ? (
        <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}><CircularProgress /></Box>
      ) : !data.items.length ? (
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <EmptyState icon={<HistoryIcon />} title="Nothing here yet" description="Changes appear here as soon as anyone adds, edits or deletes an entry or records a handover." />
        </Card>
      ) : (
        <Stack spacing={1.25}>
          <AnimatePresence initial={false}>
            {data.items.map((h, i) => <HistoryItem key={h.id} h={h} index={i % PAGE} />)}
          </AnimatePresence>
          {data.items.length < data.total && (
            <Button onClick={() => load(page + 1)} disabled={loading} sx={{ alignSelf: 'center' }}>
              {loading ? 'Loading…' : `Show more (${data.total - data.items.length} left)`}
            </Button>
          )}
        </Stack>
      )}
    </Box>
  );
};

export default History;
