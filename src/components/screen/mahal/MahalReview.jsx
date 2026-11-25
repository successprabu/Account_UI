import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Alert, Box, Button, Card, CircularProgress, Container, Stack, TextField, Typography } from '@mui/material';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AppHeader from '../../common/AppHeader';
import PublicFooter from '../../public/PublicFooter';
import { checkReview, submitReview } from '../../../api/mahalPlus';
import { StarInput } from '../../mahal/Stars';
import { fmtRange } from '../../mahal/shared';
import { useTx } from '../../../language/site';

/** Public: after the event, a customer rates the hall with their booking reference and phone number. */
const MahalReview = () => {
  const tx = useTx();
  const [params] = useSearchParams();
  const [ref, setRef] = useState(params.get('ref') || '');
  const [phone, setPhone] = useState('');
  const [booking, setBooking] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    document.title = 'Review your hall';
  }, []);

  const find = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const res = await checkReview(ref.trim().toUpperCase(), phone.trim());
    setBusy(false);
    if (!res.ok) {
      setError(tx(res.message));
      return;
    }
    setBooking(res.data);
    if (res.data.review) {
      setRating(res.data.review.rating);
      setComment(res.data.review.comment || '');
    }
  };

  const send = async (e) => {
    e.preventDefault();
    if (!rating) {
      setError(tx('Please choose 1 to 5 stars.'));
      return;
    }
    setBusy(true);
    setError('');
    const res = await submitReview({ bookingRef: booking.bookingRef, phone: phone.trim(), rating, comment });
    setBusy(false);
    if (res.ok) setDone(true);
    else setError(tx(res.message));
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <AppHeader />
      <Container maxWidth="sm" sx={{ py: { xs: 4, md: 8 }, flex: 1 }}>
        <Card sx={{ p: { xs: 2.5, md: 4 } }}>
          <AnimatePresence mode="wait">
            {done ? (
              <Box key="done" component={motion.div} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} sx={{ textAlign: 'center', py: 2 }}>
                <CheckCircleIcon color="success" sx={{ fontSize: 64 }} />
                <Typography variant="h5" fontWeight={800} sx={{ mt: 1 }}>{tx('Thank you for your review!')}</Typography>
                <Typography color="text.secondary">{tx('It helps other families choose {{hall}}.', { hall: booking.mahalName })}</Typography>
              </Box>
            ) : !booking ? (
              <Box key="find" component="form" onSubmit={find} noValidate>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                  <RateReviewOutlinedIcon color="primary" />
                  <Typography variant="h5" fontWeight={800}>{tx('Review your hall')}</Typography>
                </Stack>
                <Typography color="text.secondary" sx={{ mb: 3 }}>{tx('Enter your booking reference and the phone number you booked with.')}</Typography>
                <Stack spacing={2}>
                  <TextField label={tx('Booking reference')} value={ref} onChange={(e) => setRef(e.target.value.toUpperCase())} placeholder="MB123456" required />
                  <TextField label={tx('Phone')} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required autoComplete="tel" />
                  {error && <Alert severity="error">{error}</Alert>}
                  <Button type="submit" variant="contained" size="large" disabled={busy || !ref.trim() || !phone.trim()}>
                    {busy ? <CircularProgress size={22} color="inherit" /> : tx('Continue')}
                  </Button>
                </Stack>
              </Box>
            ) : (
              <Box key="rate" component="form" onSubmit={send} noValidate>
                <Typography variant="h5" fontWeight={800}>{booking.mahalName}</Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  {booking.customerName} · {tx(booking.eventType || 'Event')} · {fmtRange(booking.fromDate, booking.toDate)}
                </Typography>
                {!booking.canReview ? (
                  <Alert severity="info">{tx('You can review the hall after your event.')}</Alert>
                ) : (
                  <Stack spacing={2}>
                    <Typography fontWeight={700}>{tx('How was the hall?')}</Typography>
                    <StarInput value={rating} onChange={setRating} />
                    <TextField label={tx('Tell other families about it (optional)')} value={comment} onChange={(e) => setComment(e.target.value.slice(0, 1000))} multiline minRows={3} />
                    {booking.review && <Alert severity="info">{tx('You reviewed this hall before. Saving updates your review.')}</Alert>}
                    {booking.review?.reply && (
                      <Alert severity="success" icon={false}><b>{tx('Reply from the hall')}:</b> {booking.review.reply}</Alert>
                    )}
                    {error && <Alert severity="error">{error}</Alert>}
                    <Button type="submit" variant="contained" size="large" disabled={busy}>
                      {busy ? <CircularProgress size={22} color="inherit" /> : tx('Send review')}
                    </Button>
                  </Stack>
                )}
              </Box>
            )}
          </AnimatePresence>
        </Card>
      </Container>
      <PublicFooter />
    </Box>
  );
};

export default MahalReview;
