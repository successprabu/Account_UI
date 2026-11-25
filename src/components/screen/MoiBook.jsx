import { useEffect, useMemo, useState } from 'react';
import {
  Alert, Box, Button, Card, Container, Skeleton, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import StyleOutlinedIcon from '@mui/icons-material/StyleOutlined';
import { getMoiBook } from '../../api/moiPlus';
import { rupees } from '../moitech/shared';
import { EmptyState, notify } from '../ui';
import { useTx } from '../../language/site';

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user')) || {};
  } catch (e) {
    return {};
  }
};
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = (n) => (Number(n) ? Number(n).toLocaleString('en-IN') : '');
const day = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '');
const CARD_TEXT = {
  ta: 'தங்கள் அன்பான வருகைக்கும் வாழ்த்துக்கும் மனமார்ந்த நன்றி.',
  en: 'Thank you for your presence, blessings and kind gift.',
};

const printHtml = (title, body, tx) => {
  const w = window.open('', '_blank');
  if (!w) {
    notify.error(tx('Allow pop-ups for this site to open the report.'));
    return;
  }
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>
    @page{size:A4;margin:12mm} *{box-sizing:border-box} body{font-family:"Noto Sans Tamil","Latha",system-ui,sans-serif;color:#111;margin:0}
    h1{font-size:22px;margin:0;text-align:center} .sub{text-align:center;color:#444;margin:2px 0 10px;font-size:13px}
    table{width:100%;border-collapse:collapse;font-size:12.5px} th,td{border:1px solid #888;padding:4px 6px} th{background:#f1f1f1}
    td.n{text-align:right;white-space:nowrap} tr.v td{background:#fafafa;font-weight:700} tr.s td{font-weight:700;border-top:2px solid #444}
    .grand{margin-top:10px;text-align:right;font-size:15px;font-weight:800}
    .cards{display:grid;grid-template-columns:1fr 1fr;gap:6mm} .card{border:1.5px solid #B45309;border-radius:6px;padding:7mm 6mm;height:62mm;
      break-inside:avoid;display:flex;flex-direction:column;justify-content:space-between;text-align:center;background:#FFFBEB}
    .card .to{font-size:16px;font-weight:800} .card .pl{color:#555;font-size:12px} .card .msg{font-size:13px;margin:6px 0}
    .card .amt{font-size:15px;font-weight:700;color:#92400E} .card .from{font-size:12px;color:#333}
  </style></head><body>${body}<script>window.onload=()=>setTimeout(()=>window.print(),400)</script></body></html>`);
  w.document.close();
};

/** Moi book: the classic village-wise notebook to print and keep, and printed thank-you cards. */
const MoiBook = () => {
  const tx = useTx();
  const user = readUser();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [lang, setLang] = useState('ta');
  const [cardText, setCardText] = useState(CARD_TEXT.ta);
  const [showAmount, setShowAmount] = useState('yes');

  useEffect(() => {
    if (!user.functionId) {
      setError(tx('Choose one of your functions first.'));
      setData({ items: [], function: {} });
      return;
    }
    getMoiBook(user.functionId).then((r) => {
      if (r.ok) setData(r.data);
      else {
        setError(tx(r.message));
        setData({ items: [], function: {} });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const villages = useMemo(() => {
    const map = new Map();
    (data?.items || []).forEach((e) => {
      const k = e.villageName || '-';
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(e);
    });
    return [...map.entries()].map(([village, rows]) => ({
      village,
      rows,
      old: rows.reduce((s, r) => s + (Number(r.oldAmount) || 0), 0),
      total: rows.reduce((s, r) => s + (Number(r.amount) || 0), 0),
    }));
  }, [data]);
  const grand = villages.reduce((s, v) => s + v.total, 0);
  const fn = data?.function || {};

  const printBook = () => {
    let i = 0;
    const rows = villages.map((v) => `<tr class="v"><td colspan="5">${esc(v.village)} (${v.rows.length})</td></tr>${v.rows.map((r) => {
      i += 1;
      return `<tr><td class="n">${i}</td><td>${esc([r.initial, r.name].filter(Boolean).join('. '))}</td><td>${esc(r.phoneNo || '')}</td><td class="n">${num(r.oldAmount)}</td><td class="n">${num(r.amount)}</td></tr>`;
    }).join('')}<tr class="s"><td colspan="3">${esc(v.village)} · ${esc(tx('Total'))}</td><td class="n">${num(v.old)}</td><td class="n">${num(v.total)}</td></tr>`).join('');
    printHtml(`${fn.functionName} - Moi`, `<h1>${esc(fn.functionName)}</h1><div class="sub">${esc([fn.funPersionNames, day(fn.functionDate), fn.mahalName].filter(Boolean).join(' · '))}</div>
      <table><thead><tr><th>#</th><th>${esc(tx('Name'))}</th><th>${esc(tx('Mobile'))}</th><th>${esc(tx('Old moi'))}</th><th>${esc(tx('New moi'))}</th></tr></thead><tbody>${rows}</tbody></table>
      <div class="grand">${esc(tx('Grand total'))}: ₹${num(grand)} · ${(data?.items || []).length} ${esc(tx('givers'))}</div>`, tx);
  };

  const printCards = () => {
    const cards = (data?.items || []).map((r) => `<div class="card"><div><div class="to">${esc([r.initial, r.name].filter(Boolean).join('. '))}</div><div class="pl">${esc(r.villageName)}</div></div>
      <div class="msg">${esc(cardText)}</div>${showAmount === 'yes' ? `<div class="amt">₹${num(r.amount)}</div>` : ''}
      <div class="from">${esc(fn.funPersionNames || '')}<br>${esc(fn.functionName)} · ${esc(day(fn.functionDate))}</div></div>`).join('');
    printHtml(`${fn.functionName} - Thank you cards`, `<div class="cards">${cards}</div>`, tx);
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <Typography variant="h4" fontWeight={800}>{tx('Moi book')}</Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>{tx('Print the moi list village by village, like the family notebook, and thank-you cards for every giver.')}</Typography>
      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <Card sx={{ p: 2, flex: 1 }}>
          <Typography fontWeight={800} sx={{ mb: 0.5 }}>{tx('Moi book')}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{tx('Village-wise, with old and new moi and totals. Tamil prints correctly.')}</Typography>
          <Button variant="contained" startIcon={<MenuBookOutlinedIcon />} disabled={!data?.items?.length} onClick={printBook}>{tx('Print moi book')}</Button>
        </Card>
        <Card sx={{ p: 2, flex: 1.4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography fontWeight={800}>{tx('Thank-you cards')}</Typography>
            <ToggleButtonGroup size="small" exclusive value={lang} onChange={(e, v) => { if (v) { setLang(v); setCardText(CARD_TEXT[v]); } }}>
              <ToggleButton value="ta">தமிழ்</ToggleButton>
              <ToggleButton value="en">English</ToggleButton>
            </ToggleButtonGroup>
          </Stack>
          <TextField fullWidth size="small" multiline minRows={2} value={cardText} onChange={(e) => setCardText(e.target.value)} sx={{ mb: 1 }} />
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <ToggleButtonGroup size="small" exclusive value={showAmount} onChange={(e, v) => v && setShowAmount(v)}>
              <ToggleButton value="yes">{tx('Show amount')}</ToggleButton>
              <ToggleButton value="no">{tx('Hide amount')}</ToggleButton>
            </ToggleButtonGroup>
            <Box sx={{ flex: 1 }} />
            <Button variant="contained" color="warning" startIcon={<StyleOutlinedIcon />} disabled={!data?.items?.length} onClick={printCards}>{tx('Print cards')}</Button>
          </Stack>
        </Card>
      </Stack>

      {!data ? <Skeleton variant="rounded" height={300} /> : !data.items.length ? (
        <Card><EmptyState icon={<MenuBookOutlinedIcon />} title={tx('Nothing here yet')} description={tx('Receipts of this function appear here.')} /></Card>
      ) : (
        <Card sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{tx('Name')}</TableCell>
                <TableCell>{tx('Mobile')}</TableCell>
                <TableCell align="right">{tx('Old moi')}</TableCell>
                <TableCell align="right">{tx('New moi')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {villages.map((v) => [
                <TableRow key={`v-${v.village}`} sx={{ bgcolor: 'action.hover' }}>
                  <TableCell colSpan={2} sx={{ fontWeight: 800 }}>{v.village} ({v.rows.length})</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>{v.old ? rupees(v.old) : ''}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800 }}>{rupees(v.total)}</TableCell>
                </TableRow>,
                ...v.rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{[r.initial, r.name].filter(Boolean).join('. ')}</TableCell>
                    <TableCell>{r.phoneNo || ''}</TableCell>
                    <TableCell align="right">{num(r.oldAmount)}</TableCell>
                    <TableCell align="right">{num(r.amount)}</TableCell>
                  </TableRow>
                )),
              ])}
              <TableRow>
                <TableCell colSpan={3} sx={{ fontWeight: 800 }}>{tx('Grand total')}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800 }}>{rupees(grand)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      )}
    </Container>
  );
};

export default MoiBook;
