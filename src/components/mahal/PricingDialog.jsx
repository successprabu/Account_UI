import { useEffect, useMemo, useState } from 'react';
import {
  Alert, Box, Button, Card, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, IconButton,
  InputAdornment, MenuItem, Stack, Switch, Tab, Tabs, TextField, Tooltip, Typography, useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CelebrationOutlinedIcon from '@mui/icons-material/CelebrationOutlined';
import WeekendOutlinedIcon from '@mui/icons-material/WeekendOutlined';
import TodayOutlinedIcon from '@mui/icons-material/TodayOutlined';
import { deletePackage, listPackages, savePackage, savePricing } from '../../api/mahalPlus';
import { toDay } from '../../api/mahal';
import { notify } from '../ui';
import { rupees } from './shared';
import { useTx } from '../../language/site';

const money = (v) => String(v ?? '').replace(/[^\d.]/g, '').slice(0, 10);
const nice = (d) => new Date(`${d}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

/** Day prices: weekend price, muhurtham price on dates the owner marks, and a weekday discount. */
const DayPrices = ({ mahal, onSaved }) => {
  const tx = useTx();
  const [form, setForm] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      weekendPrice: mahal.weekendPrice ? String(mahal.weekendPrice) : '',
      muhurthamPrice: mahal.muhurthamPrice ? String(mahal.muhurthamPrice) : '',
      weekdayDiscount: mahal.weekdayDiscount ? String(mahal.weekdayDiscount) : '',
      specialDates: mahal.specialDates || [],
    });
  }, [mahal]);

  const today = toDay(new Date());
  const upcoming = useMemo(() => (form?.specialDates || []).filter((d) => d >= today), [form, today]);
  const past = (form?.specialDates || []).length - upcoming.length;

  if (!form) return null;

  const addDate = () => {
    if (!newDate) return;
    setForm((f) => ({ ...f, specialDates: [...new Set([...f.specialDates, newDate])].sort() }));
    setNewDate('');
  };

  const save = async () => {
    setSaving(true);
    const res = await savePricing({
      mahalId: mahal.id,
      weekendPrice: Number(form.weekendPrice) || null,
      muhurthamPrice: Number(form.muhurthamPrice) || null,
      weekdayDiscount: Number(form.weekdayDiscount) || null,
      specialDates: form.specialDates,
    });
    setSaving(false);
    if (res.ok) {
      notify.success(tx(res.message));
      onSaved(res.data);
    } else notify.error(tx(res.message));
  };

  const base = Number(mahal.pricePerDay) || 0;
  const weekday = base * (1 - (Number(form.weekdayDiscount) || 0) / 100);

  return (
    <Stack spacing={2.5}>
      <Typography variant="body2" color="text.secondary">
        {tx('Normal rent: {{amount}} / day (change it under Edit). Leave a box empty to use the normal rent.', { amount: rupees(base) })}
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField fullWidth label={tx('Weekend rent (Sat, Sun)')} value={form.weekendPrice} onChange={(e) => setForm({ ...form, weekendPrice: money(e.target.value) })}
          InputProps={{ startAdornment: <InputAdornment position="start"><WeekendOutlinedIcon fontSize="small" /></InputAdornment> }} inputProps={{ inputMode: 'decimal' }} />
        <TextField fullWidth label={tx('Muhurtham day rent')} value={form.muhurthamPrice} onChange={(e) => setForm({ ...form, muhurthamPrice: money(e.target.value) })}
          InputProps={{ startAdornment: <InputAdornment position="start"><CelebrationOutlinedIcon fontSize="small" /></InputAdornment> }} inputProps={{ inputMode: 'decimal' }} />
        <TextField label={tx('Weekday discount')} value={form.weekdayDiscount} sx={{ minWidth: 150 }}
          onChange={(e) => setForm({ ...form, weekdayDiscount: money(e.target.value).slice(0, 4) })}
          InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} inputProps={{ inputMode: 'decimal' }} />
      </Stack>
      {base > 0 && (
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip icon={<TodayOutlinedIcon />} label={`${tx('Weekday')}: ${rupees(weekday)}`} variant="outlined" />
          <Chip icon={<WeekendOutlinedIcon />} label={`${tx('Weekend')}: ${rupees(Number(form.weekendPrice) || base)}`} variant="outlined" />
          <Chip icon={<CelebrationOutlinedIcon />} color="secondary" label={`${tx('Muhurtham day')}: ${rupees(Number(form.muhurthamPrice) || base)}`} variant="outlined" />
        </Stack>
      )}

      <Card variant="outlined" sx={{ p: 2 }}>
        <Typography fontWeight={700}>{tx('Muhurtham and peak dates')}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          {tx('Add the auspicious days and festival dates when you charge the muhurtham rent. Customers see these dates and the price on your hall page.')}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
          <TextField type="date" size="small" value={newDate} onChange={(e) => setNewDate(e.target.value)} inputProps={{ min: today }} InputLabelProps={{ shrink: true }} label={tx('Date')} />
          <Button variant="outlined" startIcon={<AddIcon />} onClick={addDate} disabled={!newDate}>{tx('Add date')}</Button>
        </Stack>
        {upcoming.length === 0 ? (
          <Typography variant="body2" color="text.secondary">{tx('No dates added yet.')}</Typography>
        ) : (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {upcoming.map((d) => (
              <Chip key={d} label={nice(d)} color="secondary" variant="outlined" onDelete={() => setForm((f) => ({ ...f, specialDates: f.specialDates.filter((x) => x !== d) }))} />
            ))}
          </Stack>
        )}
        {past > 0 && (
          <Button size="small" sx={{ mt: 1 }} onClick={() => setForm((f) => ({ ...f, specialDates: f.specialDates.filter((d) => d >= today) }))}>
            {tx('Remove {{n}} past dates', { n: past })}
          </Button>
        )}
      </Card>

      <Box sx={{ textAlign: 'right' }}>
        <Button variant="contained" onClick={save} disabled={saving}>{saving ? <CircularProgress size={20} /> : tx('Save prices')}</Button>
      </Box>
    </Stack>
  );
};

const emptyItem = (mahalId, kind) => ({ id: 0, mahalId, kind, name: '', description: '', price: '', unit: 'day', sortOrder: 0, isActive: true });

/** Packages (per day, on top of the rent) and add-ons (per day or once per event). */
const Packages = ({ mahal }) => {
  const tx = useTx();
  const [items, setItems] = useState(null);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const res = await listPackages(mahal.id);
    setItems(res.ok ? res.data || [] : []);
    if (!res.ok) notify.error(tx(res.message));
  };
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mahal.id]);

  const save = async () => {
    if (!editing.name.trim()) {
      notify.error(tx('Please enter a name.'));
      return;
    }
    setSaving(true);
    const res = await savePackage({ ...editing, price: Number(editing.price) || 0, sortOrder: Number(editing.sortOrder) || 0 });
    setSaving(false);
    if (res.ok) {
      notify.success(tx(res.message));
      setEditing(null);
      load();
    } else notify.error(tx(res.message));
  };

  const remove = async (item) => {
    if (!window.confirm(tx('Delete "{{name}}"? Bookings that already have it keep their amounts.', { name: item.name }))) return;
    const res = await deletePackage(item.id);
    if (res.ok) load();
    else notify.error(tx(res.message));
  };

  const group = (kind, title, hint, examples) => (
    <Card variant="outlined" sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
        <Box>
          <Typography fontWeight={700}>{tx(title)}</Typography>
          <Typography variant="body2" color="text.secondary">{tx(hint)}</Typography>
        </Box>
        <Button size="small" startIcon={<AddIcon />} onClick={() => setEditing(emptyItem(mahal.id, kind))} sx={{ flexShrink: 0 }}>{tx('Add')}</Button>
      </Stack>
      <Stack spacing={1} sx={{ mt: 1.5 }}>
        {(items || []).filter((x) => x.kind === kind).map((x) => (
          <Stack key={x.id} direction="row" spacing={1} alignItems="center" sx={{ p: 1, borderRadius: 2, bgcolor: 'action.hover', opacity: x.isActive ? 1 : 0.5 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography fontWeight={600} noWrap>{x.name}</Typography>
              {x.description && <Typography variant="caption" color="text.secondary" noWrap component="div">{x.description}</Typography>}
            </Box>
            <Typography fontWeight={800}>{rupees(x.price)}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 64 }}>{tx(x.unit === 'event' ? 'per event' : 'per day')}</Typography>
            <Tooltip title={tx('Edit')}><IconButton size="small" onClick={() => setEditing({ ...x, price: String(x.price), description: x.description || '' })}><EditOutlinedIcon fontSize="small" /></IconButton></Tooltip>
            <Tooltip title={tx('Delete')}><IconButton size="small" color="error" onClick={() => remove(x)}><DeleteOutlineIcon fontSize="small" /></IconButton></Tooltip>
          </Stack>
        ))}
        {items && !items.some((x) => x.kind === kind) && <Typography variant="body2" color="text.secondary">{tx(examples)}</Typography>}
      </Stack>
    </Card>
  );

  if (!items) return <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>;

  return (
    <Stack spacing={2}>
      {group('package', 'Packages', 'Charged for every day, on top of the hall rent. The customer picks one.', 'For example: Hall + dining hall, Hall + 10 rooms.')}
      {group('addon', 'Add-ons', 'Extras the customer can add. Charged per day or once per event.', 'For example: AC, generator backup, stage decoration, sound system.')}
      {editing && (
        <Card variant="outlined" sx={{ p: 2, borderColor: 'primary.main' }}>
          <Typography fontWeight={700} sx={{ mb: 1.5 }}>{tx(editing.id ? 'Edit' : editing.kind === 'addon' ? 'New add-on' : 'New package')}</Typography>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField fullWidth label={tx('Name')} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value.slice(0, 100) })} autoFocus />
              <TextField label={tx('Price')} value={editing.price} sx={{ minWidth: 140 }} onChange={(e) => setEditing({ ...editing, price: money(e.target.value) })}
                InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} inputProps={{ inputMode: 'decimal' }} />
              {editing.kind === 'addon' && (
                <TextField select label={tx('Charged')} value={editing.unit} sx={{ minWidth: 140 }} onChange={(e) => setEditing({ ...editing, unit: e.target.value })}>
                  <MenuItem value="day">{tx('per day')}</MenuItem>
                  <MenuItem value="event">{tx('per event')}</MenuItem>
                </TextField>
              )}
            </Stack>
            <TextField label={tx('Short description (optional)')} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value.slice(0, 300) })} />
            <FormControlLabel control={<Switch checked={editing.isActive} onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })} />} label={tx('Show to customers')} />
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button onClick={() => setEditing(null)} disabled={saving}>{tx('Close')}</Button>
              <Button variant="contained" onClick={save} disabled={saving}>{tx('Save')}</Button>
            </Stack>
          </Stack>
        </Card>
      )}
    </Stack>
  );
};

/** Owner: day prices, muhurtham dates, packages and add-ons for one hall. */
const PricingDialog = ({ open, mahal, onClose, onSaved }) => {
  const tx = useTx();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [tab, setTab] = useState(0);
  useEffect(() => {
    if (open) setTab(0);
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth fullScreen={fullScreen} scroll="paper">
      <DialogTitle>{tx('Prices and packages')} · {mahal?.mahalName}</DialogTitle>
      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ px: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label={tx('Day prices')} />
        <Tab label={tx('Packages and add-ons')} />
      </Tabs>
      <DialogContent>
        {mahal && (tab === 0 ? <DayPrices mahal={mahal} onSaved={(d) => onSaved({ ...mahal, ...d })} /> : <Packages mahal={mahal} />)}
        {mahal && !(mahal.pricePerDay > 0) && tab === 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>{tx('Set the normal rent per day first (Edit the hall), so weekday prices can be worked out.')}</Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>{tx('Close')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PricingDialog;
