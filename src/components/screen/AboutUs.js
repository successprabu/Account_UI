import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import './css/AboutPage.css'; // Import the CSS file for styling

const AboutUs = () => {
  const { t } = useTranslation();

  return (
    <div>
      <section className="about-us">
        <Container>
          <Row className="text-center">
            <Col md={12}>
              <h1>{t("Our Mission")}</h1>
              <p>{t("At [Your Company Name], we are dedicated to transforming businesses with innovative and tailored solutions. Our mission is to empower organizations by providing cutting-edge technology and exceptional service that drives success and fosters growth.")}</p>
            </Col>
          </Row>

          <Row className="mt-4">
            <Col md={12}>
              <h2>{t("Who We Are")}</h2>
              <p>{t("[Your Company Name] is a team of passionate professionals committed to delivering excellence. With years of experience in [your industry], we offer a comprehensive suite of services designed to meet the unique needs of our clients. Our expertise spans various domains, ensuring that we provide solutions that are not only effective but also aligned with industry standards.")}</p>
            </Col>
          </Row>

          <Row className="mt-4">
            <Col md={12}>
              <h2>{t("Our Values")}</h2>
              <ul>
                <li><strong>{t("Innovation")}</strong>: {t("We are at the forefront of technology, constantly evolving to provide the most advanced solutions.")}</li>
                <li><strong>{t("Customer-Centricity")}</strong>: {t("Our clients are at the heart of everything we do. We strive to understand their needs and exceed their expectations.")}</li>
                <li><strong>{t("Integrity")}</strong>: {t("We conduct our business with the highest level of honesty and transparency.")}</li>
                <li><strong>{t("Excellence")}</strong>: {t("We are committed to delivering high-quality solutions and services that drive results.")}</li>
              </ul>
            </Col>
          </Row>

          <Row className="mt-4">
            <Col md={12}>
              <h2>{t("Our Team")}</h2>
              <Row>
                {/* Example team members */}
                <Col md={4}>
                  <Card>
                    <Card.Body>
                      <Card.Title>{t("[Team Member Name]")}</Card.Title>
                      <Card.Subtitle>{t("[Position]")}</Card.Subtitle>
                      <Card.Text>{t("[Brief bio highlighting their experience and expertise]")}</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                {/* Repeat for other team members */}
              </Row>
            </Col>
          </Row>

          <Row className="mt-4">
            <Col md={12}>
              <h2>{t("Our Journey")}</h2>
              <p>{t("Founded in [Year], [Your Company Name] has grown from a small startup into a leading provider of [your services]. Our journey is marked by milestones that reflect our commitment to innovation and client satisfaction. Explore our timeline to see how we have evolved over the years.")}</p>
            </Col>
          </Row>

          <Row className="mt-4">
            <Col md={12}>
              <h2>{t("Client Success Stories")}</h2>
              {/* Example client success stories */}
              <p>{t("[Client Name]: [Brief description of the project and the impact]")}</p>
              <p>{t("[Client Name]: [Brief description of the project and the impact]")}</p>
            </Col>
          </Row>

          <Row className="mt-4">
            <Col md={12} className="text-center">
              <h2>{t("Get in Touch")}</h2>
              <p>{t("We would love to hear from you. Whether you have a question, need support, or are interested in working with us, feel free to reach out.")}</p>
              <p><strong>{t("Email")}: </strong>[Your Email Address]</p>
              <p><strong>{t("Phone")}: </strong>[Your Phone Number]</p>
              <p><strong>{t("Address")}: </strong>[Your Address]</p>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default AboutUs;
