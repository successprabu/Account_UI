import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { 
  FiHome, 
  FiArrowLeft,
  FiCompass,
  FiSearch,
  FiAlertTriangle,
  FiNavigation
} from 'react-icons/fi';
import { 
  FaRegSadTear,
  FaRocket,
  FaGhost
} from 'react-icons/fa';
import { HiSparkles, HiArrowRight } from 'react-icons/hi';
import './css/NotFoundPage.css';
import AppHeader from '../common/AppHeader';


const PageNotFound = () => {
  const floatingElements = [
    { icon: <FaGhost />, top: '20%', left: '10%', delay: 0, size: 'small' },
    { icon: <FiCompass />, top: '30%', right: '15%', delay: 0.5, size: 'medium' },
    { icon: <FiSearch />, bottom: '25%', left: '15%', delay: 1, size: 'small' },
    { icon: <FiAlertTriangle />, bottom: '35%', right: '10%', delay: 1.5, size: 'medium' },
  ];

  const quickLinks = [
    { label: 'Home', to: '/', icon: <FiHome /> },
    { label: 'Services', to: '/services', icon: <FaRocket /> },
    { label: 'About', to: '/about', icon: <HiSparkles /> },
    { label: 'Contact', to: '/contact', icon: <FiNavigation /> },
  ];

  return (
    <div className="notfound-page">
      <AppHeader />
      
      {/* Animated Background */}
      <div className="notfound-bg">
        <div className="bg-gradient"></div>
        <div className="bg-grid"></div>
        {floatingElements.map((element, index) => (
          <motion.div
            key={index}
            className={`floating-element ${element.size}`}
            style={{
              top: element.top,
              left: element.left,
              right: element.right,
              bottom: element.bottom,
            }}
            animate={{
              y: [0, -30, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 3,
              delay: element.delay,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          >
            {element.icon}
          </motion.div>
        ))}
      </div>

      <Container>
        <Row className="justify-content-center align-items-center min-vh-80">
          <Col lg={8} className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="notfound-content"
            >
              {/* Animated 404 Text */}
              <motion.div
                className="notfound-number"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  duration: 0.8,
                  type: "spring",
                  stiffness: 100
                }}
              >
                <span className="digit digit-1">4</span>
                <motion.span
                  className="digit digit-0"
                  animate={{
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  0
                </motion.span>
                <span className="digit digit-2">4</span>
              </motion.div>

              {/* Error Message */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="error-message"
              >
                <div className="error-icon">
                  <FaRegSadTear />
                </div>
                <h1 className="error-title">Oops! Page Not Found</h1>
                <p className="error-subtitle">
                  The page you're looking for seems to have vanished into the digital ether.
                  Don't worry, even the best explorers sometimes take wrong turns.
                </p>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="error-stats"
              >
                <div className="stat-item">
                  <div className="stat-number">404</div>
                  <div className="stat-label">Error Code</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">0.0001%</div>
                  <div className="stat-label">Chance of Happening</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">∞</div>
                  <div className="stat-label">Other Pages to Explore</div>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="action-buttons"
              >
                <Link to="/">
                  <Button variant="primary" className="action-btn primary-btn">
                    <FiHome />
                    <span>Return to Home</span>
                    <HiArrowRight />
                  </Button>
                </Link>
                <Button 
                  variant="outline-light" 
                  className="action-btn secondary-btn"
                  onClick={() => window.history.back()}
                >
                  <FiArrowLeft />
                  <span>Go Back</span>
                </Button>
              </motion.div>

              {/* Quick Links */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="quick-links-section"
              >
                <h3 className="quick-links-title">Quick Navigation</h3>
                <div className="quick-links-grid">
                  {quickLinks.map((link, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link to={link.to} className="quick-link-card">
                        <div className="quick-link-icon">
                          {link.icon}
                        </div>
                        <span className="quick-link-label">{link.label}</span>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Fun Message */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="fun-message"
              >
                <p className="fun-text">
                  <span className="highlight">Pro tip:</span> While you're here, enjoy this rare 404 page. 
                  Our designers worked hard to make getting lost look good!
                </p>
              </motion.div>
            </motion.div>
          </Col>
        </Row>
      </Container>

      {/* Bottom Animation */}
      <div className="bottom-animation">
        <div className="scan-line"></div>
      </div>
    </div>
  );
};

export default PageNotFound;