import { useCallback, useEffect, useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert, Box, Button, Card, Container, Dialog, DialogActions, DialogContent, Grid, IconButton, LinearProgress, Skeleton, Stack, TextField, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { addNotebook, listNotebooks, readNotebookPage, saveNotebook } from '../../api/moiPlus';
import { rupees } from '../moitech/shared';
import { EmptyState, notify } from '../ui';
import { useTx } from '../../language/site';

const day = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '');

/** Shrinks a photo to at most 2000 px (JPEG) and returns its base64 (no data: prefix). */
const shrink = (file) => new Promise((resolve, reject) => {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    const scale = Math.min(1, 2000 / Math.max(img.width, img.height));
    const c = document.createElement('canvas');
    c.width = Math.round(img.width * scale);
    c.height = Math.round(img.height * scale);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    URL.revokeObjectURL(url);
    resolve(c.toDataURL('image/jpeg', 0.85).split(',')[1]);
  };
  img.onerror = () => {
    URL.revokeObjectURL(url);
    reject(new Error('bad image'));
  };
  img.src = url;
});

/** Read photos of one old notebook, check the rows, save them as receipts of that past function. */
const NotebookReader = ({ book, onBack }) => {
  const tx = useTx();
  const input = useRef(null);
  const [rows, setRows] = useState([]);
  const [progress, setProgress] = useState(null);
  const [saving, setSaving] = useState(false);

  const pick = async (e) => {
    const files = [...(e.target.files || [])];
    e.target.value = '';
    for (let i = 0; i < files.length; i += 1) {
      setProgress({ n: i + 1, of: files.length });
      let image;
      try {
        image = await shrink(files[i]);
      } catch (err) {
        notify.error(`${files[i].name}: ${tx('Please choose a photo (JPG or PNG).')}`);
        continue;
      }
      const r = await readNotebookPage(book.id, image, 'image/jpeg');
      if (!r.ok) {
        notify.error(`${files[i].name}: ${tx(r.message)}`);
        if (r.data?.code) break;
        continue;
      }
      const page = (r.data?.rows || []).map((x) => ({ ...x, key: `${Date.now()}-${Math.random()}`, page: files[i].name }));
      if (!page.length) notify.info?.(`${files[i].name}: ${tx(r.message)}`);
      setRows((old) => [...old, ...page]);
    }
    setProgress(null);
  };

  const edit = (key, k, v) => setRows((old) => old.map((x) => (x.key === key ? { ...x, [k]: v } : x)));
  const total = rows.reduce((s, r) => s + (Number(r.amount) || 0), 0);

  const save = async () => {
    setSaving(true);
    const r = await saveNotebook(book.id, rows.map(({ villageName, initial, name, amount, oldAmount, phoneNo }) => ({
      villageName, initial, name, amount: Number(amount) || 0, oldAmount: Number(oldAmount) || 0, phoneNo,
    })));
    setSaving(false);
    if (!r.ok) return notify.error(tx(r.message));
    notify.success(tx('{{n}} entries saved.', { n: r.data.saved }));
    onBack();
    return undefined;
  };

  return (
    <>
      <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 1 }}>{tx('Old moi notebooks')}</Button>
      <Typography variant="h5" fontWeight={800}>{book.functionName}</Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>{day(book.functionDate)} · {tx('Photograph each page in good light. AI reads the entries; check them before saving.')}</Typography>
      <Stack direction="row" spacing={1} sx={{ mb: 2 }} alignItems="center" flexWrap="wrap" useFlexGap>
        <Button variant="contained" startIcon={<PhotoCameraOutlinedIcon />} disabled={!!progress} onClick={() => input.current?.click()}>{tx('Add page photos')}</Button>
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={pick} />
        <Box sx={{ flex: 1 }} />
        {rows.length > 0 && <Typography fontWeight={700}>{rows.length} · {rupees(total)}</Typography>}
        <Button variant="contained" color="success" disabled={!rows.length || saving || !!progress} onClick={save}>{tx('Save entries')}</Button>
      </Stack>
      {progress && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2">{tx('Reading page {{n}} of {{of}}…', progress)}</Typography>
          <LinearProgress />
        </Box>
      )}
      {rows.length === 0 ? (
        <Card><EmptyState icon={<AutoStoriesOutlinedIcon />} title={tx('No entries yet')} description={tx('Add photos of the notebook pages. You can add many pages at once.')} /></Card>
      ) : (
        <Card sx={{ p: 1 }}>
          {rows.map((r) => (
            <Grid container spacing={1} key={r.key} alignItems="center" sx={{ py: 0.5 }}>
              <Grid item xs={6} md={3}><TextField size="small" fullWidth label={tx('Place')} value={r.villageName} onChange={(e) => edit(r.key, 'villageName', e.target.value)} /></Grid>
              <Grid item xs={6} md={1}><TextField size="small" fullWidth label={tx('Initial')} value={r.initial} onChange={(e) => edit(r.key, 'initial', e.target.value)} /></Grid>
              <Grid item xs={12} md={3}><TextField size="small" fullWidth label={tx('Name')} value={r.name} onChange={(e) => edit(r.key, 'name', e.target.value)} /></Grid>
              <Grid item xs={5} md={2}><TextField size="small" fullWidth label={tx('Amount')} value={r.amount} onChange={(e) => edit(r.key, 'amount', e.target.value.replace(/[^\d.]/g, ''))} /></Grid>
              <Grid item xs={5} md={2}><TextField size="small" fullWidth label={tx('Old moi')} value={r.oldAmount || ''} onChange={(e) => edit(r.key, 'oldAmount', e.target.value.replace(/[^\d.]/g, ''))} /></Grid>
              <Grid item xs={2} md={1}><IconButton onClick={() => setRows((old) => old.filter((x) => x.key !== r.key))}><DeleteOutlineIcon /></IconButton></Grid>
            </Grid>
          ))}
        </Card>
      )}
    </>
  );
};

