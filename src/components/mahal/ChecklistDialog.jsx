import { useEffect, useState } from 'react';
import {
  Box, Button, Checkbox, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, TextField, Tooltip, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { listChecklistItems, saveChecklistItems } from '../../api/mahalPlus';
import { notify } from '../ui';
import { useTx } from '../../language/site';

/** Owner: the lines of a hall's event-day checklist, in order. Unticked lines are not shown on bookings. */
const ChecklistDialog = ({ open, mahal, onClose }) => {
  const tx = useTx();
  const [items, setItems] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !mahal) return;
    setItems(null);
    listChecklistItems(mahal.id).then((r) => {
      if (r.ok) setItems((r.data || []).map((x) => ({ ...x, key: `i${x.id}` })));
      else {
        notify.error(tx(r.message));
        setItems([]);
      }
    });
  }, [open, mahal, tx]);

  const update = (key, patch) => setItems((list) => list.map((x) => (x.key === key ? { ...x, ...patch } : x)));
  const up = (index) => setItems((list) => {
    if (index === 0) return list;
    const next = [...list];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    return next;
  });

  const save = async () => {
    setSaving(true);
    const res = await saveChecklistItems(mahal.id, items.filter((x) => x.text.trim()).map((x) => ({ id: x.id || 0, text: x.text.trim(), isActive: x.isActive })));
    setSaving(false);
    if (res.ok) {
      notify.success(tx(res.message));
      onClose();
    } else notify.error(tx(res.message));
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="sm" fullWidth scroll="paper">
      <DialogTitle>{tx('Event-day checklist')} · {mahal?.mahalName}</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {tx('Your staff tick these on each booking. Untick a line to stop using it.')}
        </Typography>
        {!items ? <Box sx={{ textAlign: 'center', py: 3 }}><CircularProgress /></Box> : (
          <Stack spacing={1}>
            {items.map((x, i) => (
              <Stack key={x.key} direction="row" spacing={0.5} alignItems="center">
                <Checkbox checked={x.isActive} onChange={(e) => update(x.key, { isActive: e.target.checked })} inputProps={{ 'aria-label': tx('Use this line') }} />
                <TextField fullWidth size="small" value={x.text} onChange={(e) => update(x.key, { text: e.target.value.slice(0, 150) })} />
                <Tooltip title={tx('Move up')}><span><IconButton size="small" disabled={i === 0} onClick={() => up(i)}><ArrowUpwardIcon fontSize="small" /></IconButton></span></Tooltip>
                {!x.id && <IconButton size="small" color="error" onClick={() => setItems((list) => list.filter((y) => y.key !== x.key))} aria-label={tx('Delete')}><DeleteOutlineIcon fontSize="small" /></IconButton>}
              </Stack>
            ))}
            <Button startIcon={<AddIcon />} onClick={() => setItems((list) => [...list, { id: 0, key: `n${Date.now()}`, text: '', isActive: true }])} sx={{ alignSelf: 'flex-start' }}>
              {tx('Add a line')}
            </Button>
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={saving}>{tx('Close')}</Button>
        <Button variant="contained" onClick={save} disabled={saving || !items}>{tx('Save')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChecklistDialog;
