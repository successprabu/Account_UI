import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Alert, Avatar, Box, Button, Card, Chip, Container, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, IconButton,
  MenuItem, Skeleton, Stack, Switch, TextField, Tooltip, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import { deleteVendor, listVendors, saveVendor, VENDOR_CATEGORIES } from '../../../api/mahalPlus';
import { listMyMahals } from '../../../api/mahal';
import { EmptyState, notify } from '../../ui';
import { useTx } from '../../../language/site';

const COLORS = { Catering: '#f59e0b', Decoration: '#db2777', Photography: '#6366f1', Music: '#0ea5e9', Flowers: '#10b981', Makeup: '#e11d48', Priest: '#f97316', Transport: '#475569', Lighting: '#eab308', Other: '#64748b' };

const VendorDialog = ({ open, vendor, mahals, onClose, onSaved }) => {
  const tx = useTx();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (open) setForm(vendor ? { ...vendor, phone: vendor.phone || '', note: vendor.note || '' } : { id: 0, mahalId: mahals[0]?.id || '', category: 'Catering', name: '', phone: '', note: '', sortOrder: 0, isActive: true });
  }, [open, vendor, mahals]);
  if (!form) return null;
  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await saveVendor({ ...form, mahalId: Number(form.mahalId) });
    setSaving(false);
    if (res.ok) {
      notify.success(tx(res.message));
      onSaved();
    } else notify.error(tx(res.message));
  };
  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="xs" fullWidth PaperProps={{ component: 'form', onSubmit: submit, noValidate: true }}>
      <DialogTitle>{tx(form.id ? 'Edit vendor' : 'Add vendor')}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {mahals.length > 1 && !form.id && (
            <TextField select label={tx('Hall')} value={form.mahalId} onChange={(e) => setForm({ ...form, mahalId: e.target.value })}>
              {mahals.map((m) => <MenuItem key={m.id} value={m.id}>{m.mahalName}</MenuItem>)}
            </TextField>
          )}
          <TextField select label={tx('Type')} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {VENDOR_CATEGORIES.map((c) => <MenuItem key={c} value={c}>{tx(c)}</MenuItem>)}
          </TextField>
          <TextField label={tx('Name')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value.slice(0, 100) })} required autoFocus />
          <TextField label={tx('Phone')} type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.slice(0, 20) })} />
          <TextField label={tx('Note for customers (optional)')} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value.slice(0, 300) })}
            placeholder={tx('For example: Veg meals from ₹250 a plate')} multiline minRows={2} />
          <FormControlLabel control={<Switch checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />} label={tx('Show to customers')} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={saving}>{tx('Close')}</Button>
        <Button type="submit" variant="contained" disabled={saving}>{tx('Save')}</Button>
      </DialogActions>
    </Dialog>
  );
};

/** Owner: caterers, decorators, photographers… the hall recommends. Customers see them on the hall page. */
const MahalVendors = () => {
  const tx = useTx();
  const [mahals, setMahals] = useState([]);
  const [mahalId, setMahalId] = useState('');
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(undefined);

  useEffect(() => {
    listMyMahals().then((r) => r.ok && setMahals((r.data || []).filter((m) => m.isActive)));
  }, []);
  const load = useCallback(async () => {
    const res = await listVendors(mahalId);
    setItems(res.ok ? res.data?.items || [] : []);
    setError(res.ok ? '' : res.message);
  }, [mahalId]);
  useEffect(() => {
    load();
  }, [load]);

  const groups = useMemo(() => {
    const g = {};
    (items || []).forEach((v) => {
      (g[v.category] ||= []).push(v);
    });
    return Object.entries(g);
  }, [items]);
  const hallName = (id) => mahals.find((m) => m.id === id)?.mahalName;

  const remove = async (v) => {
    if (!window.confirm(tx('Delete "{{name}}"?', { name: v.name }))) return;
    const res = await deleteVendor(v.id);
    if (res.ok) load();
    else notify.error(tx(res.message));
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, md: 4 } }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>{tx('Vendors')}</Typography>
          <Typography color="text.secondary">{tx('Caterers, decorators and photographers you recommend. Families see them on your hall page and can call them directly.')}</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setEditing(null)} disabled={!mahals.length} sx={{ flexShrink: 0 }}>{tx('Add vendor')}</Button>
      </Stack>
      {mahals.length > 1 && (
        <TextField select size="small" label={tx('Hall')} value={mahalId} onChange={(e) => setMahalId(e.target.value)} sx={{ minWidth: 220, mb: 2 }}>
          <MenuItem value="">{tx('All halls')}</MenuItem>
          {mahals.map((m) => <MenuItem key={m.id} value={m.id}>{m.mahalName}</MenuItem>)}
        </TextField>
      )}
      {error && <Alert severity="warning" sx={{ mb: 2 }}>{tx(error)}</Alert>}

      {items === null ? (
        <Stack spacing={1}>{[0, 1, 2].map((i) => <Skeleton key={i} variant="rounded" height={64} />)}</Stack>
      ) : items.length === 0 ? (
        <Card><EmptyState icon={<StorefrontOutlinedIcon />} title={tx('No vendors yet')} description={tx('Add the caterers, decorators and photographers you work with. Families often ask the hall for them.')} /></Card>
      ) : (
        <Stack spacing={2.5}>
          {groups.map(([cat, list]) => (
            <Box key={cat}>
              <Typography variant="overline" fontWeight={800} sx={{ color: COLORS[cat] || COLORS.Other }}>{tx(cat)}</Typography>
              <Card>
                {list.map((v, i) => (
                  <Stack key={v.id} component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: v.isActive ? 1 : 0.55 }} transition={{ delay: i * 0.03 }}
                    direction="row" spacing={1.5} alignItems="center" sx={{ px: 2, py: 1.25, borderBottom: i < list.length - 1 ? 1 : 0, borderColor: 'divider' }}>
                    <Avatar sx={{ bgcolor: COLORS[cat] || COLORS.Other, width: 36, height: 36, fontSize: 15 }}>{v.name.charAt(0).toUpperCase()}</Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography fontWeight={700} noWrap>{v.name}{!v.isActive && <Chip size="small" label={tx('Hidden')} sx={{ ml: 1 }} />}</Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {[v.phone, v.note, mahals.length > 1 ? hallName(v.mahalId) : null].filter(Boolean).join(' · ')}
                      </Typography>
                    </Box>
                    {v.phone && <Tooltip title={tx('Call')}><IconButton href={`tel:${v.phone}`} size="small"><PhoneOutlinedIcon fontSize="small" /></IconButton></Tooltip>}
                    <Tooltip title={tx('Edit')}><IconButton size="small" onClick={() => setEditing(v)}><EditOutlinedIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title={tx('Delete')}><IconButton size="small" color="error" onClick={() => remove(v)}><DeleteOutlineIcon fontSize="small" /></IconButton></Tooltip>
                  </Stack>
                ))}
              </Card>
            </Box>
          ))}
        </Stack>
      )}
      <VendorDialog open={editing !== undefined} vendor={editing} mahals={mahals} onClose={() => setEditing(undefined)} onSaved={() => { setEditing(undefined); load(); }} />
    </Container>
  );
};

export default MahalVendors;
