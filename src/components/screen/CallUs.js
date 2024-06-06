import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const CallUs = () => {
  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="text-primary" style={{ backgroundColor: 'white' }}>
            <Card.Body>
              <Card.Title>Call Us</Card.Title>
              <Card.Text>
                You can call us at: <a href="tel:+1234567890">+1234567890</a>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CallUs;
