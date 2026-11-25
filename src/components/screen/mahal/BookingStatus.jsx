import { useTx } from '../../../language/site';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Alert, Box, Button, Card, CircularProgress, Container, Divider, Stack, TextField, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import AppHeader from '../../common/AppHeader';
import PublicFooter from '../../public/PublicFooter';
import { getBookingStatus } from '../../../api/mahal';
import { createPayOrder, loadCheckout, verifyPay } from '../../../api/mahalOps';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { effectiveStatus, fmtRange, rupees } from '../../mahal/shared';

const LOOK = {
  Pending: { icon: <HourglassTopIcon />, color: 'warning.main', title: 'Waiting for the hall', text: 'The hall has your request and will call you to confirm.' },
  Confirmed: { icon: <CheckCircleIcon />, color: 'success.main', title: 'Booking confirmed', text: 'Your dates are reserved. See you at the event!' },
  Completed: { icon: <TaskAltIcon />, color: 'info.main', title: 'Event completed', text: 'Thank you for choosing this hall.' },
  Rejected: { icon: <CancelOutlinedIcon />, color: 'error.main', title: 'Request declined', text: 'The hall could not accept this request.' },
  Cancelled: { icon: <CancelOutlinedIcon />, color: 'text.secondary', title: 'Booking cancelled', text: 'This booking was cancelled.' },
};

const Row = ({ label, value, strong }) => (
  <Stack direction="row" justifyContent="space-between" spacing={2}>
    <Typography color="text.secondary">{label}</Typography>
    <Typography fontWeight={strong ? 700 : 500} textAlign="right">{value}</Typography>
  </Stack>
);

