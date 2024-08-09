import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import "./css/HomePage.css"; // Import the CSS file for styling
import AppHeader from "../common/AppHeader";

const Home = () => {
  const { t } = useTranslation();

  const features = [
    {
      title: "Innovative Solutions",
      description:
        "Leverage cutting-edge technology to drive your business forward with our comprehensive suite of services. Our solutions are designed to meet the unique needs of your industry, helping you stay ahead of the competition.",
      imgSrc: "/images/innovation.png", // Ensure these images exist in your public directory
    },
    {
      title: "Tailored Services",
      description:
        "Experience personalized service with our custom solutions that fit your specific business requirements. From ERP systems to accounting software, we provide tools that are as unique as your business.",
      imgSrc: "/images/services.png",
    },
    {
      title: "Expert Support",
      description:
        "Our dedicated support team is here to assist you every step of the way. Whether you need troubleshooting, guidance, or advice, we're committed to ensuring your success and satisfaction.",
      imgSrc: "/images/support.png",
    },
  ];

  return (
    <div>
      <div><AppHeader/></div>
      <section className="hero">
        <Container>
          <Row className="align-items-center">
            <Col md={12} className="text-center">
              <div className="hero-content">
                <h2>{t("homeHeadermessage")}</h2>
                <p>
                  {t("At ")}
                  <strong style={{ fontSize: "1.2em", color: "#007bff" }}>
                    {t("companyName")}
                  </strong>
                  {t("homeIntro" )}
                </p>
                <Button variant="primary" href="/services">
                  {t("exploreServices")}
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="why-choose-us">
        <Container>
          <Row>
            <Col md={12} className="text-center">
              <h2>{t("whyChooseUs")}</h2>
              <p>
                {t("whyChooseMessage")}
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="features">
        <Container>
          <Row>
            {features.map((feature, index) => (
              <Col key={index} xs={12} sm={6} md={4} lg={4} className="mb-4">
                <Card className="feature-card">
                  <Card.Img variant="top" src={feature.imgSrc} />
                  <Card.Body>
                    <Card.Title>{t(feature.title)}</Card.Title>
                    <Card.Text>{t(feature.description)}</Card.Text>
                    <Button variant="primary" href="/learn-more">
                      {t("learnMore")}
                    </Button>
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

export default Home;
