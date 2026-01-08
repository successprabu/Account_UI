import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { motion, useAnimation } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FiHome,
  FiRefreshCw,
  FiClock,
  FiZap,
  FiCpu,
  FiMail,
  FiArrowRight,
  FiCoffee,
  FiTarget,
  FiTrendingUp,
  FiAward,
  FiUser
} from 'react-icons/fi';
import {
  FaRocket,
  FaRegLightbulb,
  FaTools,
  FaRegCalendarCheck,
  FaRegSmileWink
} from 'react-icons/fa';
import { HiSparkles, HiArrowRight, HiLightningBolt } from 'react-icons/hi';
import './css/InProgressPage.css';
import AppHeader from '../common/AppHeader';

const InProgressPage = () => {
  const [progress, setProgress] = useState(0);
  const controls = useAnimation();

  useEffect(() => {
    // Progress bar animation
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 1;
      });
    }, 100);

    // Floating animation for elements
    controls.start({
      y: [0, -10, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse"
      }
    });

    return () => clearInterval(timer);
  }, [controls]);

  const features = [
    { icon: <FiZap />, text: "AI-Powered Features", color: "#6366f1" },
    { icon: <FiCpu />, text: "Advanced Analytics", color: "#10b981" },
    { icon: <FaRegLightbulb />, text: "Smart Automation", color: "#f59e0b" },
    { icon: <FaTools />, text: "Enhanced Tools", color: "#8b5cf6" }
  ];

  const updates = [
    { time: "5 min", activity: "Optimizing algorithms" },
    { time: "10 min", activity: "Testing new features" },
    { time: "15 min", activity: "Performance enhancements" },
    { time: "20 min", activity: "Security updates" }
  ];

  return (
    <div className="inprogress-page">
      <AppHeader />
      
      {/* Hero Section */}
      <section className="inprogress-hero">
        <div className="hero-bg-gradient"></div>
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
        <Container>
          <Row className="justify-content-center align-items-center min-vh-80">
            <Col lg={8} className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <motion.div
                  animate={controls}
                  className="sparkle-icon"
                >
                  <HiSparkles />
                </motion.div>
                <div className="status-badge">
                  <FiClock />
                  <span>Work in Progress</span>
                </div>
                <h1 className="hero-title">
                  Something{" "}
                  <span className="gradient-text">Amazing</span>{" "}
                  is Coming!
                </h1>
                <p className="hero-subtitle">
                  We're working hard to bring you innovative features and improvements. 
                  This page is under active development with exciting updates on the way.
                </p>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Progress Section */}
      <section className="progress-section py-6">
        <Container>
          <Row className="justify-content-center mb-6">
            <Col lg={8} className="text-center">
              <h2 className="section-title">Building the Future</h2>
              <p className="section-subtitle">
                Our team is crafting something special. Here's what we're working on:
              </p>
            </Col>
          </Row>
          
          <Row className="g-4">
            {features.map((feature, index) => (
              <Col key={index} lg={3} md={6}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="feature-card-progress"
                >
                  <div 
                    className="feature-icon-progress"
                    style={{ color: feature.color }}
                  >
                    {feature.icon}
                  </div>
                  <h4 className="feature-title-progress">{feature.text}</h4>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Progress Bar Section */}
      <section className="progress-bar-section py-6 bg-light-modern">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-5 mb-lg-0">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="section-title mb-4">
                  Development <span className="highlight">Progress</span>
                </h2>
                <p className="section-text mb-4">
                  We're making steady progress on the new features. 
                  Our team is dedicated to delivering a seamless and enhanced experience.
                </p>
                <div className="progress-stats">
                  <div className="stat-item">
                    <FaRocket />
                    <div>
                      <h4>85%</h4>
                      <p>Core Features</p>
                    </div>
                  </div>
                  <div className="stat-item">
                    <HiLightningBolt />
                    <div>
                      <h4>70%</h4>
                      <p>Performance</p>
                    </div>
                  </div>
                  <div className="stat-item">
                    <FaRegSmileWink />
                    <div>
                      <h4>90%</h4>
                      <p>UX Design</p>
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
                className="progress-visual"
              >
                <div className="progress-container">
                  <div className="progress-label">
                    <span>Overall Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="progress-track">
                    <motion.div
                      className="progress-fill"
                      initial={{ width: "0%" }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1 }}
                      style={{
                        background: `linear-gradient(90deg, #6366f1 0%, #8b5cf6 ${progress}%, #a78bfa 100%)`
                      }}
                    />
                  </div>
                  <div className="progress-dots">
                    {[25, 50, 75, 100].map((dot) => (
                      <div 
                        key={dot}
                        className={`progress-dot ${progress >= dot ? 'active' : ''}`}
                      >
                        <div className="dot-label">{dot}%</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="updates-list">
                  <h4 className="updates-title">Recent Updates</h4>
                  {updates.map((update, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="update-item"
                    >
                      <div className="update-time">{update.time}</div>
                      <div className="update-activity">{update.activity}</div>
                      <div className="update-indicator"></div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="inprogress-cta py-6">
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
                  <FiCoffee />
                  <span>Stay Tuned!</span>
                </div>
                <h2 className="cta-title">
                  Great Things Take Time
                </h2>
                <p className="cta-text">
                  We're putting in the extra hours to deliver something truly special. 
                  While you wait, explore our existing features or get in touch with our team.
                </p>
                <div className="cta-buttons">
                 <Link to="/home">
                    <Button variant="primary" size="lg" className="cta-btn-primary">
                      <FiHome />
                      <span>Back to Home</span>
                    </Button>
                 </Link>
                  <Link to="/contactUs">
                    <Button variant="outline-light" size="lg" className="cta-btn-secondary">
                      <FiMail />
                      <span>Contact Us</span>
                    </Button>
                  </Link>
                </div>
                <div className="countdown-info">
                  <div className="countdown-item">
                    <FaRegCalendarCheck />
                    <div>
                      <h5>Expected Launch</h5>
                      <p>Coming Soon</p>
                    </div>
                  </div>
                  <div className="countdown-item">
                    <FiRefreshCw />
                    <div>
                      <h5>Last Updated</h5>
                      <p>Just Now</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Fun Animation Section */}
      <section className="animation-section">
        <div className="animation-container">
          <div className="pulse-ring"></div>
          <div className="pulse-ring delay-1"></div>
          <div className="pulse-ring delay-2"></div>
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{
              rotate: {
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              },
              scale: {
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }
            }}
            className="center-icon"
          >
            <HiSparkles />
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default InProgressPage;