/** Old moi notebooks: past functions typed in from paper (by AI), so Moi to return knows the family's history. */
const OldNotebooks = () => {
  const tx = useTx();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', date: '', names: '' });
  const [open, setOpen] = useState(null);

  const load = useCallback(async () => {
    const r = await listNotebooks();
    if (r.ok) {
      setData(r.data);
      setError('');
    } else {
      setError(tx(r.message));
      setData({ items: [], allowed: false });
    }
  }, [tx]);

  useEffect(() => {
    load();
  }, [load]);

  const add = async () => {
    const r = await addNotebook(form);
    if (!r.ok) return notify.error(tx(r.message));
    setAdding(false);
    setForm({ name: '', date: '', names: '' });
    await load();
    setOpen({ ...r.data, count: 0, total: 0 });
    return undefined;
  };

  if (open) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
        <NotebookReader book={open} onBack={() => { setOpen(null); load(); }} />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>{tx('Old moi notebooks')}</Typography>
          <Typography color="text.secondary">{tx('Photograph the moi notebooks of past functions. AI types them in, so Moi to return knows who gave what, even from years ago.')}</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} disabled={!data?.allowed} onClick={() => setAdding(true)} sx={{ flexShrink: 0 }}>{tx('Add a past function')}</Button>
      </Stack>
      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}
      {data && !data.allowed && !error && (
        <Alert severity="info" sx={{ mb: 2 }} action={<Button color="inherit" size="small" component={RouterLink} to="/pricing?product=moitech">{tx('Choose a plan')}</Button>}>
          {tx('Old notebook import comes with the Standard and Premium plans. Choose a plan to use it.')}
        </Alert>
      )}
      {data && data.allowed && !data.aiOn && <Alert severity="warning" sx={{ mb: 2 }}>{tx('The AI helper is not switched on for this site yet.')}</Alert>}
      {!data ? <Skeleton variant="rounded" height={160} /> : data.items.length === 0 ? (
        <Card><EmptyState icon={<AutoStoriesOutlinedIcon />} title={tx('No old notebooks yet')} description={tx('Add a past function, then add photos of its notebook pages.')} /></Card>
      ) : (
        <Grid container spacing={2}>
          {data.items.map((b) => (
            <Grid item xs={12} sm={6} md={4} key={b.id}>
              <Card sx={{ p: 2 }}>
                <Typography fontWeight={800} noWrap>{b.functionName}</Typography>
                <Typography variant="body2" color="text.secondary">{day(b.functionDate)}{b.funPersionNames ? ` · ${b.funPersionNames}` : ''}</Typography>
                <Typography sx={{ mt: 1 }} fontWeight={700}>{tx('{{n}} givers', { n: b.count })} · {rupees(b.total)}</Typography>
                <Button size="small" sx={{ mt: 1 }} startIcon={<PhotoCameraOutlinedIcon />} disabled={!data.allowed} onClick={() => setOpen(b)}>{tx('Add pages')}</Button>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      <Dialog open={adding} onClose={() => setAdding(false)} maxWidth="xs" fullWidth>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>{tx('Add a past function')}</Typography>
          <Stack spacing={1.5}>
            <TextField label={tx('Function name')} placeholder={tx('e.g. Arun wedding 2015')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
            <TextField type="date" label={tx('Function date')} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} InputLabelProps={{ shrink: true }} />
            <TextField label={tx('Family names (optional)')} value={form.names} onChange={(e) => setForm({ ...form, names: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAdding(false)}>{tx('Cancel')}</Button>
          <Button variant="contained" onClick={add}>{tx('Save')}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OldNotebooks;
