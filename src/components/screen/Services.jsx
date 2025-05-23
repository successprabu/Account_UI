import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FaSchool, FaHandsHelping, FaCalendarAlt, FaAnchor } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import './css/ServicePage.css';

const ServicePage = () => {
  const { t } = useTranslation();

  const services = [
    {
      title: "moitech",
      description: "moitechDescription",
      icon: <FaHandsHelping />,
      color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      link: "purchase"
    },
    {
      title: "mahalManagement",
      description: "mahalDescription",
      icon: <FaCalendarAlt />,
      color: "linear-gradient(135deg, #2b5876 0%, #4e4376 100%)",
      link: "mahal-reg"
    },
    {
      title: "schoolWebsiteERP",
      description: "schoolDescription",
      icon: <FaSchool />,
      color: "linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)",
      link: "school-erp"
    },
    // {
    //   title: "marineERP",
    //   description: "Optimize maritime operations with our Marine ERP solution.",
    //   icon: <FaAnchor />,
    //   color: "linear-gradient(135deg, #00c6fb 0%, #005bea 100%)",
    //   link: "http://45.136.237.19:120/Home.html"
    // },
  ];

  return (
    <div className="service-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content text-center">
          <h1 className="hero-title">{t("ourServices")}</h1>
          <p className="hero-subtitle">{t("discoverOurInnovativeSolutions")}</p>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section py-5">
        <Container>
          <Row className="justify-content-center">
            {services.map((service, index) => (
              <Col key={index} xs={12} sm={6} lg={4} className="mb-4">
                <Card className="service-card h-100">
                  <div 
                    className="card-icon-container"
                    style={{ background: service.color }}
                  >
                    <div className="card-icon">
                      {service.icon}
                    </div>
                  </div>
                  <Card.Body className="text-center">
                    <Card.Title className="card-title">{t(service.title)}</Card.Title>
                    <Card.Text className="card-text">{t(service.description)}</Card.Text>
                  </Card.Body>
                  <div className="card-footer">
                    <Button 
                      variant="primary" 
                      href={service.link}
                      className="service-button"
                    >
                      {t("learnMore")}
                    </Button>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default ServicePage;