/** Public: a customer checks their booking with the reference and phone number. */
const BookingStatus = () => {
  const tx = useTx();
  const [params] = useSearchParams();
  const [ref, setRef] = useState(params.get('ref') || '');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(null);
  const [paying, setPaying] = useState(false);
  const [paidMsg, setPaidMsg] = useState('');

  useEffect(() => {
    document.title = 'Check my mahal booking';
  }, []);

  const refresh = async () => {
    const res = await getBookingStatus(ref.trim().toUpperCase(), phone.trim());
    if (res.ok) setBooking(res.data);
  };

  // Pay online: an order on the hall's own Razorpay account, Razorpay Checkout, then the server checks the signature.
  const pay = async () => {
    setPaying(true);
    setError('');
    setPaidMsg('');
    const bookingRef = ref.trim().toUpperCase();
    const order = await createPayOrder(bookingRef, phone.trim());
    const Razorpay = order.ok ? await loadCheckout() : null;
    if (!order.ok || !Razorpay) {
      setPaying(false);
      setError(order.ok ? tx('Could not open the payment window. Check your connection and try again.') : order.message);
      return;
    }
    const o = order.data;
    const rzp = new Razorpay({
      key: o.keyId,
      order_id: o.orderId,
      amount: Math.round(o.amount * 100),
      currency: o.currency,
      name: o.hallName,
      description: tx('Booking {{ref}}', { ref: bookingRef }),
      prefill: { name: o.customerName, contact: o.phone, email: o.email || undefined },
      theme: { color: '#7F1D1D' },
      modal: { ondismiss: () => setPaying(false) },
      handler: async (r) => {
        const res = await verifyPay({
          bookingRef,
          phone: phone.trim(),
          razorpayOrderId: r.razorpay_order_id,
          razorpayPaymentId: r.razorpay_payment_id,
          razorpaySignature: r.razorpay_signature,
        });
        setPaying(false);
        if (res.ok) {
          setPaidMsg(res.message);
          refresh();
        } else setError(res.message);
      },
    });
    rzp.on('payment.failed', () => setError(tx('The payment did not go through. No money was taken. Please try again.')));
    rzp.open();
  };

  const submit = async (e) => {
    e.preventDefault();
    setPaidMsg('');
    if (!ref.trim() || !phone.trim()) {
      setError(tx('Enter your booking reference and phone number.'));
      return;
    }
    setLoading(true);
    setError('');
    const res = await getBookingStatus(ref.trim().toUpperCase(), phone.trim());
    setLoading(false);
    if (res.ok) setBooking(res.data);
    else {
      setBooking(null);
      setError(res.message);
    }
  };

  const status = booking ? effectiveStatus(booking) : null;
  const look = status ? LOOK[status] || LOOK.Pending : null;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />
      <Container maxWidth="sm" sx={{ py: { xs: 4, md: 6 }, flex: 1 }}>
        <Button component={RouterLink} to="/mahals" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>{tx("Find a hall")}</Button>
        <Card component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} sx={{ p: { xs: 2.5, md: 4 } }}>
          <Typography variant="h4" component="h1" fontWeight={800}>{tx("Check my booking")}</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>{tx("Use the reference you got when you sent the request.")}</Typography>
          <Stack component="form" onSubmit={submit} spacing={2} noValidate>
            <TextField label={tx("Booking reference")} placeholder="MB7K3Q9P" value={ref} onChange={(e) => setRef(e.target.value.toUpperCase())} inputProps={{ maxLength: 20, style: { letterSpacing: 2, fontWeight: 700 } }} />
            <TextField label={tx("Phone number")} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
            {error && <Alert severity="error">{tx(error)}</Alert>}
            <Button type="submit" variant="contained" size="large" disabled={loading} startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SearchIcon />}>
              {tx(loading ? 'Checking…' : 'Check status')}
            </Button>
          </Stack>

          <AnimatePresence>
            {booking && look && (
              <Box component={motion.div} key={booking.bookingRef + status} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} sx={{ overflow: 'hidden' }}>
                <Divider sx={{ my: 3 }} />
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box component={motion.div} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 14 }} sx={{ color: look.color, display: 'flex', '& svg': { fontSize: 48 } }}>
                    {look.icon}
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>{tx(look.title)}</Typography>
                    <Typography variant="body2" color="text.secondary">{tx(look.text)}</Typography>
                  </Box>
                </Stack>
                {booking.reason && <Alert severity="info" sx={{ mt: 2 }}>{tx("Reason: ")}{booking.reason}</Alert>}
                <Stack spacing={1.25} sx={{ mt: 3 }}>
                  <Row label={tx("Hall")} value={booking.mahalName} strong />
                  <Row label={tx("Dates")} value={fmtRange(booking.fromDate, booking.toDate)} />
                  {booking.eventType && <Row label={tx("Event")} value={booking.eventType} />}
                  {booking.guestCount > 0 && <Row label={tx("Guests")} value={booking.guestCount} />}
                  {booking.totalAmount > 0 && (
                    <>
                      <Divider />
                      <Row label={tx("Hall rent")} value={rupees(booking.totalAmount)} />
                      {booking.discount > 0 && <Row label={tx("Discount")} value={`− ${rupees(booking.discount)}`} />}
                      {booking.paid > 0 && <Row label={tx("Paid")} value={rupees(booking.paid)} />}
                      <Row label={tx("Balance")} value={rupees(booking.balance)} strong />
                    </>
                  )}
                </Stack>
                {paidMsg && <Alert severity="success" sx={{ mt: 3 }}>{tx(paidMsg)}</Alert>}
                {booking.payNow > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Button fullWidth size="large" variant="contained" color="success" disabled={paying} onClick={pay}
                      startIcon={paying ? <CircularProgress size={18} color="inherit" /> : <CreditCardIcon />}>
                      {tx('Pay {{amount}} online', { amount: rupees(booking.payNow) })}
                    </Button>
                    <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center" sx={{ mt: 1, color: 'text.secondary' }}>
                      <LockOutlinedIcon sx={{ fontSize: 16 }} />
                      <Typography variant="caption">{tx(booking.status === 'Pending' ? 'UPI, card or net banking. Paying the advance confirms your booking.' : 'UPI, card or net banking, paid straight to the hall.')}</Typography>
                    </Stack>
                  </Box>
                )}
                {booking.hallPhone && (
                  <Button sx={{ mt: 3 }} fullWidth variant="outlined" startIcon={<PhoneOutlinedIcon />} href={`tel:${booking.hallPhone}`}>
                    {tx("Call the hall")}
                  </Button>
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

export default BookingStatus;
