import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Alert, Box, Button, Card, Chip, Container, Grid, IconButton, MenuItem, Skeleton, Stack, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Tooltip, Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis } from 'recharts';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { getMahalReport } from '../../../api/mahalPlus';
import { listMyMahals } from '../../../api/mahal';
import { exportExcel } from '../../moitech/reportExport';
import { rupees } from '../../mahal/shared';
import { waLink } from '../../mahal/hallMessages';
import { notify } from '../../ui';
import { useTx } from '../../../language/site';

const short = (ym) => new Date(`${ym}-01T00:00:00`).toLocaleDateString('en-IN', { month: 'short' });
const day = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const Tile = ({ label, value, color, index }) => (
  <Card component={motion.div} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} sx={{ p: 2, height: '100%', borderTop: 3, borderColor: color }}>
    <Typography variant="body2" color="text.secondary">{label}</Typography>
    <Typography variant="h5" fontWeight={800} sx={{ mt: 0.5, fontVariantNumeric: 'tabular-nums' }}>{value}</Typography>
  </Card>
);

/** Owner: a year at a glance — occupancy, income and expenses per month, event types and balances due; Excel and PDF. */
const MahalReports = () => {
  const tx = useTx();
  const theme = useTheme();
  const [year, setYear] = useState(new Date().getFullYear());
  const [mahals, setMahals] = useState([]);
  const [mahalId, setMahalId] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    listMyMahals().then((r) => r.ok && setMahals(r.data || []));
  }, []);
  const load = useCallback(async () => {
    setData(null);
    const res = await getMahalReport(year, mahalId);
    if (res.ok) {
      setData(res.data);
      setError('');
    } else setError(res.message);
  }, [year, mahalId]);
  useEffect(() => {
    load();
  }, [load]);

  const chart = useMemo(() => (data?.months || []).map((m) => ({
    name: short(m.month),
    [tx('Income')]: m.income,
    [tx('Expenses')]: m.expenses,
    [tx('Occupancy %')]: m.occupancy,
  })), [data, tx]);

  const hallLabel = mahalId ? mahals.find((m) => m.id === Number(mahalId))?.mahalName : tx('All halls');
  const title = `${tx('Hall report')} ${year} · ${hallLabel || ''}`;

  const monthCols = [
    { key: 'month', label: tx('Month'), value: (m) => new Date(`${m.month}-01T00:00:00`).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) },
    { key: 'events', label: tx('Events') },
    { key: 'bookedDays', label: tx('Booked days') },
    { key: 'occupancy', label: tx('Occupancy %') },
    { key: 'income', label: tx('Income') },
    { key: 'expenses', label: tx('Expenses') },
    { key: 'profit', label: tx('Profit') },
  ];

  const excel = () => {
    exportExcel({
      fileName: `hall-report-${year}.xlsx`,
      sheetName: tx('Months'),
      columns: monthCols,
      rows: data.months,
      totals: { label: tx('Total'), values: { events: data.totals.events, bookedDays: data.totals.bookedDays, occupancy: data.totals.occupancy, income: data.totals.income, expenses: data.totals.expenses, profit: data.totals.profit } },
      extraSheets: [
        { name: tx('Event types'), columns: [{ key: 'eventType', label: tx('Event'), value: (e) => tx(e.eventType) }, { key: 'count', label: tx('Events') }, { key: 'income', label: tx('Income') }], rows: data.eventTypes },
        {
          name: tx('Balances due'),
          columns: [
            { key: 'fromDate', label: tx('Date'), value: (d) => day(d.fromDate) }, { key: 'customerName', label: tx('Customer') }, { key: 'phone', label: tx('Phone') },
            { key: 'mahalName', label: tx('Hall') }, { key: 'bookingRef', label: tx('Booking') }, { key: 'balance', label: tx('Balance') },
          ],
          rows: data.dues,
        },
      ],
    });
  };

  // Printable A4 page; the browser's "Save as PDF" keeps Tamil and other scripts correct.
  const pdf = () => {
    const t = data.totals;
    const row = (cells, bold) => `<tr>${cells.map((c, i) => `<td style="text-align:${i ? 'right' : 'left'}${bold ? ';font-weight:700' : ''}">${esc(c)}</td>`).join('')}</tr>`;
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>
      @page { size: A4; margin: 14mm; } body { font-family: Inter, "Noto Sans Tamil", system-ui, sans-serif; color:#0f172a; font-size:12px }
      h1 { font-size:20px; margin:0 } h2 { font-size:15px; margin:22px 0 6px } .muted{color:#64748b}
      table { width:100%; border-collapse:collapse } td, th { padding:6px; border-bottom:1px solid #e2e8f0 } th { text-align:right; background:#f8fafc; font-size:11px; color:#475569 } th:first-child{text-align:left}
      .tiles{display:flex;gap:10px;margin-top:12px} .tile{flex:1;border:1px solid #e2e8f0;border-radius:8px;padding:8px} .tile b{display:block;font-size:16px}
    </style></head><body>
      <h1>${esc(title)}</h1><div class="muted">${esc(tx('Made on {{date}}', { date: day(new Date()) }))}</div>
      <div class="tiles">${[[tx('Events'), t.events], [tx('Occupancy'), `${t.occupancy}%`], [tx('Income'), rupees(t.income)], [tx('Expenses'), rupees(t.expenses)], [tx('Profit'), rupees(t.profit)], [tx('Balances due'), rupees(t.dues)]]
        .map(([l, v]) => `<div class="tile">${esc(l)}<b>${esc(v)}</b></div>`).join('')}</div>
      <h2>${esc(tx('Month by month'))}</h2>
      <table><tr>${monthCols.map((c) => `<th>${esc(c.label)}</th>`).join('')}</tr>
      ${data.months.map((m) => row([monthCols[0].value(m), m.events, m.bookedDays, `${m.occupancy}%`, rupees(m.income), rupees(m.expenses), rupees(m.profit)])).join('')}
      ${row([tx('Total'), t.events, t.bookedDays, `${t.occupancy}%`, rupees(t.income), rupees(t.expenses), rupees(t.profit)], true)}</table>
      <h2>${esc(tx('Event types'))}</h2>
      <table><tr><th>${esc(tx('Event'))}</th><th>${esc(tx('Events'))}</th><th>${esc(tx('Income'))}</th></tr>
      ${data.eventTypes.map((e) => row([tx(e.eventType), e.count, rupees(e.income)])).join('')}</table>
      <h2>${esc(tx('Balances due'))}</h2>
      <table><tr><th>${esc(tx('Date'))}</th><th>${esc(tx('Customer'))}</th><th>${esc(tx('Hall'))}</th><th>${esc(tx('Balance'))}</th></tr>
      ${data.dues.map((d) => row([day(d.fromDate), `${d.customerName} (${d.phone})`, d.mahalName || '', rupees(d.balance)])).join('')}</table>
      <p class="muted" style="margin-top:24px">My Success · mysuccess.azurewebsites.net</p>
      <script>window.onload = () => setTimeout(() => window.print(), 300);</script></body></html>`;
    const w = window.open('', '_blank');
    if (!w) {
      notify.error(tx('Allow pop-ups for this site to open the report.'));
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  const remind = (d) => {
    const text = `Hello ${d.customerName}, a reminder from ${d.mahalName}: the balance of ${rupees(d.balance)} for your booking ${d.bookingRef || ''} on ${day(d.fromDate)} is due. Thank you.`;
    window.open(waLink(d.phone, text), '_blank', 'noopener,noreferrer');
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>{tx('Reports')}</Typography>
          <Typography color="text.secondary">{tx('How full the hall was, what it earned and spent, which events come most, and who still owes money.')}</Typography>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button variant="outlined" startIcon={<FileDownloadOutlinedIcon />} onClick={excel} disabled={!data}>Excel</Button>
          <Button variant="outlined" startIcon={<PictureAsPdfOutlinedIcon />} onClick={pdf} disabled={!data}>PDF</Button>
        </Stack>
      </Stack>

      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>
        <IconButton onClick={() => setYear((y) => y - 1)} aria-label={tx('Previous year')}><ChevronLeftIcon /></IconButton>
        <Typography variant="h6" fontWeight={800} sx={{ minWidth: 64, textAlign: 'center' }}>{year}</Typography>
        <IconButton onClick={() => setYear((y) => y + 1)} aria-label={tx('Next year')}><ChevronRightIcon /></IconButton>
        {mahals.length > 1 && (
          <TextField select size="small" label={tx('Hall')} value={mahalId} onChange={(e) => setMahalId(e.target.value)} sx={{ minWidth: 200, ml: { sm: 2 } }}>
            <MenuItem value="">{tx('All halls')}</MenuItem>
            {mahals.map((m) => <MenuItem key={m.id} value={m.id}>{m.mahalName}</MenuItem>)}
          </TextField>
        )}
      </Stack>

      {error && <Alert severity="warning" sx={{ mb: 3 }}>{tx(error)}</Alert>}
      {!data ? (
        !error && <Grid container spacing={2}>{[0, 1, 2, 3].map((i) => <Grid item xs={6} md={3} key={i}><Skeleton variant="rounded" height={90} /></Grid>)}</Grid>
      ) : (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} md={2}><Tile index={0} label={tx('Events')} value={data.totals.events} color={theme.palette.primary.main} /></Grid>
            <Grid item xs={6} md={2}><Tile index={1} label={tx('Occupancy')} value={`${data.totals.occupancy}%`} color="#0ea5e9" /></Grid>
            <Grid item xs={6} md={2}><Tile index={2} label={tx('Income')} value={rupees(data.totals.income)} color={theme.palette.success.main} /></Grid>
            <Grid item xs={6} md={2}><Tile index={3} label={tx('Expenses')} value={rupees(data.totals.expenses)} color={theme.palette.warning.main} /></Grid>
            <Grid item xs={6} md={2}><Tile index={4} label={tx('Profit')} value={rupees(data.totals.profit)} color={data.totals.profit < 0 ? theme.palette.error.main : theme.palette.success.dark} /></Grid>
            <Grid item xs={6} md={2}><Tile index={5} label={tx('Balances due')} value={rupees(data.totals.dues)} color={theme.palette.error.main} /></Grid>
          </Grid>

          <Grid container spacing={2.5}>
            <Grid item xs={12} md={7}>
              <Card sx={{ p: 2.5, height: '100%' }}>
                <Typography variant="h6" fontWeight={700}>{tx('Income and expenses')}</Typography>
                <Box sx={{ height: 260, mt: 1 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid vertical={false} stroke={theme.palette.divider} />
                      <XAxis dataKey="name" tickLine={false} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
                      <YAxis tickLine={false} axisLine={false} width={64} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} tickFormatter={(v) => rupees(v, { notation: 'compact' })} />
                      <ChartTooltip formatter={(v) => rupees(v)} />
                      <Legend />
                      <Bar dataKey={tx('Income')} fill={theme.palette.success.main} radius={[4, 4, 0, 0]} maxBarSize={18} />
                      <Bar dataKey={tx('Expenses')} fill={theme.palette.warning.main} radius={[4, 4, 0, 0]} maxBarSize={18} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Card>
            </Grid>
            <Grid item xs={12} md={5}>
              <Card sx={{ p: 2.5, height: '100%' }}>
                <Typography variant="h6" fontWeight={700}>{tx('Occupancy per month')}</Typography>
                <Box sx={{ height: 260, mt: 1 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chart} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                      <CartesianGrid vertical={false} stroke={theme.palette.divider} />
                      <XAxis dataKey="name" tickLine={false} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
                      <YAxis tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
                      <ChartTooltip formatter={(v) => `${v}%`} />
                      <Bar dataKey={tx('Occupancy %')} fill="#0ea5e9" radius={[4, 4, 0, 0]} maxBarSize={22} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} md={7}>
              <Card sx={{ p: { xs: 1, md: 2 } }}>
                <Typography variant="h6" fontWeight={700} sx={{ px: 1, pt: 1 }}>{tx('Month by month')}</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>{monthCols.map((c, i) => <TableCell key={c.key} align={i ? 'right' : 'left'}>{c.label}</TableCell>)}</TableRow>
                    </TableHead>
                    <TableBody>
                      {data.months.map((m) => (
                        <TableRow key={m.month} hover>
                          <TableCell>{short(m.month)}</TableCell>
                          <TableCell align="right">{m.events}</TableCell>
                          <TableCell align="right">{m.bookedDays}</TableCell>
                          <TableCell align="right">{m.occupancy}%</TableCell>
                          <TableCell align="right">{rupees(m.income)}</TableCell>
                          <TableCell align="right">{rupees(m.expenses)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, color: m.profit < 0 ? 'error.main' : 'inherit' }}>{rupees(m.profit)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow sx={{ '& td': { fontWeight: 800, bgcolor: 'action.hover' } }}>
                        <TableCell>{tx('Total')}</TableCell>
                        <TableCell align="right">{data.totals.events}</TableCell>
                        <TableCell align="right">{data.totals.bookedDays}</TableCell>
                        <TableCell align="right">{data.totals.occupancy}%</TableCell>
                        <TableCell align="right">{rupees(data.totals.income)}</TableCell>
                        <TableCell align="right">{rupees(data.totals.expenses)}</TableCell>
                        <TableCell align="right">{rupees(data.totals.profit)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            </Grid>
            <Grid item xs={12} md={5}>
              <Card sx={{ p: 2.5, height: '100%' }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>{tx('Top event types')}</Typography>
                {data.eventTypes.length === 0 ? <Typography color="text.secondary">{tx('No events this year.')}</Typography> : (
                  <Stack spacing={1.25}>
                    {data.eventTypes.map((e) => (
                      <Box key={e.eventType}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography>{tx(e.eventType)} <Typography component="span" color="text.secondary" variant="body2">· {e.count}</Typography></Typography>
                          <Typography fontWeight={700}>{rupees(e.income)}</Typography>
                        </Stack>
                        <Box sx={{ height: 6, borderRadius: 3, bgcolor: 'action.hover', overflow: 'hidden', mt: 0.5 }}>
                          <Box component={motion.div} initial={{ width: 0 }} animate={{ width: `${(e.count / data.eventTypes[0].count) * 100}%` }} sx={{ height: '100%', bgcolor: 'primary.main' }} />
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card sx={{ p: { xs: 1, md: 2 } }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 1, pt: 1 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ flex: 1 }}>{tx('Balances due')}</Typography>
                  <Typography fontWeight={800} color="error.main">{rupees(data.totals.dues)}</Typography>
                </Stack>
                {data.dues.length === 0 ? <Typography color="text.secondary" sx={{ p: 1 }}>{tx('Nobody owes money. Well done!')}</Typography> : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>{tx('Date')}</TableCell><TableCell>{tx('Customer')}</TableCell><TableCell>{tx('Hall')}</TableCell>
                          <TableCell align="right">{tx('Balance')}</TableCell><TableCell />
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {data.dues.map((d) => (
                          <TableRow key={d.id} hover>
                            <TableCell>{day(d.fromDate)}{d.overdue && <Chip size="small" color="error" variant="outlined" label={tx('Overdue')} sx={{ ml: 1 }} />}</TableCell>
                            <TableCell>{d.customerName}<Typography variant="caption" color="text.secondary" display="block">{d.phone} · {d.bookingRef}</Typography></TableCell>
                            <TableCell>{d.mahalName}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>{rupees(d.balance)}</TableCell>
                            <TableCell align="right"><Tooltip title={tx('Remind on WhatsApp')}><IconButton size="small" color="success" onClick={() => remind(d)}><WhatsAppIcon fontSize="small" /></IconButton></Tooltip></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  );
};

export default MahalReports;
