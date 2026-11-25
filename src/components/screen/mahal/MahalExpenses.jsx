import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Alert, Box, Button, Card, Chip, Container, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, MenuItem,
  Skeleton, Stack, TextField, Tooltip, Typography, useMediaQuery,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis } from 'recharts';
import { listMyMahals, toDay } from '../../../api/mahal';
import { deleteExpense, getProfit, isStaffUser, listExpenses, saveExpense } from '../../../api/mahalOps';
import { rupees } from '../../mahal/shared';
import { EmptyState, notify } from '../../ui';
import { useTx } from '../../../language/site';

const PAY_METHODS = ['Cash', 'UPI', 'Bank transfer', 'Card', 'Cheque'];
const CATEGORY_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#0ea5e9', '#8b5cf6', '#14b8a6', '#e11d48', '#64748b', '#a3a3a3'];

const monthStart = (ym) => new Date(`${ym}-01T00:00:00`);
const shiftMonth = (ym, n) => {
  const d = monthStart(ym);
  d.setMonth(d.getMonth() + n);
  return toDay(d).slice(0, 7);
};
const monthLabel = (ym, style = 'long') => monthStart(ym).toLocaleDateString('en-IN', { month: style, year: 'numeric' });

const ExpenseDialog = ({ open, expense, mahals, categories, onClose, onSaved }) => {
  const tx = useTx();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(expense
      ? { ...expense, expenseDate: toDay(expense.expenseDate), amount: String(expense.amount) }
      : { id: 0, mahalId: mahals[0]?.id || '', expenseDate: toDay(new Date()), category: 'Electricity', amount: '', description: '', payMethod: 'Cash' });
  }, [open, expense, mahals]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault();
    if (!(Number(form.amount) > 0)) {
      notify.error(tx('Enter the amount spent.'));
      return;
    }
    setSaving(true);
    const res = await saveExpense({ ...form, amount: Number(form.amount), mahalId: Number(form.mahalId) });
    setSaving(false);
    if (res.ok) {
      notify.success(tx(res.message));
      onSaved();
    } else notify.error(tx(res.message));
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullScreen={fullScreen} maxWidth="xs" fullWidth PaperProps={{ component: 'form', onSubmit: submit, noValidate: true }}>
      <DialogTitle>{tx(expense ? 'Edit expense' : 'Add expense')}</DialogTitle>
      {form && (
        <DialogContent dividers>
          <Stack spacing={2}>
            {mahals.length > 1 && (
              <TextField select label={tx('Hall')} value={form.mahalId} onChange={set('mahalId')}>
                {mahals.map((m) => <MenuItem key={m.id} value={m.id}>{m.mahalName}</MenuItem>)}
              </TextField>
            )}
            <TextField select label={tx('What for')} value={form.category} onChange={set('category')}>
              {categories.map((c) => <MenuItem key={c} value={c}>{tx(c)}</MenuItem>)}
            </TextField>
            <TextField label={tx('Amount (₹)')} value={form.amount} required autoFocus
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value.replace(/[^\d.]/g, '') }))} inputProps={{ inputMode: 'decimal' }} />
            <TextField type="date" label={tx('Date')} value={form.expenseDate} onChange={set('expenseDate')} InputLabelProps={{ shrink: true }} />
            <TextField select label={tx('Paid by')} value={form.payMethod || ''} onChange={set('payMethod')}>
              {PAY_METHODS.map((m) => <MenuItem key={m} value={m}>{tx(m)}</MenuItem>)}
            </TextField>
            <TextField label={tx('Note (optional)')} value={form.description || ''} onChange={set('description')} inputProps={{ maxLength: 300 }} multiline minRows={2} />
          </Stack>
        </DialogContent>
      )}
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={saving}>{tx('Close')}</Button>
        <Button type="submit" variant="contained" disabled={saving}>{tx('Save')}</Button>
      </DialogActions>
    </Dialog>
  );
};

const Figure = ({ label, value, color, icon, index }) => (
  <Card component={motion.div} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}
    sx={{ p: 2.25, height: '100%', borderTop: 3, borderColor: color }}>
    <Stack direction="row" spacing={1} alignItems="center" sx={{ color }}>
      {icon}
      <Typography variant="body2" fontWeight={600} color="text.secondary">{label}</Typography>
    </Stack>
    <Typography variant="h5" fontWeight={800} sx={{ mt: 0.75, fontVariantNumeric: 'tabular-nums' }}>{value}</Typography>
  </Card>
);

/**
 * Hall expenses (electricity, cleaning, wages, repairs…) and, for the owner, profit per month:
 * rent from events that month minus that month's expenses. Staff logins can add expenses but not see profit.
 */
