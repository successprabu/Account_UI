import React from 'react';
import { NavLink } from 'react-router-dom';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import './css/ContactUs.css';

const ContactUs = () => {
  return (
    <>
    <Container className="contact-us mt-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="text-primary" style={{ backgroundColor: 'white' }}>
            <Card.Body>
              <Card.Title>Contact Us</Card.Title>
              <Card.Text>
                We are here to help you. Please reach out to us using any of the following methods:
              </Card.Text>
              <div className="d-flex justify-content-around">
                <NavLink to="mail-us">
                  <Button variant="primary">Mail Us</Button>
                </NavLink>
                <NavLink to="call-us">
                  <Button variant="primary">Call Us</Button>
                </NavLink>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
   
    </>
  );
};

export default ContactUs;
