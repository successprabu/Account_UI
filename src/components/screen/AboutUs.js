import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import "./css/AboutPage.css";
import AppHeader from "../common/AppHeader";

const AboutUs = () => {
  const { t } = useTranslation();

  return (
    <div className="about-page">
      <AppHeader />
      
      {/* Hero Section */}
      <section className="about-hero">
        <div className="hero-overlay"></div>
        <Container>
          <Row className="justify-content-center">
            <Col lg={10} className="text-center">
              <h1 className="hero-title">{t("About MySuccess.Com")}</h1>
              <p className="hero-subtitle">
                {t("Innovative solutions for your business success")}
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Mission Section */}
      <section className="section-mission py-5">
        <Container>
          <Row className="justify-content-center">
            <Col lg={8} className="text-center">
              <div className="section-header">
                <h2 className="section-title">{t("Our Mission")}</h2>
                <div className="divider"></div>
              </div>
              <p className="section-text">
                {t(
                  "At MySuccess.Com, we are dedicated to transforming businesses with innovative and tailored solutions. Our mission is to empower organizations by providing cutting-edge technology and exceptional service that drives success and fosters growth."
                )}
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Who We Are Section */}
      <section className="section-who py-5 bg-light">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-4 mb-lg-0">
              <div className="section-header">
                <h2 className="section-title">{t("Who We Are")}</h2>
                <div className="divider"></div>
              </div>
              <p className="section-text">
                {t(
                  "MySuccess.Com is a team of passionate professionals committed to delivering excellence. With years of experience in technology solutions, we offer a comprehensive suite of services designed to meet the unique needs of our clients. Our expertise spans various domains, ensuring that we provide solutions that are not only effective but also aligned with industry standards."
                )}
              </p>
            </Col>
            <Col lg={6}>
              <div className="about-image">
                <div className="image-overlay"></div>
                <img 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
                  alt="Our Team" 
                  className="img-fluid rounded"
                />
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Values Section */}
      <section className="section-values py-5">
        <Container>
          <Row className="justify-content-center">
            <Col lg={8} className="text-center">
              <div className="section-header">
                <h2 className="section-title">{t("Our Values")}</h2>
                <div className="divider"></div>
              </div>
            </Col>
          </Row>
          <Row className="mt-5">
            <Col md={6} lg={3} className="mb-4">
              <Card className="value-card h-100">
                <Card.Body className="text-center">
                  <div className="value-icon innovation"></div>
                  <Card.Title className="value-title">{t("Innovation")}</Card.Title>
                  <Card.Text>
                    {t(
                      "We are at the forefront of technology, constantly evolving to provide the most advanced solutions."
                    )}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={3} className="mb-4">
              <Card className="value-card h-100">
                <Card.Body className="text-center">
                  <div className="value-icon customer"></div>
                  <Card.Title className="value-title">{t("Customer-Centricity")}</Card.Title>
                  <Card.Text>
                    {t(
                      "Our clients are at the heart of everything we do. We strive to understand their needs and exceed their expectations."
                    )}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={3} className="mb-4">
              <Card className="value-card h-100">
                <Card.Body className="text-center">
                  <div className="value-icon integrity"></div>
                  <Card.Title className="value-title">{t("Integrity")}</Card.Title>
                  <Card.Text>
                    {t(
                      "We conduct our business with the highest level of honesty and transparency."
                    )}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={3} className="mb-4">
              <Card className="value-card h-100">
                <Card.Body className="text-center">
                  <div className="value-icon excellence"></div>
                  <Card.Title className="value-title">{t("Excellence")}</Card.Title>
                  <Card.Text>
                    {t(
                      "We are committed to delivering high-quality solutions and services that drive results."
                    )}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Journey Section */}
      <section className="section-journey py-5 bg-light">
        <Container>
          <Row className="justify-content-center">
            <Col lg={8} className="text-center">
              <div className="section-header">
                <h2 className="section-title">{t("Our Journey")}</h2>
                <div className="divider"></div>
              </div>
              <p className="section-text">
                {t(
                  "Founded in 2020, MySuccess.Com has grown from a small startup into a leading provider of technology solutions. Our journey is marked by milestones that reflect our commitment to innovation and client satisfaction."
                )}
              </p>
              <div className="timeline mt-5">
                <div className="timeline-item">
                  <div className="timeline-year">2020</div>
                  <div className="timeline-content">
                    <h4>{t("Company Founded")}</h4>
                    <p>{t("Started with a small team of passionate developers")}</p>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-year">2021</div>
                  <div className="timeline-content">
                    <h4>{t("First Major Client")}</h4>
                    <p>{t("Secured our first enterprise-level client")}</p>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-year">2023</div>
                  <div className="timeline-content">
                    <h4>{t("Product Suite Expansion")}</h4>
                    <p>{t("Launched three new products in our portfolio")}</p>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Contact Section */}
      <section className="section-contact py-5">
        <Container>
          <Row className="justify-content-center">
            <Col lg={8} className="text-center">
              <div className="section-header">
                <h2 className="section-title">{t("Get in Touch")}</h2>
                <div className="divider"></div>
              </div>
              <p className="section-text mb-5">
                {t(
                  "We would love to hear from you. Whether you have a question, need support, or are interested in working with us, feel free to reach out."
                )}
              </p>
            </Col>
          </Row>
          <Row className="justify-content-center">
            <Col md={4} className="mb-4 mb-md-0">
              <Card className="contact-card h-100">
                <Card.Body className="text-center">
                  <div className="contact-icon email"></div>
                  <Card.Title className="contact-title">{t("Email")}</Card.Title>
                  <Card.Text>successprabumca@gmail.com</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="contact-card h-100">
                <Card.Body className="text-center">
                  <div className="contact-icon phone"></div>
                  <Card.Title className="contact-title">{t("Phone")}</Card.Title>
                  <Card.Text>+91 8050386769</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default AboutUs;