const MahalExpenses = () => {
  const tx = useTx();
  const theme = useTheme();
  const staff = isStaffUser();
  const [month, setMonth] = useState(() => toDay(new Date()).slice(0, 7));
  const [mahalId, setMahalId] = useState('');
  const [mahals, setMahals] = useState([]);
  const [data, setData] = useState(null);
  const [profit, setProfit] = useState(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(undefined); // undefined closed, null new, object edit

  useEffect(() => {
    listMyMahals().then((r) => r.ok && setMahals((r.data || []).filter((m) => m.isActive)));
  }, []);

  const load = useCallback(async () => {
    setData(null);
    setError('');
    const from = `${month}-01`;
    const to = `${shiftMonth(month, 1)}-01`;
    const [ex, pr] = await Promise.all([
      listExpenses({ mahalId: mahalId || undefined, from, to }),
      staff ? Promise.resolve(null) : getProfit(month, mahalId),
    ]);
    if (ex.ok) setData(ex.data);
    else {
      setError(ex.message);
      setData({ items: [], total: 0, byCategory: [], categories: [] });
    }
    if (pr?.ok) setProfit(pr.data);
  }, [month, mahalId, staff]);
  useEffect(() => {
    load();
  }, [load]);

  const remove = async (e) => {
    if (!window.confirm(tx('Delete this expense?'))) return;
    const res = await deleteExpense(e.id);
    if (res.ok) {
      notify.success(tx(res.message));
      load();
    } else notify.error(tx(res.message));
  };

  const trend = useMemo(() => (profit?.trend || []).map((t) => ({
    ...t,
    short: monthLabel(t.month, 'short'),
    [tx('Income')]: t.income,
    [tx('Expenses')]: t.expenses,
  })), [profit, tx]);

  const categories = data?.categories?.length ? data.categories : ['Electricity', 'Cleaning', 'Staff wages', 'Repairs', 'Generator diesel', 'Water', 'Maintenance', 'Decoration', 'Tax', 'Other'];

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>{tx(staff ? 'Expenses' : 'Expenses and profit')}</Typography>
          <Typography color="text.secondary">{tx('Record what the hall spends. Profit = rent from events this month minus expenses.')}</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setEditing(null)} disabled={!mahals.length}>{tx('Add expense')}</Button>
      </Stack>

      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>
        <IconButton onClick={() => setMonth((m) => shiftMonth(m, -1))} aria-label={tx('Previous month')}><ChevronLeftIcon /></IconButton>
        <Typography fontWeight={700} sx={{ minWidth: 150, textAlign: 'center' }}>{monthLabel(month)}</Typography>
        <IconButton onClick={() => setMonth((m) => shiftMonth(m, 1))} aria-label={tx('Next month')}><ChevronRightIcon /></IconButton>
        {mahals.length > 1 && (
          <TextField select size="small" label={tx('Hall')} value={mahalId} onChange={(e) => setMahalId(e.target.value)} sx={{ minWidth: 200, ml: { sm: 2 } }}>
            <MenuItem value="">{tx('All halls')}</MenuItem>
            {mahals.map((m) => <MenuItem key={m.id} value={m.id}>{m.mahalName}</MenuItem>)}
          </TextField>
        )}
      </Stack>

      {error && <Alert severity="warning" sx={{ mb: 3 }}>{tx(error)}</Alert>}

      {!staff && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} md={3}><Figure index={0} label={tx('Events')} value={profit ? profit.events : '—'} color={theme.palette.primary.main} icon={<ReceiptLongOutlinedIcon fontSize="small" />} /></Grid>
          <Grid item xs={6} md={3}><Figure index={1} label={tx('Income')} value={profit ? rupees(profit.income) : '—'} color={theme.palette.success.main} icon={<TrendingUpIcon fontSize="small" />} /></Grid>
          <Grid item xs={6} md={3}><Figure index={2} label={tx('Expenses')} value={data ? rupees(data.total) : '—'} color={theme.palette.warning.main} icon={<TrendingDownIcon fontSize="small" />} /></Grid>
          <Grid item xs={6} md={3}>
            <Figure index={3} label={tx('Profit')} value={profit ? rupees(profit.profit) : '—'}
              color={profit && profit.profit < 0 ? theme.palette.error.main : theme.palette.success.dark} icon={<TrendingUpIcon fontSize="small" />} />
          </Grid>
        </Grid>
      )}

      <Grid container spacing={2.5}>
        {!staff && (
          <Grid item xs={12} md={7}>
            <Card sx={{ p: 2.5, height: '100%' }}>
              <Typography variant="h6" fontWeight={700}>{tx('Income and expenses, last 6 months')}</Typography>
              {!profit ? <Skeleton variant="rounded" height={240} sx={{ mt: 1 }} /> : (
                <Box sx={{ height: 240, mt: 1 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid vertical={false} stroke={theme.palette.divider} />
                      <XAxis dataKey="short" tickLine={false} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
                      <YAxis tickLine={false} axisLine={false} width={64} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} tickFormatter={(v) => rupees(v, { notation: 'compact' })} />
                      <ChartTooltip formatter={(v) => rupees(v)} />
                      <Legend />
                      <Bar dataKey={tx('Income')} fill={theme.palette.success.main} radius={[4, 4, 0, 0]} maxBarSize={22} />
                      <Bar dataKey={tx('Expenses')} fill={theme.palette.warning.main} radius={[4, 4, 0, 0]} maxBarSize={22} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </Card>
          </Grid>
        )}
        <Grid item xs={12} md={staff ? 12 : 5}>
          <Card sx={{ p: 2.5, height: '100%' }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>{tx('Where the money went')}</Typography>
            {!data ? <Skeleton variant="rounded" height={160} /> : data.byCategory?.length ? (
              <Stack spacing={1.25}>
                {data.byCategory.map((c, i) => (
                  <Box key={c.category}>
                    <Stack direction="row" justifyContent="space-between"><Typography variant="body2">{tx(c.category)}</Typography><Typography variant="body2" fontWeight={700}>{rupees(c.amount)}</Typography></Stack>
                    <Box sx={{ height: 6, borderRadius: 3, bgcolor: 'action.hover', overflow: 'hidden', mt: 0.5 }}>
                      <Box component={motion.div} initial={{ width: 0 }} animate={{ width: `${(c.amount / data.total) * 100}%` }} transition={{ duration: 0.7 }}
                        sx={{ height: '100%', bgcolor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                    </Box>
                  </Box>
                ))}
              </Stack>
            ) : <Typography variant="body2" color="text.secondary">{tx('No expenses this month.')}</Typography>}
          </Card>
        </Grid>

        {!staff && profit?.perHall?.length > 1 && (
          <Grid item xs={12}>
            <Card sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>{tx('Profit by hall')}</Typography>
              {profit.perHall.map((h) => (
                <Stack key={h.mahalId} direction="row" spacing={2} justifyContent="space-between" sx={{ py: 1, borderBottom: 1, borderColor: 'divider' }}>
                  <Typography fontWeight={600} sx={{ flex: 1 }} noWrap>{h.mahalName}</Typography>
                  <Typography variant="body2" color="text.secondary">{tx('{{n}} events', { n: h.events })}</Typography>
                  <Typography variant="body2" sx={{ width: 110, textAlign: 'right' }}>{rupees(h.income)}</Typography>
                  <Typography variant="body2" sx={{ width: 110, textAlign: 'right' }}>− {rupees(h.expenses)}</Typography>
                  <Typography fontWeight={800} sx={{ width: 120, textAlign: 'right', color: h.profit < 0 ? 'error.main' : 'success.dark' }}>{rupees(h.profit)}</Typography>
                </Stack>
              ))}
            </Card>
          </Grid>
        )}

        <Grid item xs={12}>
          <Card sx={{ p: { xs: 1.5, md: 2.5 } }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1, px: { xs: 1, md: 0 } }}>{tx('Expenses in {{month}}', { month: monthLabel(month) })}</Typography>
            {!data ? <Stack spacing={1}>{[0, 1, 2].map((i) => <Skeleton key={i} height={52} />)}</Stack> : data.items.length === 0 ? (
              <EmptyState compact icon={<ReceiptLongOutlinedIcon />} title={tx('No expenses yet')} description={tx('Add electricity, cleaning, wages and other costs to see your real profit.')}
                action={<Button variant="outlined" startIcon={<AddIcon />} onClick={() => setEditing(null)} disabled={!mahals.length}>{tx('Add expense')}</Button>} />
            ) : (
              <Stack divider={<Box sx={{ borderBottom: 1, borderColor: 'divider' }} />}>
                {data.items.map((e, i) => (
                  <Stack key={e.id} component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i, 10) * 0.03 }}
                    direction="row" spacing={1.5} alignItems="center" sx={{ py: 1.25, px: { xs: 1, md: 0 } }}>
                    <Chip size="small" label={tx(e.category)} sx={{ bgcolor: alpha(CATEGORY_COLORS[categories.indexOf(e.category) % CATEGORY_COLORS.length] || '#64748b', 0.12), fontWeight: 600, minWidth: 96 }} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" noWrap>{e.description || tx(e.category)}</Typography>
                      <Typography variant="caption" color="text.secondary" noWrap component="div">
                        {new Date(e.expenseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        {mahals.length > 1 ? ` · ${e.mahalName}` : ''}{e.payMethod ? ` · ${tx(e.payMethod)}` : ''}
                      </Typography>
                    </Box>
                    <Typography fontWeight={800} sx={{ fontVariantNumeric: 'tabular-nums' }}>{rupees(e.amount)}</Typography>
                    <Tooltip title={tx('Edit')}><IconButton size="small" onClick={() => setEditing(e)}><EditOutlinedIcon fontSize="small" /></IconButton></Tooltip>
                    {!staff && <Tooltip title={tx('Delete')}><IconButton size="small" color="error" onClick={() => remove(e)}><DeleteOutlineIcon fontSize="small" /></IconButton></Tooltip>}
                  </Stack>
                ))}
              </Stack>
            )}
          </Card>
        </Grid>
      </Grid>

      <ExpenseDialog open={editing !== undefined} expense={editing} mahals={mahals} categories={categories}
        onClose={() => setEditing(undefined)} onSaved={() => { setEditing(undefined); load(); }} />
    </Container>
  );
};

export default MahalExpenses;
