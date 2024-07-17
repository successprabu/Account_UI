import React from 'react';
import { Carousel, Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './css/Home.css';  // Import custom CSS for additional styling

const Home = () => {
  return (
    <Container fluid className="p-4">
      <Row className="justify-content-center mb-4">
        <Col xs={12} md={12}>
          <Carousel>
            <Carousel.Item>
              <img
                className="d-block w-100 carousel-img"
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
                className="d-block w-100 carousel-img"
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
                className="d-block w-100 carousel-img"
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
      <Row className="justify-content-center">
        <Col xs={12} md={6} lg={4}>
          <Card className="mb-4 text-center card-hover bg-primary text-white">
            <Card.Body as={Link} to="/feature1">
              <Card.Title>User-Friendly Interface</Card.Title>
              <Card.Text>Intuitive design for easy navigation and efficient workflow.</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={6} lg={4}>
          <Card className="mb-4 text-center card-hover bg-primary text-white">
            <Card.Body as={Link} to="/feature2">
              <Card.Title>Real-Time Data Access</Card.Title>
              <Card.Text>Access and update financial data in real-time from anywhere.</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={6} lg={4}>
          <Card className="mb-4 text-center card-hover bg-primary text-white">
            <Card.Body as={Link} to="/feature3">
              <Card.Title>Mobile Accessibility</Card.Title>
              <Card.Text>Full functionality on mobile devices for on-the-go accounting.</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={6} lg={4}>
          <Card className="mb-4 text-center card-hover bg-primary text-white">
            <Card.Body as={Link} to="/feature4">
              <Card.Title>Customer Support</Card.Title>
              <Card.Text>Dedicated customer support available to assist with any issues or queries.</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={6} lg={4}>
          <Card className="mb-4 text-center card-hover bg-primary text-white">
            <Card.Body as={Link} to="/feature5">
              <Card.Title>Secure Data Storage</Card.Title>
              <Card.Text>Advanced encryption and secure cloud storage to protect sensitive information.</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
