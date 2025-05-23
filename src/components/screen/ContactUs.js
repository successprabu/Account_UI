import React from 'react';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import './css/ContactPage.css';
import AppHeader from '../common/AppHeader';

const ContactUs = () => {
  return (
    <div>
      <AppHeader />
      <section className="contact-section">
        <Container>
          <Row className="mb-5">
            <Col className="text-center">
              <h1 className="section-title">Get in Touch</h1>
              <p className="section-subtitle">We're here to help and answer any questions you might have.</p>
            </Col>
          </Row>

          <Row className="contact-content">
            {/* Contact Info Column */}
            <Col md={5} className="contact-info">
              <div className="info-card">
                <h2 className="info-title">Contact Information</h2>
                <div className="contact-method">
                  <i className="fas fa-envelope"></i>
                  <div>
                    <h3>Email Us</h3>
                    <p>successprabumca@gmail.com</p>
                  </div>
                </div>
                
                <div className="contact-method">
                  <i className="fas fa-phone"></i>
                  <div>
                    <h3>Call Us</h3>
                    <p>+91 80503 86769</p>
                  </div>
                </div>

                <div className="contact-method">
                  <i className="fas fa-map-marker-alt"></i>
                  <div>
                    <h3>Visit Us</h3>
                    <p>123 Business Street<br />Chennai, India 600001</p>
                  </div>
                </div>

                <div className="social-links mt-4">
                  <a href="#"><i className="fab fa-facebook"></i></a>
                  <a href="#"><i className="fab fa-twitter"></i></a>
                  <a href="#"><i className="fab fa-linkedin"></i></a>
                  <a href="#"><i className="fab fa-instagram"></i></a>
                </div>
              </div>
            </Col>

            {/* Contact Form Column */}
            <Col md={7} className="contact-form">
              <div className="form-card">
                <h2 className="form-title">Send Us a Message</h2>
                <Form>
                  <Row>
                    <Col md={6}>
                      <Form.Group controlId="formName" className="mb-4">
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control 
                          type="text" 
                          placeholder="John Doe" 
                          className="form-input"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId="formEmail" className="mb-4">
                        <Form.Label>Email Address</Form.Label>
                        <Form.Control 
                          type="email" 
                          placeholder="john@example.com" 
                          className="form-input"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group controlId="formSubject" className="mb-4">
                    <Form.Label>Subject</Form.Label>
                    <Form.Control 
                      type="text" 
                      placeholder="Enter subject" 
                      className="form-input"
                    />
                  </Form.Group>

                  <Form.Group controlId="formMessage" className="mb-4">
                    <Form.Label>Message</Form.Label>
                    <Form.Control 
                      as="textarea" 
                      rows={5} 
                      placeholder="Write your message here..." 
                      className="form-input"
                    />
                  </Form.Group>

                  <Button className="submit-btn" type="submit">
                    Send Message <i className="fas fa-paper-plane ms-2"></i>
                  </Button>
                </Form>
              </div>
            </Col>
          </Row>

          <Row className="mt-5">
            <Col md={12} className="map-container">
              <iframe
                title="office-location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15551.275098185!2d80.250968!3d13.004595!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a52679d8d26c0d1%3A0x2d5cbd087b1f8c0!2sChennai%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1716610324498!5m2!1sen!2sin"
                className="map-iframe"
                allowFullScreen
                loading="lazy"
              ></iframe>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default ContactUs;