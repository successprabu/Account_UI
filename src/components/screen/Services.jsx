import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FaUsers, FaMoneyCheckAlt, FaCog, FaAnchor } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import './css/ServicePage.css'; // Import the CSS file for styling
import AppHeader from '../common/AppHeader';

const ServicePage = () => {
  const { t } = useTranslation();

  const services = [
    {
      title: "schoolWebsiteERP",
      description: "Efficiently manage school operations with our comprehensive ERP solution. From student management to academic records, streamline your processes seamlessly.",
      icon: <FaUsers size={50} />,
      color: "#ffcccb",
      link: "/school-erp"
    },
    {
      title: "accountsSoftware",
      description: "Handle your finances effortlessly with our advanced accounting software. Track expenses, manage invoices, and generate reports with ease.",
      icon: <FaMoneyCheckAlt size={50} />,
      color: "#e6e6fa",
      link: "/purchase"
    },
    {
      title: "marineERP",
      description: "Optimize maritime operations with our Marine ERP solution. From fleet management to cargo tracking, manage your marine business effectively.",
      icon: <FaAnchor size={50} />,
      color: "#b0e0e6",
      link: "http://45.136.237.19:120/Home.html"
    }
  ];

  return (
    <div>
      <div>
        <AppHeader />
      </div>
      <section className="hero">
        <div className="hero-content">
          <h1>{t("ourServices")}</h1>
          <p>{t("discoverOurInnovativeSolutions")}</p>
        </div>
      </section>

      <section className="services">
        <Container>
          <Row>
            {services.map((service, index) => (
              <Col key={index} xs={12} sm={6} md={4} lg={4} className="mb-3">
                <Card className="service-card" style={{ backgroundColor: service.color }}>
                  <Card.Body>
                    <div className="icon">
                      {service.icon}
                    </div>
                    <Card.Title>{t(service.title)}</Card.Title>
                    <Card.Text>{t(service.description)}</Card.Text>
                    <Button variant="primary" href={service.link}>{t("learnMore")}</Button>
                  </Card.Body>
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
