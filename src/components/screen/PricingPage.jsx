import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Badge } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  FiCheck,
  FiX,
  FiStar,
  FiShield,
  FiGlobe,
  FiClock,
  FiUsers,
  FiTrendingUp,
  FiHelpCircle
} from 'react-icons/fi';
import {
  FaCrown,
  FaRegGem,
  FaRegSun,
  FaRocket,
  FaRegCreditCard,
  FaLock,
  FaRegCheckCircle
} from 'react-icons/fa';
import { HiSparkles, HiOutlineLightningBolt } from 'react-icons/hi';
import './css/PricingPage.css';
import { REACT_APP_RAZORPAY_KEY_ID, SAVE_PAYMENT_ORDER_API, VERIFY_PAYMENT_API } from '../common/CommonApiURL';
import axios from 'axios';

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
      icon: <FaRegSun />,
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
      icon: <FiStar />,
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
      icon: <FaCrown />,
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
    { icon: <FiShield />, title: 'Bank-Level Security', description: 'Your payments are safe with 256-bit SSL encryption' },
    { icon: <FiGlobe />, title: 'Global Payments', description: 'Accept payments from anywhere in the world' },
    { icon: <FiClock />, title: 'Instant Activation', description: 'Get started immediately after payment' },
    { icon: <FiUsers />, title: '24/7 Support', description: 'Round-the-clock customer support' }
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
      const orderData = orderResponse && orderResponse.data ? orderResponse.data : {};
      console.log('Create order response:', orderData);
      const amountFromResponse = orderData.amount || payload.amount;
      const orderId = orderData.orderId || orderData.id || orderData.order_id;

      if (!orderId) {
        console.error('create-order API did not return an order id. Aborting checkout.');
        setLoading(false);
        alert('Payment initialization failed: server did not return an order id. Please try again or contact support.');
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
          // Verify payment on your backend — log response and send fallbacks for different key names
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
              amount: plan.price,
              CustomerPhone: "9988776655",
              CustomerName: "Antony Prabu"
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
          name: 'Mark Antony', // You can get this from user profile
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
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFreeTrial = () => {
    // Handle free trial activation
    alert('Free trial activated! You now have 7 days of free access.');
    // Redirect to dashboard

  };

  return (
    <div className="pricing-page">
      {/* Hero Section */}
      <section className="pricing-hero">
        <div className="hero-bg-gradient"></div>
        <Container>
          <Row className="justify-content-center text-center">
            <Col lg={8}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="hero-badge">
                  <HiSparkles />
                  <span>Simple Pricing</span>
                </div>
                <h1 className="hero-title">
                  Choose the Perfect Plan for Your{" "}
                  <span className="gradient-text">Business</span>
                </h1>
                <p className="hero-subtitle">
                  Start with a 7-day free trial. No credit card required.
                  Cancel or upgrade anytime.
                </p>

                {/* Billing Toggle */}
                <div className="billing-toggle">
                  <div className="toggle-container">
                    <span className={`toggle-option ${billingCycle === 'monthly' ? 'active' : ''}`}>
                      Monthly
                    </span>
                    <div
                      className="toggle-switch"
                      onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                    >
                      <div className={`toggle-slider ${billingCycle === 'yearly' ? 'yearly' : 'monthly'}`}></div>
                    </div>
                    <span className={`toggle-option ${billingCycle === 'yearly' ? 'active' : ''}`}>
                      Yearly <Badge bg="success" className="ms-2">Save 16%</Badge>
                    </span>
                  </div>
                </div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Pricing Cards */}
      <section className="pricing-section py-6">
        <Container>
          <Row className="g-4 justify-content-center">
            {plans.map((plan, index) => (
              <Col key={index} lg={4} md={6}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  className={`pricing-card ${plan.popular ? 'popular' : ''} ${selectedPlan === plan.id ? 'selected' : ''}`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.popular && (
                    <div className="popular-badge">
                      <HiOutlineLightningBolt />
                      <span>Most Popular</span>
                    </div>
                  )}

                  <div className="pricing-card-header">
                    <div className="plan-icon" style={{ color: plan.color }}>
                      {plan.icon}
                    </div>
                    <h3 className="plan-name">{plan.name}</h3>
                    <p className="plan-description">{plan.description}</p>
                  </div>

                  <div className="pricing-card-body">
                    <div className="price-section">
                      <span className="price-currency">₹</span>
                      <span className="price-amount">{plan.price}</span>
                      <span className="price-period">{plan.period}</span>
                    </div>

                    {billingCycle === 'yearly' && plan.price > 0 && (
                      <div className="yearly-savings">
                        <span>Save ₹{(plan.price * 12) - (plan.price * 10)} yearly</span>
                      </div>
                    )}

                    <ul className="features-list">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className={feature.included ? 'included' : 'excluded'}>
                          {feature.included ? <FiCheck /> : <FiX />}
                          <span>{feature.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pricing-card-footer">
                    {plan.id === 'free' ? (
                      <Button
                        variant="outline-primary"
                        className="plan-button"
                        onClick={handleFreeTrial}
                        disabled={loading}
                      >
                        <FaRocket className="me-2" />
                        {plan.buttonText}
                      </Button>
                    ) : (
                      <Button
                        variant={plan.popular ? "primary" : "outline-primary"}
                        className="plan-button"
                        onClick={() => handlePayment(plan)}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Processing...
                          </>
                        ) : (
                          <>
                            <FaRegCreditCard className="me-2" />
                            {plan.buttonText}
                          </>
                        )}
                      </Button>
                    )}

                    {plan.id !== 'free' && (
                      <p className="payment-info">
                        <FaLock className="me-1" />
                        Secure payment powered by Razorpay
                      </p>
                    )}
                  </div>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Comparison Table */}
      <section className="comparison-section py-6 bg-light-modern">
        <Container>
          <Row className="justify-content-center mb-6">
            <Col lg={8} className="text-center">
              <div className="section-badge">Compare Plans</div>
              <h2 className="section-title">Detailed Feature Comparison</h2>
              <p className="section-subtitle">
                See exactly what each plan offers to make the right choice
              </p>
            </Col>
          </Row>

          <div className="comparison-table">
            <div className="table-header">
              <div className="header-cell feature-cell">Features</div>
              <div className="header-cell plan-cell free">Free</div>
              <div className="header-cell plan-cell standard">Standard</div>
              <div className="header-cell plan-cell premium">Premium</div>
            </div>

            {[
              { feature: 'Transactions Limit', free: '100/mo', standard: 'Unlimited', premium: 'Unlimited' },
              { feature: 'Advanced Analytics', free: '❌', standard: '✅', premium: '✅' },
              { feature: 'Priority Support', free: '❌', standard: '❌', premium: '✅' },
              { feature: 'Custom Integrations', free: '❌', standard: '❌', premium: '✅' },
              { feature: 'API Access', free: '❌', standard: 'Limited', premium: 'Full' },
              { feature: 'Dedicated Manager', free: '❌', standard: '❌', premium: '✅' },
              { feature: 'Security Features', free: 'Basic', standard: 'Advanced', premium: 'Enterprise' },
              { feature: 'Backup & Recovery', free: 'Manual', standard: 'Auto Weekly', premium: 'Auto Daily' },
            ].map((row, index) => (
              <div key={index} className="table-row">
                <div className="row-cell feature-cell">{row.feature}</div>
                <div className="row-cell plan-cell free">{row.free}</div>
                <div className="row-cell plan-cell standard">{row.standard}</div>
                <div className="row-cell plan-cell premium">{row.premium}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section py-6">
        <Container>
          <Row className="justify-content-center mb-6">
            <Col lg={8} className="text-center">
              <div className="section-badge">Why Choose Us</div>
              <h2 className="section-title">Trusted by Thousands of Businesses</h2>
              <p className="section-subtitle">
                Join the community of successful businesses using our platform
              </p>
            </Col>
          </Row>

          <Row className="g-4">
            {benefits.map((benefit, index) => (
              <Col key={index} lg={3} md={6}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="benefit-card"
                >
                  <div className="benefit-icon">
                    {benefit.icon}
                  </div>
                  <h4 className="benefit-title">{benefit.title}</h4>
                  <p className="benefit-description">{benefit.description}</p>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* FAQ Section */}
      <section className="faq-section py-6 bg-light-modern">
        <Container>
          <Row className="justify-content-center mb-6">
            <Col lg={8} className="text-center">
              <div className="section-badge">FAQ</div>
              <h2 className="section-title">Frequently Asked Questions</h2>
              <p className="section-subtitle">
                Get answers to common questions about our pricing and plans
              </p>
            </Col>
          </Row>

          <Row className="justify-content-center">
            <Col lg={8}>
              <div className="faq-accordion">
                {faqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="faq-item"
                  >
                    <div className="faq-question">
                      <FiHelpCircle className="me-3" />
                      <h5>{faq.question}</h5>
                    </div>
                    <div className="faq-answer">
                      <p>{faq.answer}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="pricing-cta py-6">
        <div className="cta-bg-gradient"></div>
        <Container>
          <Row className="justify-content-center">
            <Col lg={8} className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="cta-badge">
                  <FaRegGem />
                  <span>Ready to Start?</span>
                </div>
                <h2 className="cta-title">
                  Start Your 7-Day Free Trial Today
                </h2>
                <p className="cta-text">
                  No credit card required. Get full access to all features.
                  Upgrade anytime during or after trial.
                </p>
                <div className="cta-buttons">
                  <Button variant="primary" size="lg" className="px-5" onClick={handleFreeTrial}>
                    <FaRocket className="me-2" />
                    Start Free Trial
                  </Button>
                  <Button variant="outline-light" size="lg" className="px-5 ms-3">
                    <FiTrendingUp className="me-2" />
                    Schedule a Demo
                  </Button>
                </div>
                <div className="cta-security">
                  <div className="security-item">
                    <FaRegCheckCircle />
                    <span>No setup fees</span>
                  </div>
                  <div className="security-item">
                    <FaRegCheckCircle />
                    <span>Cancel anytime</span>
                  </div>
                  <div className="security-item">
                    <FaRegCheckCircle />
                    <span>30-day money-back guarantee</span>
                  </div>
                </div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default PricingPage;