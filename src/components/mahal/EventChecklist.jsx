import { useEffect, useState } from 'react';
import { Box, Button, Checkbox, CircularProgress, FormControlLabel, LinearProgress, Stack, TextField, Typography } from '@mui/material';
import ChecklistIcon from '@mui/icons-material/Checklist';
import { getChecklist, saveHandoverNote, tickChecklist } from '../../api/mahalPlus';
import { notify } from '../ui';
import { useTx } from '../../language/site';

const time = (d) => new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

/** Event-day checklist for one booking (cleaning, chairs, power, keys…) and notes on damage or handover. Staff can tick. */
const EventChecklist = ({ bookingId }) => {
  const tx = useTx();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(0);
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    let live = true;
    setData(null);
    getChecklist(bookingId).then((r) => {
      if (!live) return;
      if (r.ok && Array.isArray(r.data?.items)) {
        setData(r.data);
        setNote(r.data.note || '');
        setError('');
      } else if (r.ok) setData({ items: [], doneCount: 0, total: 0, note: '' });
      else setError(r.message);
    });
    return () => {
      live = false;
    };
  }, [bookingId]);

  const tick = async (item) => {
    setBusy(item.id);
    const r = await tickChecklist(bookingId, item.id, !item.done);
    setBusy(0);
    if (r.ok && Array.isArray(r.data?.items)) setData(r.data);
    else if (!r.ok) notify.error(tx(r.message));
  };
  const saveNote = async () => {
    setSavingNote(true);
    const r = await saveHandoverNote(bookingId, note);
    setSavingNote(false);
    if (r.ok) {
      notify.success(tx(r.message));
      setData((d) => ({ ...d, note: r.data.note }));
    } else notify.error(tx(r.message));
  };

  if (error) return <Typography variant="body2" color="text.secondary">{tx(error)}</Typography>;
  if (!data) return <Box sx={{ py: 1 }}><CircularProgress size={20} /></Box>;
  if (!data.items.length) return null;

  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
        <ChecklistIcon fontSize="small" color="primary" />
        <Typography fontWeight={700} sx={{ flex: 1 }}>{tx('Event-day checklist')}</Typography>
        <Typography variant="body2" color={data.doneCount === data.total ? 'success.main' : 'text.secondary'} fontWeight={700}>{data.doneCount}/{data.total}</Typography>
      </Stack>
      <LinearProgress variant="determinate" value={data.total ? (data.doneCount / data.total) * 100 : 0} color={data.doneCount === data.total ? 'success' : 'primary'} sx={{ height: 6, borderRadius: 3, mb: 1 }} />
      <Stack>
        {data.items.map((i) => (
          <Box key={i.id}>
            <FormControlLabel
              control={<Checkbox checked={i.done} disabled={busy === i.id} onChange={() => tick(i)} size="small" />}
              label={<Typography sx={{ textDecoration: i.done ? 'line-through' : 'none', color: i.done ? 'text.secondary' : 'text.primary' }}>{tx(i.text)}</Typography>}
            />
            {i.done && (i.doneBy || i.doneDt) && (
              <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4, mt: -0.75 }}>
                {[i.doneBy, i.doneDt && time(i.doneDt)].filter(Boolean).join(' · ')}
              </Typography>
            )}
          </Box>
        ))}
      </Stack>
      <TextField fullWidth multiline minRows={2} sx={{ mt: 1.5 }} label={tx('Damage or handover notes')} value={note} onChange={(e) => setNote(e.target.value.slice(0, 1000))}
        placeholder={tx('For example: 2 chairs broken, stage light not working')} />
      {note !== (data.note || '') && (
        <Box sx={{ textAlign: 'right', mt: 1 }}>
          <Button size="small" variant="contained" onClick={saveNote} disabled={savingNote}>{tx('Save notes')}</Button>
        </Box>
      )}
    </Box>
  );
};

export default EventChecklist;
