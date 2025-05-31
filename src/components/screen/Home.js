import React from "react";
import { Container, Row, Col, Card, Button, Carousel } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import AppHeader from "../common/AppHeader";
import "./css/HomePage.css";
import { FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { FaLightbulb, FaHandsHelping, FaHeadset } from "react-icons/fa";
import { Link } from "react-router-dom";

const Home = () => {
  const { t } = useTranslation();

  const features = [
    {
      title: "Innovative Solutions",
      description: "Leverage cutting-edge technology to drive your business forward with our comprehensive suite of services.",
      icon: <FaLightbulb className="feature-icon" />,
      color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    {
      title: "Tailored Services",
      description: "Experience personalized service with custom solutions that fit your specific business requirements.",
      icon: <FaHandsHelping className="feature-icon" />,
      color: "linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)"
    },
    {
      title: "Expert Support",
      description: "Our dedicated support team is here to assist you every step of the way.",
      icon: <FaHeadset className="feature-icon" />,
      color: "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)"
    }
  ];

  const testimonials = [
    {
      quote: "This software transformed our business operations completely. Highly recommended!",
      author: "Sarah Johnson, CEO at TechCorp"
    },
    {
      quote: "The best decision we made was choosing this platform. Exceptional service!",
      author: "Michael Chen, Director at FinServe"
    },
    {
      quote: "Reliable, intuitive, and packed with features. Exactly what we needed.",
      author: "Emma Williams, Manager at RetailPlus"
    }
  ];

  const benefits = [
    "24/7 Customer Support",
    "99.9% Uptime Guarantee",
    "Enterprise-grade Security",
    "Regular Feature Updates",
    "Custom Integration Options"
  ];

  return (
    <div className="home-page">
      <AppHeader />
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <Container>
          <Row className="align-items-center min-vh-80 py-5">
            <Col lg={6} className="hero-content">
              <h1 className="hero-title">
                {t("homeHeadermessage")}
                <span className="highlight">{t("companyName")}</span>
              </h1>
              <p className="hero-subtitle">
                {t("homeIntro")}
              </p>
              <div className="hero-cta">
              <Link to="/services">
                <Button variant="primary" className="cta-button me-3">
                  {t("exploreServices")} <FiArrowRight />
                </Button>
                </Link>

                <Link to="/services">
                <Button variant="outline-light" className="cta-button">
                  {t("watchDemo")}
                </Button>
                </Link>
              </div>
            </Col>
            <Col lg={6} className="hero-image-col">
              <div className="hero-image-container">
                <div className="hero-image"></div>
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* //Clients Logo Section
      <section className="clients-section py-4">
        <Container>
          <Row className="justify-content-center">
            <Col xs={12} className="text-center mb-4">
              <p className="trusted-by">Trusted by industry leaders</p>
            </Col>
            {[1, 2, 3, 4, 5].map((item) => (
              <Col xs={4} md={2} key={item} className="client-logo-container">
                <div className={`client-logo client-${item}`}></div>
              </Col>
            ))}
          </Row>
        </Container>
      </section> */}

      {/* Features Section */}
      <section className="features-section py-5">
        <Container>
          <Row className="justify-content-center mb-5">
            <Col lg={8} className="text-center">
              <h2 className="section-title">{t("whyChooseUs")}</h2>
              <p className="section-subtitle">{t("whyChooseMessage")}</p>
            </Col>
          </Row>
          <Row>
            {features.map((feature, index) => (
              <Col key={index} lg={4} md={6} className="mb-4">
                <Card className="feature-card h-100">
                  <div 
                    className="feature-icon-container"
                    style={{ background: feature.color }}
                  >
                    {feature.icon}
                  </div>
                  <Card.Body>
                    <h3 className="feature-title">{feature.title}</h3>
                    <p className="feature-text">{feature.description}</p>
                    <Button variant="link" className="feature-link">
                     {t("learnMore")} <FiArrowRight />
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section py-5">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-4 mb-lg-0">
              <div className="benefits-image"></div>
            </Col>
            <Col lg={6}>
              <h2 className="section-title">Why Our Solution Stands Out</h2>
              <ul className="benefits-list">
                {benefits.map((benefit, index) => (
                  <li key={index} className="benefit-item">
                    <FiCheckCircle className="benefit-icon" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              <Button variant="primary" className="mt-3">
                See All Features
              </Button>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section py-5">
        <Container>
          <Row className="justify-content-center mb-5">
            <Col lg={8} className="text-center">
              <h2 className="section-title">What Our Clients Say</h2>
              <p className="section-subtitle">Hear from businesses that transformed their operations with our solution</p>
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <Carousel indicators={false} interval={5000}>
                {testimonials.map((testimonial, index) => (
                  <Carousel.Item key={index}>
                    <div className="testimonial-card">
                      <div className="testimonial-content">
                        <p className="testimonial-quote">"{testimonial.quote}"</p>
                        <p className="testimonial-author">— {testimonial.author}</p>
                      </div>
                    </div>
                  </Carousel.Item>
                ))}
              </Carousel>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="cta-section py-5">
        <div className="cta-overlay"></div>
        <Container>
          <Row className="justify-content-center">
            <Col lg={8} className="text-center">
              <h2 className="cta-title">Ready to Transform Your Business?</h2>
              <p className="cta-text">Join thousands of satisfied customers who trust our solution</p>
              <div className="cta-buttons">
              <Link to="/purchase">
                <Button variant="primary" size="lg" className="me-3">
                {t("getStarted")} 
                </Button>
                </Link>
                <Link to="/contactus">
             
                <Button variant="outline-light" size="lg">
                {t("contactSales")} 
                </Button>
                </Link>
         
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Home;