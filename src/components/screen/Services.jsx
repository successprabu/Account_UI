import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  FiArrowRight, 
  FiZap, 
  FiTrendingUp,
  FiShield,
  FiGlobe,
  FiCheckCircle,
  FiBookOpen,
  FiCalendar,
  FiHome,
  FiUsers
} from 'react-icons/fi';
import { 
  FaSchool, 
  FaHandsHelping, 
  FaCalendarAlt, 
  FaAnchor,
  FaRobot,
  FaChartLine,
  FaDatabase,
  FaMobileAlt,
  FaCloud,
  FaLock
} from 'react-icons/fa';
import { HiSparkles, HiTemplate, HiUserGroup, HiArrowRight, HiLightningBolt } from 'react-icons/hi';
import './css/ServicePage.css';
import { Link } from 'react-router-dom';

const ServicePage = () => {
  const { t } = useTranslation();

  const services = [
    {
      title: "moitech",
      description: "moitechDescription",
      icon: <HiSparkles className="service-icon" />,
      gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
      features: ["AI-Powered", "Real-time Analytics", "Automation", "Scalable"],
      link: "purchase",
      stats: "40% Efficiency Gain"
    },
    {
      title: "mahalManagement",
      description: "mahalDescription",
      icon: <HiTemplate className="service-icon" />,
      gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      features: ["Event Planning", "Resource Management", "Booking System", "Reporting"],
      link: "mahal-reg",
      stats: "Streamlined Operations"
    },
    {
      title: "schoolWebsiteERP",
      description: "schoolDescription",
      icon: <HiUserGroup className="service-icon" />,
      gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      features: ["Student Management", "Academic Tracking", "Parent Portal", "Fee Collection"],
      link: "inprogress",
      stats: "Complete Solution"
    },
  ];

  const serviceFeatures = [
    {
      title: "AI-Powered Solutions",
      description: "Leverage cutting-edge artificial intelligence for intelligent automation",
      icon: <FaRobot />,
      color: "#6366f1"
    },
    {
      title: "Real-time Analytics",
      description: "Make data-driven decisions with live insights and dashboards",
      icon: <FaChartLine />,
      color: "#10b981"
    },
    {
      title: "Enterprise Security",
      description: "Bank-grade security with end-to-end encryption",
      icon: <FaLock />,
      color: "#ef4444"
    },
    {
      title: "Cloud Native",
      description: "Built for the cloud with 99.9% uptime guarantee",
      icon: <FaCloud />,
      color: "#8b5cf6"
    },
    {
      title: "Mobile First",
      description: "Fully responsive design with dedicated mobile apps",
      icon: <FaMobileAlt />,
      color: "#f59e0b"
    },
    {
      title: "Scalable Architecture",
      description: "Grow with your business needs without limitations",
      icon: <FaDatabase />,
      color: "#ec4899"
    },
  ];

  const industries = [
    { name: "Education", icon: <FaSchool />, count: "500+ Schools" },
    { name: "Events & Hospitality", icon: <FaCalendarAlt />, count: "200+ Venues" },
    { name: "Technology", icon: <FiZap />, count: "100+ Startups" },
    { name: "Enterprise", icon: <FiGlobe />, count: "50+ Corporations" },
  ];

  return (
    <div className="service-page">
      {/* <AppHeader /> */}
      
      {/* Hero Section */}
      <section className="service-hero-modern">
        <div className="hero-bg-gradient"></div>
        <Container>
          <Row className="justify-content-center align-items-center min-vh-80">
            <Col lg={10} className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="hero-badge">
                  <span>Our Solutions</span>
                </div>
                <h1 className="hero-title">
                  Transformative{" "}
                  <span className="gradient-text">Digital Solutions</span>
                </h1>
                <p className="hero-subtitle">
                  Power your business with our cutting-edge, AI-driven platforms designed 
                  for efficiency, growth, and unparalleled success.
                </p>
                <div className="hero-cta">
                    <Link to="/purchase">
                    <Button variant="outline-light" className="cta-button">
                      <span>{t("watchDemo")}</span>
                    </Button>
                  </Link>
                  <Link to="/contactus">
                    <Button variant="primary" className="cta-button me-3">
                      <span>Get Free Consultation</span>
                      <HiArrowRight />
                    </Button>
                  </Link>
                
                </div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="service-stats-section py-5">
        <Container>
          <Row>
            {[
              { value: "500+", label: "Happy Clients", icon: <FiUsers />, color: "#6366f1" },
              { value: "99.7%", label: "Satisfaction Rate", icon: <FiTrendingUp />, color: "#10b981" },
              { value: "24/7", label: "Expert Support", icon: <FiShield />, color: "#f59e0b" },
              { value: "3M+", label: "Users Served", icon: <FiGlobe />, color: "#8b5cf6" },
            ].map((stat, index) => (
              <Col key={index} lg={3} md={6} className="mb-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="stat-card-modern"
                >
                  <div className="stat-icon-wrapper" style={{ color: stat.color }}>
                    {stat.icon}
                  </div>
                  <h3 className="stat-value">{stat.value}</h3>
                  <p className="stat-label">{stat.label}</p>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Services Grid */}
      <section className="services-grid-section py-6">
        <Container>
          <Row className="justify-content-center mb-6">
            <Col lg={8} className="text-center">
              <div className="section-badge">Our Platforms</div>
              <h2 className="section-title">Comprehensive Digital Solutions</h2>
              <p className="section-subtitle">
                Each platform is engineered with precision to solve specific business challenges
              </p>
            </Col>
          </Row>
          <Row className="g-4">
            {services.map((service, index) => (
              <Col key={index} lg={4} md={6}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="service-card-modern"
                >
                  <div 
                    className="service-card-header"
                    style={{ background: service.gradient }}
                  >
                    <div className="service-icon-wrapper">
                      {service.icon}
                    </div>
                    <div className="service-stats-badge">
                      {service.stats}
                    </div>
                  </div>
                  <div className="service-card-body">
                    <h3 className="service-title">{t(service.title)}</h3>
                    <p className="service-description">{t(service.description)}</p>
                    <div className="service-features">
                      {service.features.map((feature, idx) => (
                        <div key={idx} className="feature-tag">
                          <FiCheckCircle />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Link to={service.link} className="service-link">
                      <span>Explore Platform</span>
                      <HiArrowRight />
                    </Link>
                  </div>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="features-section-modern py-6 bg-light-modern">
        <Container>
          <Row className="justify-content-center mb-6">
            <Col lg={8} className="text-center">
              <div className="section-badge">Why Choose Us</div>
              <h2 className="section-title">Built for Excellence</h2>
              <p className="section-subtitle">
                Every solution is crafted with industry-leading features
              </p>
            </Col>
          </Row>
          <Row className="g-4">
            {serviceFeatures.map((feature, index) => (
              <Col key={index} lg={4} md={6}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="feature-card-modern"
                >
                  <div className="feature-icon-wrapper" style={{ backgroundColor: `${feature.color}15` }}>
                    <div className="feature-icon" style={{ color: feature.color }}>
                      {feature.icon}
                    </div>
                  </div>
                  <h4 className="feature-title">{feature.title}</h4>
                  <p className="feature-description">{feature.description}</p>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Industries Section */}
      <section className="industries-section py-6">
        <Container>
          <Row className="justify-content-center mb-6">
            <Col lg={8} className="text-center">
              <div className="section-badge">Industries We Serve</div>
              <h2 className="section-title">Trusted Across Sectors</h2>
              <p className="section-subtitle">
                Our solutions are tailored for diverse industry needs
              </p>
            </Col>
          </Row>
          <Row className="g-4">
            {industries.map((industry, index) => (
              <Col key={index} lg={3} md={6}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="industry-card-modern"
                >
                  <div className="industry-icon">
                    {industry.icon}
                  </div>
                  <h4 className="industry-name">{industry.name}</h4>
                  <p className="industry-count">{industry.count}</p>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="service-cta-section py-6">
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
                  <HiLightningBolt />
                  <span>Get Started Today</span>
                </div>
                <h2 className="cta-title">
                  Ready to Transform Your Business?
                </h2>
                <p className="cta-text">
                  Schedule a personalized demo and see how our solutions can drive 
                  your success. No commitment required.
                </p>
                <div className="cta-buttons">
                  <Link to="/contactUs">
                    <Button variant="primary" size="lg" className="px-5 py-3">
                      <span>Book Free Demo</span>
                      <HiArrowRight />
                    </Button>
                  </Link>
                  <Link to="/pricing">
                    <Button variant="outline-light" size="lg" className="px-5 py-3 ms-3">
                      <span>View Pricing</span>
                    </Button>
                  </Link>
                </div>
                <div className="cta-guarantee">
                  <div className="guarantee-item">
                    <FiCheckCircle />
                    <span>30-day free trial</span>
                  </div>
                  <div className="guarantee-item">
                    <FiCheckCircle />
                    <span>No credit card required</span>
                  </div>
                  <div className="guarantee-item">
                    <FiCheckCircle />
                    <span>24/7 expert support</span>
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

export default ServicePage;