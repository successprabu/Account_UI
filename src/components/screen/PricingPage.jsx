import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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

import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/StarBorder';
import SecurityIcon from '@mui/icons-material/Security';
import PublicIcon from '@mui/icons-material/Public';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupsIcon from '@mui/icons-material/Groups';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BoltIcon from '@mui/icons-material/FlashOn';

import './css/PricingPage.css';
import { REACT_APP_RAZORPAY_KEY_ID, SAVE_PAYMENT_ORDER_API, VERIFY_PAYMENT_API } from '../common/CommonApiURL';

const PricingPage = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('premium');
  const [billingCycle, setBillingCycle] = useState('monthly');

  const plans = [
    {
      id: 'free',
      name: 'Free',
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

  const faqs = [
    {
      question: 'How does the free trial work?',
      answer: 'Start with 7 days free access to all features. No credit card required. Upgrade anytime during or after trial.'
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
    { icon: <SecurityIcon />, title: 'Bank-Level Security', description: 'Your payments are safe with 256-bit SSL encryption' },
    { icon: <PublicIcon />, title: 'Global Payments', description: 'Accept payments from anywhere in the world' },
    { icon: <AccessTimeIcon />, title: 'Instant Activation', description: 'Get started immediately after payment' },
    { icon: <GroupsIcon />, title: '24/7 Support', description: 'Round-the-clock customer support' }
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
    setLoading(true);

    try {
      const payload = {
        amount: plan.price * 100, // Amount in paise
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        plan: plan.id,
        billingCycle: billingCycle,
        customerEmail: "test@gmail.com",
        customerPhone: "9988776655"
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
        description: `${plan.name} Plan - ${billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}`,
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
              BillingCycle: billingCycle,
              amount: amountFromResponse || payload.amount,
              CustomerPhone: "9988776655",
              CustomerName: "Antony Prabu",
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
          name: 'Mark Antony',
          email: 'customer@example.com',
          contact: '9988776655'
        },
        notes: {
          plan: plan.id,
          billing_cycle: billingCycle
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

  const handleFreeTrial = () => {
    alert('Free trial activated! You now have 7 days of free access.');
  };

  return (
    <Box sx={{ py: 6 }}>
      {/* Hero */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" sx={{ mb: 2 }}>
            <AutoAwesomeIcon color="primary" />
            <Typography variant="overline">Simple Pricing</Typography>
          </Stack>
          <Typography variant="h3" component="h1" gutterBottom>
            Choose the Perfect Plan for Your <Box component="span" sx={{ color: 'primary.main' }}>Business</Box>
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Start with a 7-day free trial. No credit card required. Cancel or upgrade anytime.
          </Typography>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
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
          <Grid item xs={12} sm={6} md={4} key={plan.id}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
              <Card
                onClick={() => setSelectedPlan(plan.id)}
                sx={{ borderTop: plan.popular ? '4px solid' : 'none', borderColor: plan.popular ? 'secondary.main' : 'transparent' }}
              >
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                    <Box sx={{ color: plan.color }}>{plan.icon}</Box>
                    <Box>
                      <Typography variant="h6">{plan.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{plan.description}</Typography>
                    </Box>
                  </Stack>

                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 2 }}>
                    <Typography variant="h5">₹{plan.price}</Typography>
                    <Typography variant="body2" color="text.secondary">{plan.period}</Typography>
                  </Box>

                  <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                    {plan.features.map((f, i) => (
                      <Box component="li" key={i} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        {f.included ? <CheckIcon color="primary" sx={{ mr: 1 }} /> : <CloseIcon color="disabled" sx={{ mr: 1 }} />}
                        <Typography variant="body2">{f.text}</Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  {plan.id === 'free' ? (
                    <Button variant="outlined" startIcon={<RocketLaunchIcon />} onClick={() => { setSelectedPlan(plan.id); handleFreeTrial(); }}>
                      {plan.buttonText}
                    </Button>
                  ) : (
                    <Button
                      variant={plan.popular ? 'contained' : 'outlined'}
                      startIcon={<CreditCardIcon />}
                      onClick={() => { setSelectedPlan(plan.id); handlePayment(plan); }}
                      disabled={loading}
                    >
                      {loading && selectedPlan === plan.id ? <CircularProgress size={18} sx={{ mr: 1 }} /> : null}
                      {plan.buttonText}
                    </Button>
                  )}

                  {plan.id !== 'free' && (
                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
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
    </Box>
  );
};

export default PricingPage;
