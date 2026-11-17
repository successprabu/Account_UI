import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import VolunteerActivismOutlinedIcon from '@mui/icons-material/VolunteerActivismOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';

import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/StarBorder';
import SecurityIcon from '@mui/icons-material/Security';
import PublicIcon from '@mui/icons-material/Public';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupsIcon from '@mui/icons-material/Groups';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import LockIcon from '@mui/icons-material/Lock';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

import { REACT_APP_RAZORPAY_KEY_ID, SAVE_PAYMENT_ORDER_API, VERIFY_PAYMENT_API } from '../common/CommonApiURL';
import { SCHOOL_PRICING_URL } from '../public/products';
import { notify } from '../ui';

/** Products with their own price list. School ERP keeps its price list on the School ERP site. */
const PRODUCT_TABS = [
  { id: 'moitech', label: 'Moitech', icon: <VolunteerActivismOutlinedIcon /> },
  { id: 'mahal', label: 'Mahal Management', icon: <ApartmentOutlinedIcon /> },
  { id: 'school', label: 'School ERP', icon: <SchoolOutlinedIcon />, href: SCHOOL_PRICING_URL },
];

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch (e) {
    return null;
  }
};

const inr = (v) => Number(v).toLocaleString('en-IN');

const PricingPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useSearchParams();
  const product = params.get('product') === 'mahal' ? 'mahal' : 'moitech';
  const [selectedPlan, setSelectedPlan] = useState('premium');
  const [billingCycle, setBillingCycle] = useState('monthly');

  const moitechPlans = [
    {
      id: 'free',
      name: 'Free',
      cycle: 'trial',
      price: 0,
      period: billingCycle === 'monthly' ? '7 days free trial' : 'year free',
      color: '#6366F1',
      icon: <WbSunnyIcon />,
      popular: false,
      features: [
        { included: true, text: 'Basic features access' },
        { included: true, text: 'Up to 100 transactions' },
        { included: true, text: 'Standard support' },
        { included: false, text: 'Advanced analytics' },
        { included: false, text: 'Priority support' },
        { included: false, text: 'Custom integrations' }
      ],
      buttonText: 'Start Free Trial',
      description: 'Perfect for getting started'
    },
    {
      id: 'standard',
      name: 'Standard',
      cycle: billingCycle,
      price: billingCycle === 'monthly' ? 99 : 999,
      period: billingCycle === 'monthly' ? '/month' : '/year',
      color: '#10B981',
      icon: <StarIcon />,
      popular: true,
      features: [
        { included: true, text: 'All Free features' },
        { included: true, text: 'Unlimited transactions' },
        { included: true, text: 'Advanced analytics' },
        { included: true, text: 'Email support' },
        { included: false, text: 'Priority support' },
        { included: false, text: 'Custom integrations' }
      ],
      buttonText: 'Choose Standard',
      description: 'Most popular for growing businesses'
    },
    {
      id: 'premium',
      name: 'Premium',
      cycle: billingCycle,
      price: billingCycle === 'monthly' ? 199 : 1999,
      period: billingCycle === 'monthly' ? '/month' : '/year',
      color: '#F59E0B',
      icon: <EmojiEventsIcon />,
      popular: false,
      features: [
        { included: true, text: 'All Standard features' },
        { included: true, text: 'Priority 24/7 support' },
        { included: true, text: 'Custom integrations' },
        { included: true, text: 'Advanced security' },
        { included: true, text: 'Dedicated account manager' },
        { included: true, text: 'API access' }
      ],
      buttonText: 'Choose Premium',
      description: 'For businesses that need the best'
    }
  ];

  const mahalFeatures = [
    'Your hall on the online booking site',
    'Customers check free dates and send requests',
    'Unlimited bookings for marriages, birthdays and more',
    'Booking calendar with no double bookings',
    'Advance, balance and payment records',
    'Dashboard and monthly booking reports',
  ];
  const mahalPlans = [
    {
      id: 'mahal-free',
      name: 'Free trial',
      cycle: 'trial',
      price: 0,
      period: 'for 1 month',
      color: '#6366F1',
      icon: <WbSunnyIcon />,
      popular: false,
      features: [...mahalFeatures.map((text) => ({ included: true, text })), { included: false, text: 'Priority support' }],
      buttonText: 'Start 1 month free',
      description: 'Every feature free for your first month',
    },
    {
      id: 'mahal-monthly',
      name: 'Monthly',
      cycle: 'monthly',
      price: 4999,
      period: '/month',
      color: '#10B981',
      icon: <StarIcon />,
      popular: false,
      features: [...mahalFeatures.map((text) => ({ included: true, text })), { included: true, text: 'Phone and WhatsApp support' }],
      buttonText: 'Choose Monthly',
      description: 'Pay month by month, stop anytime',
    },
    {
      id: 'mahal-yearly',
      name: 'Yearly',
      cycle: 'yearly',
      price: 49999,
      period: '/year',
      color: '#F59E0B',
      icon: <EmojiEventsIcon />,
      popular: true,
      saving: `Save ₹${inr(4999 * 12 - 49999)} a year`,
      features: [...mahalFeatures.map((text) => ({ included: true, text })), { included: true, text: 'Priority support and free setup' }],
      buttonText: 'Choose Yearly',
      description: 'Best value: about 2 months free',
    },
  ];

  const plans = product === 'mahal' ? mahalPlans : moitechPlans;
  const switchProduct = (_, id) => {
    const tab = PRODUCT_TABS.find((p) => p.id === id);
    if (!tab || tab.href) return;
    setParams(id === 'moitech' ? {} : { product: id }, { replace: true });
    setSelectedPlan(id === 'mahal' ? 'mahal-yearly' : 'premium');
  };

  const faqs = [
    {
      question: 'How does the free trial work?',
      answer: product === 'mahal'
        ? 'Register your mahal and use every feature free for one month. No card needed. Choose monthly or yearly when you are ready.'
        : 'Start with 7 days free access to all features. No credit card required. Upgrade anytime during or after trial.'
    },
    {
      question: 'Can I change plans later?',
      answer: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit/debit cards, UPI, Net Banking, and mobile wallets through Razorpay.'
    },
    {
      question: 'Is there a setup fee?',
      answer: 'No setup fees. Only pay the monthly subscription fee for the plan you choose.'
    },
    {
      question: 'Do you offer refunds?',
      answer: 'We offer a 30-day money-back guarantee on annual plans if you\'re not satisfied.'
    }
  ];

  const benefits = [
    { icon: <SecurityIcon />, title: 'Secure payments', description: 'Payments are handled by Razorpay over an encrypted connection' },
    { icon: <PublicIcon />, title: 'UPI, cards and net banking', description: 'Pay the way you prefer, including UPI apps and wallets' },
    { icon: <AccessTimeIcon />, title: 'Instant Activation', description: 'Get started immediately after payment' },
    { icon: <GroupsIcon />, title: 'Help when you need it', description: 'Reach us by phone, email or WhatsApp' }
  ];

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async (plan) => {
    // The subscription is activated for the signed-in account, so payment needs a login.
    const user = readUser();
    if (!user?.primary_phone) {
      notify.info('Please sign in to your account first, then choose your plan.');
      navigate('/login');
      return;
    }
    const cycle = plan.cycle;
    setLoading(true);

    try {
      const payload = {
        amount: plan.price, // In rupees; the API converts to paise for Razorpay
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        plan: plan.id,
        billingCycle: cycle,
        customerEmail: '',
        customerPhone: user.primary_phone
      };

      const orderResponse = await axios.post(SAVE_PAYMENT_ORDER_API, payload);
      console.log('Create order raw response:', orderResponse);
      const orderData = orderResponse && orderResponse.data ? orderResponse.data : {};
      console.log('Create order response data:', orderData);
      const nested = orderData.data || orderData.result || {};
      const amountFromResponse = orderData.amount || nested.amount || payload.amount;
      const orderId = orderData.orderId || orderData.id || orderData.order_id || nested.orderId || nested.id || nested.order_id;

      if (!orderId) {
        console.error('create-order API did not return an order id. Response:', orderResponse);
        setLoading(false);
        alert('Payment initialization failed: server did not return an order id. Check console/network for details.');
        return;
      }

      // Initialize Razorpay
      const options = {
        key: REACT_APP_RAZORPAY_KEY_ID,
        amount: amountFromResponse,
        currency: 'INR',
        name: 'MySuccess.Com',
        description: `${product === 'mahal' ? 'Mahal Management' : 'Moitech'} ${plan.name} - ${cycle === 'monthly' ? 'Monthly' : 'Yearly'}`,
        image: 'logo.png',
        order_id: orderId,
        handler: async function (response) {
          try {
            console.log('Razorpay handler response:', response);

            const razorpayOrderId = response.razorpay_order_id || response.order_id || response.id;
            const razorpayPaymentId = response.razorpay_payment_id || response.payment_id || response.razorpay_paymentid;
            const razorpaySignature = response.razorpay_signature || response.signature || response.razorpay_signature;

            const verificationPayload = {
              RazorpayOrderId: razorpayOrderId,
              RazorpayPaymentId: razorpayPaymentId,
              RazorpaySignature: razorpaySignature,
              Plan: plan.id,
              BillingCycle: cycle,
              amount: plan.price,
              CustomerPhone: user.primary_phone,
              CustomerName: user.name || '',
              createdBy: "System"
            };

            console.log('Verification payload:', verificationPayload);

            const verificationResponse = await axios.post(VERIFY_PAYMENT_API, verificationPayload);
            console.log('Verification response:', verificationResponse);
            const verificationData = verificationResponse.data;

            if (verificationData && verificationData.result) {
              alert('Payment successful! Your plan has been activated.');
            } else {
              console.error('Verification failed response:', verificationData);
              alert('Payment verification failed. Please contact support.');
            }
          } catch (err) {
            console.error('Payment verification error:', err);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user.name || '',
          contact: user.primary_phone
        },
        notes: {
          plan: plan.id,
          billing_cycle: cycle
        },
        theme: {
          color: plan.color
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error('Payment error:', error);
      if (error && error.response) {
        console.error('Server responded with:', error.response.status, error.response.data);
      }
      alert('Payment failed. Please try again. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  // The free trial starts by registering: Moitech for a demo account, Mahal for the hall.
  const handleFreeTrial = () => {
    navigate(product === 'mahal' ? '/mahal-reg' : '/purchase');
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
      {/* Hero */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" sx={{ mb: 2 }}>
            <AutoAwesomeIcon color="primary" />
            <Typography variant="overline">Simple Pricing</Typography>
          </Stack>
          <Typography variant="h1" component="h1" gutterBottom sx={{ fontSize: { xs: 32, md: 44 } }}>
            Choose the Perfect Plan for Your <Box component="span" sx={{ color: 'primary.main' }}>{product === 'mahal' ? 'Mahal' : 'Business'}</Box>
          </Typography>

          <Tabs
            value={product}
            onChange={switchProduct}
            variant="scrollable"
            scrollButtons={false}
            sx={{ mt: 2, mb: 2, '& .MuiTab-root': { minHeight: 56, px: { xs: 1.5, sm: 2 } }, '& .MuiTabs-flexContainer': { justifyContent: { md: 'center' } } }}
            aria-label="Product"
          >
            {PRODUCT_TABS.map((p) =>
              p.href ? (
                <Tab key={p.id} value={p.id} icon={p.icon} iconPosition="start" label={<Stack direction="row" spacing={0.5} alignItems="center"><span>{p.label}</span><OpenInNewIcon sx={{ fontSize: 14 }} /></Stack>} component="a" href={p.href} target="_blank" rel="noopener noreferrer" />
              ) : (
                <Tab key={p.id} value={p.id} icon={p.icon} iconPosition="start" label={p.label} />
              )
            )}
          </Tabs>

          <Typography variant="subtitle1" color="text.secondary">
            {product === 'mahal'
              ? 'Take marriage, birthday and event bookings online. First month free, no card needed.'
              : 'Start with a 7-day free trial. No credit card required. Cancel or upgrade anytime.'}
          </Typography>

          <Box sx={{ mt: 3, display: product === 'mahal' ? 'none' : 'flex', justifyContent: 'center' }}>
            <ToggleButtonGroup
              value={billingCycle}
              exclusive
              onChange={(e, val) => { if (val) setBillingCycle(val); }}
              size="small"
            >
              <ToggleButton value="monthly">Monthly</ToggleButton>
              <ToggleButton value="yearly">Yearly</ToggleButton>
            </ToggleButtonGroup>
            <Chip label="Save 16%" color="secondary" sx={{ ml: 2 }} />
          </Box>
        </motion.div>
      </Box>

      {/* Pricing cards */}
      <Grid container spacing={3} justifyContent="center">
        {plans.map((plan, index) => (
          <Grid item xs={12} sm={6} md={4} key={`${product}-${plan.id}`}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} style={{ height: '100%' }}>
              <Card
                onClick={() => setSelectedPlan(plan.id)}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderWidth: plan.popular ? 2 : 1,
                  borderColor: plan.popular ? 'primary.main' : 'divider',
                  position: 'relative',
                }}
              >
                <CardContent sx={{ flex: 1 }}>
                  {plan.popular && <Chip label={product === 'mahal' ? 'Best value' : 'Most popular'} color="primary" size="small" sx={{ mb: 2 }} />}
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                    <Box sx={{ color: plan.color }}>{plan.icon}</Box>
                    <Box>
                      <Typography variant="h6">{plan.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{plan.description}</Typography>
                    </Box>
                  </Stack>

                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 2 }}>
                    <Typography variant="h2" component="p" sx={{ fontVariantNumeric: 'tabular-nums' }}>₹{inr(plan.price)}</Typography>
                    <Typography variant="body2" color="text.secondary">{plan.period}</Typography>
                  </Box>
                  {plan.saving && <Chip label={plan.saving} color="success" variant="outlined" size="small" sx={{ mb: 2, mt: -1 }} />}

                  <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                    {plan.features.map((f, i) => (
                      <Box component="li" key={i} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        {f.included ? <CheckIcon color="primary" sx={{ mr: 1 }} /> : <CloseIcon color="disabled" sx={{ mr: 1 }} />}
                        <Typography variant="body2">{f.text}</Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
                <CardActions sx={{ flexDirection: 'column', alignItems: 'stretch', gap: 1.5, px: 2.5, pb: 2.5, '& > :not(style) ~ :not(style)': { ml: 0 } }}>
                  {plan.cycle === 'trial' ? (
                    <Button fullWidth size="large" variant="outlined" startIcon={<RocketLaunchIcon />} onClick={() => { setSelectedPlan(plan.id); handleFreeTrial(); }}>
                      {plan.buttonText}
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      size="large"
                      variant={plan.popular ? 'contained' : 'outlined'}
                      startIcon={<CreditCardIcon />}
                      onClick={() => { setSelectedPlan(plan.id); handlePayment(plan); }}
                      disabled={loading}
                    >
                      {loading && selectedPlan === plan.id ? <CircularProgress size={18} sx={{ mr: 1 }} /> : null}
                      {plan.buttonText}
                    </Button>
                  )}

                  {plan.cycle !== 'trial' && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                      <LockIcon fontSize="small" /> Secure payment powered by Razorpay
                    </Typography>
                  )}
                </CardActions>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Benefits */}
      <Box sx={{ mt: 6 }}>
        <Grid container spacing={3}>
          {benefits.map((b, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card variant="outlined" sx={{ p: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ color: 'primary.main' }}>{b.icon}</Box>
                  <Box>
                    <Typography variant="subtitle1">{b.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{b.description}</Typography>
                  </Box>
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* FAQ */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" gutterBottom>Frequently Asked Questions</Typography>
        <Grid container spacing={2}>
          {faqs.map((faq, i) => (
            <Grid item xs={12} md={6} key={i}>
              <Card variant="outlined">
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <HelpOutlineIcon color="action" />
                    <Box>
                      <Typography variant="subtitle1">{faq.question}</Typography>
                      <Typography variant="body2" color="text.secondary">{faq.answer}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default PricingPage;
