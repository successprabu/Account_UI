import React, { useState } from 'react';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiSend,
  FiClock,
  FiMessageSquare,
  FiCheckCircle,
  FiArrowRight
} from 'react-icons/fi';
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
  FaWhatsapp,
  FaPaperPlane
} from 'react-icons/fa';
import { HiSparkles, HiArrowRight } from 'react-icons/hi';
import AppHeader from '../common/AppHeader';
import './css/ContactPage.css';

const ContactUs = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    phone: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const contactInfo = [
    {
      title: "Email Us",
      info: "mysuccesstechnologies@gmail.com",
      icon: <FiMail className="contact-icon" />,
      color: "#6366f1",
      link: "mailto:mysuccesstechnologies@gmail.com",
      action: "Send Email"
    },
    {
      title: "Call Us",
      info: "+91 80503 86769",
      icon: <FiPhone className="contact-icon" />,
      color: "#10b981",
      link: "tel:+918050386769",
      action: "Call Now"
    },
    {
      title: "Visit Us",
      info: "Bangalore, India",
      icon: <FiMapPin className="contact-icon" />,
      color: "#f59e0b",
      link: "https://maps.google.com",
      action: "View Map"
    },
    {
      title: "Business Hours",
      info: "Mon - Fri: 9:00 AM - 6:00 PM",
      icon: <FiClock className="contact-icon" />,
      color: "#8b5cf6",
      action: "Schedule Call"
    }
  ];

  const socialLinks = [
    { icon: <FaFacebookF />, link: "#", color: "#1877F2", label: "Facebook" },
    { icon: <FaTwitter />, link: "#", color: "#1DA1F2", label: "Twitter" },
    { icon: <FaLinkedinIn />, link: "#", color: "#0A66C2", label: "LinkedIn" },
    { icon: <FaInstagram />, link: "#", color: "#E4405F", label: "Instagram" },
    { icon: <FaWhatsapp />, link: "#", color: "#25D366", label: "WhatsApp" }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="contact-page">
      <AppHeader />
      
      {/* Hero Section */}
      <section className="contact-hero-modern">
        <div className="hero-bg-gradient"></div>
        <Container>
          <Row className="justify-content-center align-items-center min-vh-60">
            <Col lg={8} className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="hero-badge">
                  <span>Get in Touch</span>
                </div>
                <h1 className="hero-title">
                  Let's Build Something{" "}
                  <span className="gradient-text">Amazing Together</span>
                </h1>
                <p className="hero-subtitle">
                  Have questions about our solutions? Ready to start your digital transformation? 
                  Our team is here to help you succeed.
                </p>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Contact Info Section */}
      <section className="contact-info-section py-6">
        <Container>
          <Row className="g-4">
            {contactInfo.map((info, index) => (
              <Col key={index} lg={3} md={6}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="contact-info-card-modern"
                >
                  <div className="contact-icon-wrapper" style={{ color: info.color }}>
                    {info.icon}
                  </div>
                  <h4 className="contact-info-title">{info.title}</h4>
                  <p className="contact-info-detail">{info.info}</p>
                  {info.link ? (
                    <a href={info.link} className="contact-action-link">
                      <span>{info.action}</span>
                      <HiArrowRight />
                    </a>
                  ) : (
                    <div className="contact-action-text">
                      <span>{info.action}</span>
                    </div>
                  )}
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Main Contact Section */}
      <section className="main-contact-section py-6 bg-light-modern">
        <Container>
          <Row className="g-5 align-items-start">
            {/* Contact Form */}
            <Col lg={7}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="contact-form-modern"
              >
                <div className="form-header">
                  <div className="form-badge">
                    <FiMessageSquare />
                    <span>Send Message</span>
                  </div>
                  <h2 className="form-title">Get Personalized Assistance</h2>
                  <p className="form-subtitle">
                    Fill out the form below and our experts will get back to you within 24 hours.
                  </p>
                </div>

                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="success-message"
                  >
                    <FiCheckCircle />
                    <div>
                      <h4>Message Sent Successfully!</h4>
                      <p>We'll get back to you shortly. Thank you for contacting us.</p>
                    </div>
                  </motion.div>
                ) : (
                  <Form onSubmit={handleSubmit} className="modern-form">
                    <Row className="g-3">
                      <Col md={6}>
                        <Form.Group controlId="formName">
                          <Form.Label>Full Name *</Form.Label>
                          <Form.Control
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            required
                            className="modern-input"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group controlId="formEmail">
                          <Form.Label>Email Address *</Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john@example.com"
                            required
                            className="modern-input"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row className="g-3 mt-3">
                      <Col md={6}>
                        <Form.Group controlId="formPhone">
                          <Form.Label>Phone Number</Form.Label>
                          <Form.Control
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+91 98765 43210"
                            className="modern-input"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group controlId="formSubject">
                          <Form.Label>Subject *</Form.Label>
                          <Form.Control
                            type="text"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            placeholder="Project Inquiry"
                            required
                            className="modern-input"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group controlId="formMessage" className="mt-3">
                      <Form.Label>Your Message *</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={6}
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us about your project or inquiry..."
                        required
                        className="modern-textarea"
                      />
                    </Form.Group>

                    <div className="form-footer mt-4">
                      <Button type="submit" className="submit-btn-modern">
                        <span>Send Message</span>
                        <FiSend />
                      </Button>
                      <p className="form-note">
                        By submitting this form, you agree to our Privacy Policy.
                      </p>
                    </div>
                  </Form>
                )}
              </motion.div>
            </Col>

            {/* Contact Details & Social */}
            <Col lg={5}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="contact-details-modern"
              >
                <div className="details-header">
                  <div className="details-badge">
                    <HiSparkles />
                    <span>Quick Connect</span>
                  </div>
                  <h2 className="details-title">Connect With Us</h2>
                  <p className="details-subtitle">
                    Prefer other ways to get in touch? Here are more options.
                  </p>
                </div>

                <div className="social-links-modern">
                  <h4>Follow Us</h4>
                  <div className="social-icons-grid">
                    {socialLinks.map((social, index) => (
                      <motion.a
                        key={index}
                        href={social.link}
                        className="social-icon-modern"
                        style={{ backgroundColor: `${social.color}15`, color: social.color }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label={social.label}
                      >
                        {social.icon}
                      </motion.a>
                    ))}
                  </div>
                </div>

                <div className="support-info">
                  <h4>Support Hours</h4>
                  <div className="support-schedule">
                    <div className="support-item">
                      <FiClock />
                      <div>
                        <strong>Monday - Saturday </strong>
                        <p>9:00 AM - 8:00 PM IST</p>
                      </div>
                    </div>
                    <div className="support-item">
                      <FiClock />
                      <div>
                        <strong>Weekend Support</strong>
                        <p>Emergency support available</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="quick-links">
                  <h4>Quick Links</h4>
                  <div className="links-grid">
                    <a href="/faq" className="quick-link">
                      <FiArrowRight />
                      <span>FAQ & Help Center</span>
                    </a>
                    <a href="/support" className="quick-link">
                      <FiArrowRight />
                      <span>Technical Support</span>
                    </a>
                    <a href="/demo" className="quick-link">
                      <FiArrowRight />
                      <span>Book a Demo</span>
                    </a>
                    <a href="/pricing" className="quick-link">
                      <FiArrowRight />
                      <span>Pricing Plans</span>
                    </a>
                  </div>
                </div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Map Section */}
      <section className="map-section-modern">
        <Container fluid className="px-0">
          <div className="map-header">
            <h3 className="map-title">Our Location</h3>
            <p className="map-subtitle">Visit our headquarters in Bangalore</p>
          </div>
          <div className="map-container-modern">
            <iframe
              title="office-location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.9864420549655!2d77.59412331582056!3d12.93498039088509!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae15c49c040309%3A0x6553433f72187b01!2sBangalore%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1647856781234!5m2!1sen!2sin"
              className="modern-map-iframe"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="contact-cta-section py-6">
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
                  <FaPaperPlane />
                  <span>Ready to Start?</span>
                </div>
                <h2 className="cta-title">
                  Let's Discuss Your Next Project
                </h2>
                <p className="cta-text">
                  Schedule a free consultation with our experts and discover how we can 
                  transform your business with our cutting-edge solutions.
                </p>
                <div className="cta-buttons">
                  <a href="/demo" className="cta-btn-primary">
                    <span>Schedule Free Consultation</span>
                    <HiArrowRight />
                  </a>
                  <a href="tel:+918050386769" className="cta-btn-secondary">
                    <FiPhone />
                    <span>Call Now: +91 80503 86769</span>
                  </a>
                </div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default ContactUs;