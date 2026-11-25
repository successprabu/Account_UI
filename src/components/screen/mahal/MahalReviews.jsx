import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Alert, Avatar, Box, Button, Card, Chip, Container, LinearProgress, MenuItem, Skeleton, Stack, TextField, Typography,
} from '@mui/material';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ReplyIcon from '@mui/icons-material/Reply';
import { hideReview, listReviews, replyReview } from '../../../api/mahalPlus';
import { isStaffUser } from '../../../api/mahalOps';
import { listMyMahals } from '../../../api/mahal';
import { Stars } from '../../mahal/Stars';
import { fmtRange } from '../../mahal/shared';
import { EmptyState, notify } from '../../ui';
import { useTx } from '../../../language/site';

const ReviewCard = ({ r, staff, onChanged, index }) => {
  const tx = useTx();
  const [replying, setReplying] = useState(false);
  const [text, setText] = useState(r.reply || '');
  const [busy, setBusy] = useState(false);

  const saveReply = async () => {
    setBusy(true);
    const res = await replyReview(r.id, text);
    setBusy(false);
    if (res.ok) {
      notify.success(tx(res.message));
      setReplying(false);
      onChanged({ ...r, reply: res.data.reply, replyDt: res.data.replyDt });
    } else notify.error(tx(res.message));
  };
  const toggle = async () => {
    setBusy(true);
    const res = await hideReview(r.id, !r.isHidden);
    setBusy(false);
    if (res.ok) {
      notify.success(tx(res.message));
      onChanged({ ...r, isHidden: res.data.isHidden });
    } else notify.error(tx(res.message));
  };

  return (
    <Card sx={{ p: 2, opacity: r.isHidden ? 0.6 : 1 }} component={motion.div} initial={{ opacity: 0, y: 8 }} animate={{ opacity: r.isHidden ? 0.6 : 1, y: 0 }} transition={{ delay: Math.min(index, 10) * 0.04 }}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Avatar sx={{ bgcolor: 'primary.light' }}>{(r.customerName || '?').charAt(0).toUpperCase()}</Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography fontWeight={700} noWrap>{r.customerName}</Typography>
          <Typography variant="caption" color="text.secondary" component="div" noWrap>
            {r.mahalName} · {tx(r.eventType || 'Event')} · {fmtRange(r.fromDate)} · {r.bookingRef}
          </Typography>
        </Box>
        <Stars value={r.rating} />
      </Stack>
      {r.isHidden && <Chip size="small" icon={<VisibilityOffOutlinedIcon />} label={tx('Hidden from your hall page')} sx={{ mt: 1 }} />}
      {r.comment ? <Typography sx={{ mt: 1, whiteSpace: 'pre-line' }}>{r.comment}</Typography> : <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{tx('No comment, stars only.')}</Typography>}
      {r.reply && !replying && (
        <Box sx={{ mt: 1.25, pl: 1.5, borderLeft: 3, borderColor: 'primary.light' }}>
          <Typography variant="caption" fontWeight={700} color="primary">{tx('Your reply')}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>{r.reply}</Typography>
        </Box>
      )}
      {replying && (
        <Stack spacing={1} sx={{ mt: 1.5 }}>
          <TextField multiline minRows={2} value={text} onChange={(e) => setText(e.target.value.slice(0, 500))} label={tx('Your reply (shown on your hall page)')} autoFocus />
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button onClick={() => { setReplying(false); setText(r.reply || ''); }} disabled={busy}>{tx('Close')}</Button>
            <Button variant="contained" onClick={saveReply} disabled={busy}>{tx('Save')}</Button>
          </Stack>
        </Stack>
      )}
      {!staff && !replying && (
        <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
          <Button size="small" startIcon={<ReplyIcon />} onClick={() => setReplying(true)}>{tx(r.reply ? 'Edit reply' : 'Reply')}</Button>
          <Button size="small" color="inherit" startIcon={r.isHidden ? <VisibilityOutlinedIcon /> : <VisibilityOffOutlinedIcon />} onClick={toggle} disabled={busy}>
            {tx(r.isHidden ? 'Show on hall page' : 'Hide')}
          </Button>
        </Stack>
      )}
    </Card>
  );
};

/** Owner: customer reviews of their halls, with replies and hiding. Staff can read them. */
const MahalReviews = () => {
  const tx = useTx();
  const staff = isStaffUser();
  const [mahals, setMahals] = useState([]);
  const [mahalId, setMahalId] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    listMyMahals().then((r) => r.ok && setMahals(r.data || []));
  }, []);
  const load = useCallback(async () => {
    setData(null);
    const res = await listReviews(mahalId);
    if (res.ok) {
      setData(res.data);
      setError('');
    } else {
      setData({ items: [], average: 0, count: 0, stars: [] });
      setError(res.message);
    }
  }, [mahalId]);
  useEffect(() => {
    load();
  }, [load]);

  const changed = (nr) => setData((d) => ({ ...d, items: d.items.map((x) => (x.id === nr.id ? nr : x)) }));

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, md: 4 } }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>{tx('Reviews')}</Typography>
          <Typography color="text.secondary">{tx('What customers say after their event. Reply to thank them, or hide a review from your hall page.')}</Typography>
        </Box>
        {mahals.length > 1 && (
          <TextField select size="small" label={tx('Hall')} value={mahalId} onChange={(e) => setMahalId(e.target.value)} sx={{ minWidth: 200 }}>
            <MenuItem value="">{tx('All halls')}</MenuItem>
            {mahals.map((m) => <MenuItem key={m.id} value={m.id}>{m.mahalName}</MenuItem>)}
          </TextField>
        )}
      </Stack>
      {error && <Alert severity="warning" sx={{ mb: 3 }}>{tx(error)}</Alert>}

      {!data ? (
        <Stack spacing={1.5}>{[0, 1, 2].map((i) => <Skeleton key={i} variant="rounded" height={110} />)}</Stack>
      ) : (
        <>
          {data.count > 0 && (
            <Card sx={{ p: 2.5, mb: 3 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ sm: 'center' }}>
                <Box sx={{ textAlign: 'center', minWidth: 140 }}>
                  <Typography variant="h3" fontWeight={800}>{data.average.toFixed(1)}</Typography>
                  <Stars value={data.average} size={22} />
                  <Typography variant="body2" color="text.secondary">{tx(data.count === 1 ? '1 review' : '{{n}} reviews', { n: data.count })}</Typography>
                </Box>
                <Stack spacing={0.75} sx={{ flex: 1 }}>
                  {data.stars.map((s) => (
                    <Stack key={s.stars} direction="row" spacing={1} alignItems="center">
                      <Typography variant="body2" sx={{ width: 24 }}>{s.stars}★</Typography>
                      <LinearProgress variant="determinate" value={data.count ? (s.count / data.count) * 100 : 0} sx={{ flex: 1, height: 8, borderRadius: 4 }} color="warning" />
                      <Typography variant="body2" color="text.secondary" sx={{ width: 28, textAlign: 'right' }}>{s.count}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </Card>
          )}
          {data.items.length === 0 ? (
            <Card><EmptyState icon={<RateReviewOutlinedIcon />} title={tx('No reviews yet')} description={tx('The thank-you message after each event asks the family for a review. Send it from "Send today" on your dashboard.')} /></Card>
          ) : (
            <Stack spacing={1.5}>
              {data.items.map((r, i) => <ReviewCard key={r.id} r={r} staff={staff} index={i} onChanged={changed} />)}
            </Stack>
          )}
        </>
      )}
    </Container>
  );
};

export default MahalReviews;
