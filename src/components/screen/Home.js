import React, { useEffect } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import AppHeader from "../common/AppHeader";
import "./css/HomePage.css";
import { 
  FiArrowRight, 
  FiCheckCircle, 
  FiStar,
  FiTrendingUp,
  FiShield,
  FiGlobe,
  FiZap
} from "react-icons/fi";
import { 
  FaLightbulb, 
  FaHandsHelping, 
  FaHeadset,
  FaQuoteLeft,
  FaRegCheckCircle,
  FaRocket,
  FaChartLine
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

// Import modern icons
import { 
  HiSparkles, 
  HiUserGroup, 
  HiTemplate,
  HiArrowRight,
  HiPlay
} from "react-icons/hi";

const Home = () => {
  const { t } = useTranslation();

  const features = [
    {
      title: "AI-Powered Solutions",
      description: "Leverage cutting-edge AI technology to drive your business forward with our intelligent suite of services.",
      icon: <HiSparkles className="feature-icon" />,
      gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
      stats: "40% faster"
    },
    {
      title: "Tailored Experiences",
      description: "Personalized solutions that adapt to your unique business requirements and scale with your growth.",
      icon: <HiTemplate className="feature-icon" />,
      gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      stats: "100% customizable"
    },
    {
      title: "Dedicated Partnership",
      description: "Our expert team provides ongoing support and strategic guidance every step of the way.",
      icon: <HiUserGroup className="feature-icon" />,
      gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      stats: "24/7 support"
    }
  ];

// Using DiceBear for consistent, always-available avatars
const testimonials = [
  {
    quote: "This platform transformed our operations completely. The AI integration alone boosted our efficiency by 60%.",
    author: "Sarah Johnson",
    role: "CEO at TechCorp",
    rating: 5,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
  },
  {
    quote: "The best decision we made this year. Their solutions scale perfectly with our growing business needs.",
    author: "Michael Chen",
    role: "Director at FinServe",
    rating: 5,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael"
  },
  {
    quote: "Reliable, intuitive, and packed with innovative features. The ROI was immediate and substantial.",
    author: "Emma Williams",
    role: "Manager at RetailPlus",
    rating: 5,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma"
  }
];

  const benefits = [
    { text: "24/7 Priority Support", icon: <FaHeadset />, color: "#3b82f6" },
    { text: "99.9% Uptime SLA", icon: <FiTrendingUp />, color: "#10b981" },
    { text: "Enterprise Security", icon: <FiShield />, color: "#ef4444" },
    { text: "Global Infrastructure", icon: <FiGlobe />, color: "#8b5cf6" },
    { text: "AI-Powered Analytics", icon: <FiZap />, color: "#f59e0b" },
    { text: "Custom Integration", icon: <FaRocket />, color: "#ec4899" }
  ];

  const stats = [
    { value: "10K+", label: "Active Users", icon: <HiUserGroup /> },
    { value: "99.9%", label: "Satisfaction Rate", icon: <FiStar /> },
    { value: "50+", label: "Countries", icon: <FiGlobe /> },
    { value: "24/7", label: "Support", icon: <FaHeadset /> }
  ];

  useEffect(() => {
    // Add intersection observer for scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.animate-on-scroll').forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="home-page">
      <AppHeader />
      
      {/* Hero Section - Modern Design */}
      <section className="hero-section">
        <div className="hero-bg-gradient"></div>
        <Container>
          <Row className="align-items-center min-vh-90 py-6">
            <Col lg={6} className="hero-content">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="badge">
                  <span className="badge-text">🚀 Next-Gen Platform</span>
                </div>
                <h1 className="hero-title">
                  Transform Your Business with{" "}
                  <span className="gradient-text">{t("companyName")}</span>
                </h1>
                <p className="hero-subtitle">
                  Experience the future of business solutions with our AI-driven platform that delivers 
                  unprecedented efficiency and growth.
                </p>
                <div className="hero-cta">
                  <Link to="/services">
                    <Button variant="primary" className="cta-button me-3">
                      <span>Start Free Trial</span>
                      <HiArrowRight />
                    </Button>
                  </Link>
                  <Link to="/demo">
                    <Button variant="outline-light" className="cta-button demo-btn">
                      <HiPlay />
                      <span>Watch Demo</span>
                    </Button>
                  </Link>
                </div>
                <div className="trust-badges">
                  <div className="trust-item">
                    <FiCheckCircle />
                    <span>No credit card required</span>
                  </div>
                  <div className="trust-item">
                    <FiCheckCircle />
                    <span>Free 30-day trial</span>
                  </div>
                  <div className="trust-item">
                    <FiCheckCircle />
                    <span>24/7 support</span>
                  </div>
                </div>
              </motion.div>
            </Col>
            <Col lg={6} className="hero-visual">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="hero-dashboard"
              >
                <div className="dashboard-grid">
                  <div className="dashboard-card card-1">
                    <FaChartLine />
                    <span>Revenue +45%</span>
                  </div>
                  <div className="dashboard-card card-2">
                    <FiTrendingUp />
                    <span>Growth +60%</span>
                  </div>
                  <div className="dashboard-card card-3">
                    <FiStar />
                    <span>Rating 4.9/5</span>
                  </div>
                  <div className="dashboard-main">
                    <div className="chart-line"></div>
                    <div className="chart-bar"></div>
                    <div className="chart-dots"></div>
                  </div>
                </div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="stats-section py-5">
        <Container>
          <Row>
            {stats.map((stat, index) => (
              <Col key={index} lg={3} md={6} className="mb-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="stat-card"
                >
                  <div className="stat-icon">{stat.icon}</div>
                  <h3 className="stat-value">{stat.value}</h3>
                  <p className="stat-label">{stat.label}</p>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Features Section - Modern Cards */}
      <section className="features-section py-6">
        <Container>
          <Row className="justify-content-center mb-6">
            <Col lg={8} className="text-center">
              <div className="section-badge">Features</div>
              <h2 className="section-title">Why Industry Leaders Choose Us</h2>
              <p className="section-subtitle">
                Power your business with cutting-edge solutions designed for tomorrow's challenges
              </p>
            </Col>
          </Row>
          <Row className="g-4">
            {features.map((feature, index) => (
              <Col key={index} lg={4} md={6}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="feature-card-modern"
                >
                  <div 
                    className="feature-header"
                    style={{ background: feature.gradient }}
                  >
                    {feature.icon}
                    <span className="feature-stats">{feature.stats}</span>
                  </div>
                  <div className="feature-body">
                    <h3 className="feature-title">{feature.title}</h3>
                    <p className="feature-text">{feature.description}</p>
                    <Link to="/features" className="feature-link">
                      <span>Learn more</span>
                      <HiArrowRight />
                    </Link>
                  </div>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Benefits Section - Grid Layout */}
      <section className="benefits-section py-6 bg-light">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-5 mb-lg-0">
              <div className="benefits-visual">
                <div className="visual-container">
                  <div className="floating-card card-1">
                    <FiShield />
                    <span>Security</span>
                  </div>
                  <div className="floating-card card-2">
                    <FiZap />
                    <span>Speed</span>
                  </div>
                  <div className="floating-card card-3">
                    <FiGlobe />
                    <span>Global</span>
                  </div>
                  <div className="main-visual"></div>
                </div>
              </div>
            </Col>
            <Col lg={6}>
              <div className="section-badge">Benefits</div>
              <h2 className="section-title mb-4">Enterprise-Grade Features</h2>
              <p className="section-subtitle mb-5">
                Built with security, scalability, and performance at the core
              </p>
              <div className="benefits-grid">
                {benefits.map((benefit, index) => (
                  <div key={index} className="benefit-item-modern">
                    <div 
                      className="benefit-icon-wrapper"
                      style={{ backgroundColor: `${benefit.color}15` }}
                    >
                      <div className="benefit-icon" style={{ color: benefit.color }}>
                        {benefit.icon}
                      </div>
                    </div>
                    <span className="benefit-text">{benefit.text}</span>
                  </div>
                ))}
              </div>
              <Button variant="primary" className="mt-5 px-4 py-3">
                <span>Explore All Features</span>
                <HiArrowRight />
              </Button>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Testimonials Section - Modern */}
      <section className="testimonials-section py-6">
        <Container>
          <Row className="justify-content-center mb-6">
            <Col lg={8} className="text-center">
              <div className="section-badge">Testimonials</div>
              <h2 className="section-title">Trusted by Innovators Worldwide</h2>
              <p className="section-subtitle">
                Join thousands of companies accelerating their growth
              </p>
            </Col>
          </Row>
          <Row className="g-4">
            {testimonials.map((testimonial, index) => (
              <Col key={index} lg={4} md={6}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="testimonial-card-modern"
                >
                  <div className="testimonial-header">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.author}
                      className="testimonial-avatar"
                    />
                    <div className="testimonial-info">
                      <h4 className="testimonial-name">{testimonial.author}</h4>
                      <p className="testimonial-role">{testimonial.role}</p>
                    </div>
                    <div className="testimonial-rating">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <FiStar key={i} />
                      ))}
                    </div>
                  </div>
                  <div className="testimonial-body">
                    <FaQuoteLeft className="quote-icon" />
                    <p className="testimonial-quote">"{testimonial.quote}"</p>
                  </div>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* CTA Section - Modern */}
      <section className="cta-section-modern py-6">
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
                  <FiZap />
                  <span>Limited Time Offer</span>
                </div>
                <h2 className="cta-title">
                  Start Your Digital Transformation Today
                </h2>
                <p className="cta-text">
                  Join industry leaders and experience the future of business solutions. 
                  Get started with a 14-day free trial.
                </p>
                <div className="cta-buttons">
                  <Link to="/signup">
                    <Button variant="primary" size="lg" className="px-5 py-3">
                      <span>Start Free Trial</span>
                      <HiArrowRight />
                    </Button>
                  </Link>
                  <Link to="/demo">
                    <Button variant="outline-light" size="lg" className="px-5 py-3 ms-3">
                      <HiPlay />
                      <span>Book a Demo</span>
                    </Button>
                  </Link>
                </div>
                <div className="cta-footer">
                  <div className="cta-feature">
                    <FaRegCheckCircle />
                    <span>No credit card required</span>
                  </div>
                  <div className="cta-feature">
                    <FaRegCheckCircle />
                    <span>Cancel anytime</span>
                  </div>
                  <div className="cta-feature">
                    <FaRegCheckCircle />
                    <span>Full access to all features</span>
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

export default Home;