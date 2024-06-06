import React from 'react';

import { Carousel, Container, Row, Col, Card, ListGroup } from 'react-bootstrap';

const Home = () => {
  return (
    <Container fluid>
      <Row className="justify-content-center">
        <Col xs={12} md={12}>
          <Carousel>
            <Carousel.Item>
              <img
                className="d-block w-100"
                src="1.jpg"
                alt="First slide"
              />
              <Carousel.Caption>
                <h3>First Slide</h3>
                <p>Some description for the first slide.</p>
              </Carousel.Caption>
            </Carousel.Item>
            <Carousel.Item>
              <img
                className="d-block w-100"
                src="2.jpg"
                alt="Second slide"
              />
              <Carousel.Caption>
                <h3>Second Slide</h3>
                <p>Some description for the second slide.</p>
              </Carousel.Caption>
            </Carousel.Item>
            <Carousel.Item>
              <img
                className="d-block w-100"
                src="3.jpg"
                alt="Third slide"
              />
              <Carousel.Caption>
                <h3>Third Slide</h3>
                <p>Some description for the third slide.</p>
              </Carousel.Caption>
            </Carousel.Item>
          </Carousel>
        </Col>
      </Row>
      <Row className="justify-content-center mt-4">
        <Col xs={12} md={12} >
          <Card bg="primary" text="white">
            <Card.Header className="text-center">About Our Software</Card.Header>
            <Card.Body>
              <Card.Text>
                <ListGroup variant="flush">
                  <ListGroup.Item className="bg-primary text-white">User-Friendly Interface: Intuitive design for easy navigation and efficient workflow</ListGroup.Item>
                  <ListGroup.Item className="bg-primary text-white">Real-Time Data Access: Access and update financial data in real-time from anywhere</ListGroup.Item>
                  <ListGroup.Item className="bg-primary text-white">Mobile Accessibility: Full functionality on mobile devices for on-the-go accounting</ListGroup.Item>
                  <ListGroup.Item className="bg-primary text-white">Customer Support: Dedicated customer support available to assist with any issues or queries.</ListGroup.Item>
                  <ListGroup.Item className="bg-primary text-white">Secure Data Storage: Advanced encryption and secure cloud storage to protect sensitive information.</ListGroup.Item>
                </ListGroup>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
