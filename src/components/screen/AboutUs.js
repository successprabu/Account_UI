import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import "./css/AboutPage.css";
import AppHeader from "../common/AppHeader";
import {
  FiTarget,
  FiUsers,
  FiAward,
  FiHeart,
  FiShield,
  FiStar,
  FiGlobe,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiTrendingUp,
  FiZap
} from "react-icons/fi";
import {
  FaLightbulb,
  FaUserFriends,
  FaHandshake,
  FaRocket,
  FaChartLine,
  FaRegBuilding,
  FaCrown,
  FaRegHeart
} from "react-icons/fa";
import { HiSparkles, HiUserGroup, HiTemplate, HiArrowRight } from "react-icons/hi";

const AboutUs = () => {
  const { t } = useTranslation();

  const values = [
    {
      title: "Innovation First",
      description: "Constantly evolving with cutting-edge technology to provide advanced solutions that shape the future.",
      icon: <HiSparkles className="value-icon" />,
      gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
      stats: "50+ Patents"
    },
    {
      title: "Customer Obsession",
      description: "Our clients are at the heart of everything we do. We strive to understand and exceed their expectations.",
      icon: <FaUserFriends className="value-icon" />,
      gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      stats: "99% Satisfaction"
    },
    {
      title: "Integrity & Trust",
      description: "We conduct our business with the highest level of honesty, transparency, and ethical standards.",
      icon: <FiShield className="value-icon" />,
      gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      stats: "100% Ethical"
    },
    {
      title: "Excellence Driven",
      description: "Committed to delivering exceptional quality and results that transform businesses.",
      icon: <FiAward className="value-icon" />,
      gradient: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)",
      stats: "Award Winning"
    }
  ];

  const milestones = [
    { year: "2020", title: "Company Founded", description: "Started with a visionary team of passionate innovators", icon: <FaRocket /> },
    { year: "2021", title: "First Enterprise Client", description: "Secured our first Fortune 500 partnership", icon: <FaChartLine /> },
    { year: "2022", title: "Global Expansion", description: "Expanded operations to 3 continents", icon: <FiGlobe /> },
    { year: "2023", title: "Product Suite Launch", description: "Launched our comprehensive AI-driven platform", icon: <FiZap /> },
    { year: "2024", title: "Industry Recognition", description: "Named top innovator in technology solutions", icon: <FaCrown /> }
  ];

  const teamStats = [
    { value: "150+", label: "Team Members", icon: <FiUsers />, color: "#6366f1" },
    { value: "500+", label: "Projects Delivered", icon: <FiTarget />, color: "#10b981" },
    { value: "40+", label: "Countries Served", icon: <FiGlobe />, color: "#f59e0b" },
    { value: "98%", label: "Client Retention", icon: <FiHeart />, color: "#ec4899" }
  ];

  const contactInfo = [
    {
      title: "Email",
      info: "mysuccesstechnologies@gmail.com",
      icon: <FiMail />,
      color: "#6366f1",
      link: "mailto:mysuccesstechnologies@gmail.com"
    },
    {
      title: "Phone",
      info: "+91 8050386769",
      icon: <FiPhone />,
      color: "#10b981",
      link: "tel:+918050386769"
    },
    {
      title: "Headquarters",
      info: "Bangalore, India",
      icon: <FiMapPin />,
      color: "#f59e0b",
      link: "https://maps.google.com"
    }
  ];

  return (
    <div className="about-page">
      <AppHeader />
      
      {/* Hero Section - Modern */}
      <section className="about-hero-modern">
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
                  <span>About Us</span>
                </div>
                <h1 className="hero-title">
                  Pioneering the Future of{" "}
                  <span className="gradient-text">Digital Innovation</span>
                </h1>
                <p className="hero-subtitle">
                  We transform businesses with AI-driven solutions, delivering unprecedented 
                  efficiency, growth, and success for our clients worldwide.
                </p>
                <div className="hero-cta">
                  <Button variant="primary" className="cta-button me-3">
                    <span>Our Story</span>
                    <HiArrowRight />
                  </Button>
                  <Button variant="outline-light" className="cta-button">
                    <span>Meet Our Team</span>
                  </Button>
                </div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="stats-section-modern py-5">
        <Container>
          <Row>
            {teamStats.map((stat, index) => (
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

      {/* Mission Section - Modern */}
      <section className="mission-section-modern py-6">
        <Container>
          <Row className="justify-content-center">
            <Col lg={10} className="text-center">
              <div className="section-badge">Our Purpose</div>
              <h2 className="section-title mb-4">
                Empowering Businesses with{" "}
                <span className="highlight">Intelligent Solutions</span>
              </h2>
              <div className="mission-card">
                <div className="mission-icon">
                  <FiTarget />
                </div>
                <p className="mission-text">
                  At MySuccess.Com, we're on a mission to revolutionize how businesses operate 
                  through cutting-edge technology and AI-driven innovation. We believe in creating 
                  solutions that not only solve today's challenges but also anticipate tomorrow's 
                  opportunities.
                </p>
                <div className="mission-features">
                  <div className="feature-item">
                    <FiZap />
                    <span>AI-Powered Solutions</span>
                  </div>
                  <div className="feature-item">
                    <FiGlobe />
                    <span>Global Impact</span>
                  </div>
                  <div className="feature-item">
                    <FiTrendingUp />
                    <span>Growth Focused</span>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Who We Are - Modern */}
      <section className="who-we-are-section py-6 bg-light-modern">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-5 mb-lg-0">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="section-badge">Our Identity</div>
                <h2 className="section-title mb-4">
                  A Collective of <span className="highlight">Visionaries & Builders</span>
                </h2>
                <p className="section-text mb-4">
                  MySuccess.Com is a dynamic team of passionate innovators, engineers, and 
                  strategists united by a common goal: to build transformative technology 
                  solutions that drive real business impact.
                </p>
                <div className="team-highlights">
                  <div className="highlight-item">
                    <FiUsers />
                    <div>
                      <h4>Diverse Expertise</h4>
                      <p>150+ specialists across multiple domains</p>
                    </div>
                  </div>
                  <div className="highlight-item">
                    <FaRegBuilding />
                    <div>
                      <h4>Global Presence</h4>
                      <p>Serving clients across 40+ countries</p>
                    </div>
                  </div>
                  <div className="highlight-item">
                    <FiStar />
                    <div>
                      <h4>Award-Winning</h4>
                      <p>Recognized for innovation excellence</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Col>
            <Col lg={6}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="team-visual"
              >
                <div className="visual-container">
                  <div className="team-image-main">
                    <div className="image-overlay"></div>
                    <div className="team-stats">
                      <div className="stat-bubble bubble-1">
                        <span>24/7</span>
                        <small>Support</small>
                      </div>
                      <div className="stat-bubble bubble-2">
                        <span>150+</span>
                        <small>Experts</small>
                      </div>
                      <div className="stat-bubble bubble-3">
                        <span>40+</span>
                        <small>Countries</small>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Values Section - Modern Grid */}
      <section className="values-section-modern py-6">
        <Container>
          <Row className="justify-content-center mb-6">
            <Col lg={8} className="text-center">
              <div className="section-badge">Our Core</div>
              <h2 className="section-title">Principles That Define Us</h2>
              <p className="section-subtitle">
                These values guide every decision we make and every solution we build
              </p>
            </Col>
          </Row>
          <Row className="g-4">
            {values.map((value, index) => (
              <Col key={index} lg={3} md={6}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="value-card-modern"
                >
                  <div 
                    className="value-header"
                    style={{ background: value.gradient }}
                  >
                    {value.icon}
                  </div>
                  <div className="value-body">
                    <div className="value-stats">{value.stats}</div>
                    <h3 className="value-title">{value.title}</h3>
                    <p className="value-text">{value.description}</p>
                  </div>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Journey Section - Modern Timeline */}
      <section className="journey-section-modern py-6 bg-light-modern">
        <Container>
          <Row className="justify-content-center mb-6">
            <Col lg={8} className="text-center">
              <div className="section-badge">Our Journey</div>
              <h2 className="section-title">Milestones of Innovation</h2>
              <p className="section-subtitle">
                From visionary startup to global technology leader
              </p>
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <div className="timeline-modern">
                {milestones.map((milestone, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`timeline-item-modern ${index % 2 === 0 ? 'left' : 'right'}`}
                  >
                    <div className="timeline-content-modern">
                      <div className="timeline-icon">{milestone.icon}</div>
                      <div className="timeline-year">{milestone.year}</div>
                      <h4 className="timeline-title">{milestone.title}</h4>
                      <p className="timeline-description">{milestone.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Contact Section - Modern */}
      <section className="contact-section-modern py-6">
        <div className="contact-bg-gradient"></div>
        <Container>
          <Row className="justify-content-center mb-6">
            <Col lg={8} className="text-center">
              <div className="section-badge">Get in Touch</div>
              <h2 className="section-title">Let's Build Something Amazing Together</h2>
              <p className="section-subtitle">
                Whether you have questions, need support, or want to explore partnerships, 
                we're here to help transform your vision into reality.
              </p>
            </Col>
          </Row>
          <Row className="g-4">
            {contactInfo.map((contact, index) => (
              <Col key={index} lg={4} md={6}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="contact-card-modern"
                >
                  <a href={contact.link} className="contact-link">
                    <div className="contact-icon-wrapper" style={{ color: contact.color }}>
                      {contact.icon}
                    </div>
                    <h4 className="contact-title">{contact.title}</h4>
                    <p className="contact-info">{contact.info}</p>
                    <div className="contact-action">
                      <span>Get in touch</span>
                      <HiArrowRight />
                    </div>
                  </a>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default AboutUs;