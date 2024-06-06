import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';

const PageNotFound = () => {
  return (
    <Container className="text-center mt-5">
      <Row>
        <Col>
          <h1 className="display-4">404</h1>
          <p className="lead">Page Not Found</p>
          <Button as={Link} to="/" variant="primary">Go to Home</Button>
        </Col>
      </Row>
    </Container>
  );
};

export default PageNotFound;
