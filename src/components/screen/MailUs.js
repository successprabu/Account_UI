import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const MailUs = () => {
  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="text-primary" style={{ backgroundColor: 'white' }}>
            <Card.Body>
              <Card.Title>Mail Us</Card.Title>
              <Card.Text>
                You can email us at: <a href="mailto:support@example.com">support@example.com</a>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default MailUs;
