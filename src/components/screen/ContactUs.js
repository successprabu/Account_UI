import React from 'react';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import './css/ContactPage.css'; // Import the CSS file for styling
import AppHeader from '../common/AppHeader';

const ContactUs = () => {
  return (
    <div>
          <div><AppHeader/></div>
      <section className="contact-us">
        <Container>
          <Row className="text-center">
            <Col md={12}>
              <h1>Contact Us</h1>
              <p>We would love to hear from you. Please use the contact form below or reach out to us using the contact information provided.</p>
            </Col>
          </Row>

          <Row className="contact-info mt-4">
            <Col md={12}>
              <h2>Get in Touch</h2>
              <p>If you have any questions or need support, feel free to contact us via the form below or through the following channels:</p>
              <p><strong>Email:</strong> [Your Email Address]</p>
              <p><strong>Phone:</strong> [Your Phone Number]</p>
              <p><strong>Address:</strong> [Your Address]</p>
            </Col>
          </Row>

          <Row className="mt-4">
            <Col md={12}>
              <div className="contact-form">
                <h2>Contact Form</h2>
                <Form>
                  <Form.Group controlId="formName">
                    <Form.Label>Name</Form.Label>
                    <Form.Control type="text" placeholder="Your Name" />
                  </Form.Group>
                  
                  <Form.Group controlId="formEmail">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control type="email" placeholder="Your Email" />
                  </Form.Group>
                  
                  <Form.Group controlId="formMessage">
                    <Form.Label>Message</Form.Label>
                    <Form.Control as="textarea" rows={5} placeholder="Your Message" />
                  </Form.Group>
                  
                  <Button className="btn-primary" type="submit">Send Message</Button>
                </Form>
              </div>
            </Col>
          </Row>

          <Row className="map mt-4">
            <Col md={12}>
              <iframe 
                src="https://www.google.com/maps/embed?pb=YOUR_MAP_EMBED_URL" 
                allowFullScreen="" 
                loading="lazy">
              </iframe>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default ContactUs;
