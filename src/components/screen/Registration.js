import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Form,
  FormGroup,
  FormControl,
  FormLabel,
  Button,
  Card,
  CardHeader,
  CardBody,
  Col,
  Row,
  FormCheck,
  FormSelect
} from "react-bootstrap";
import i18n from "../../language/i18n";

const Registration = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    primary_phone: "",
    secondary_phone: "",
    is_primary_phone_whatsup: false,
    is_secondary_phone_whatsup: false,
    otp: "",
    password: "",
    conpassword: "",
    address_line1: "",
    address_line2: "",
    country: "",
    state: "",
    city: "",
    pincode: ""
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked,
    });
  };

  const handleLanguageChange = (e) => {
    const language = e.target.value;
    i18n.changeLanguage(language);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // form validation and submission logic
  };

  return (
    <Card className="mt-1">
      <CardHeader>
        <h4 className="mb-0 text-primary">{t('registration')}</h4>
      </CardHeader>
      <CardBody>
        <Form className="text-primary w-100" onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col xs={12} md={4}>
              <FormGroup controlId="txtname">
                <FormLabel>
                  {t('name')}<span className="text-danger">*</span>
                </FormLabel>
                <FormControl
                  type="text"
                  placeholder={t('enter_name')}
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  inputMode="numeric"
                />
                {errors.name && <div className="text-danger">{errors.name}</div>}
              </FormGroup>
            </Col>
            <Col xs={12} md={4}>
              <FormGroup controlId="primary_phone">
                <FormLabel>
                  {t('primary_phone')}<span className="text-danger">*</span>
                </FormLabel>
                <FormControl
                  type="text"
                  placeholder={t('enter_primary_phone')}
                  name="primary_phone"
                  value={formData.primary_phone}
                  onChange={handleChange}
                />
                {errors.primary_phone && <div className="text-danger">{errors.primary_phone}</div>}
              </FormGroup>
            </Col>
            <Col xs={12} md={4} className="d-flex align-items-center">
              <FormGroup id="is_primary_phone_whatsup">
                <FormCheck
                  type="checkbox"
                  label={t('is_primary_phone_whatsup')}
                  name="is_primary_phone_whatsup"
                  checked={formData.is_primary_phone_whatsup}
                  onChange={handleCheckboxChange}
                />
              </FormGroup>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col xs={12} md={4}>
              <FormGroup controlId="secondary_phone">
                <FormLabel>
                  {t('secondary_phone')}
                </FormLabel>
                <FormControl
                  type="text"
                  placeholder={t('enter_secondary_phone')}
                  name="secondary_phone"
                  value={formData.secondary_phone}
                  onChange={handleChange}
                />
                {errors.secondary_phone && <div className="text-danger">{errors.secondary_phone}</div>}
              </FormGroup>
            </Col>
            <Col xs={12} md={4} className="d-flex align-items-center">
              <FormGroup id="is_secondary_phone_whatsup">
                <FormCheck
                  type="checkbox"
                  label={t('is_secondary_phone_whatsup')}
                  name="is_secondary_phone_whatsup"
                  checked={formData.is_secondary_phone_whatsup}
                  onChange={handleCheckboxChange}
                />
              </FormGroup>
            </Col>
            <Col xs={12} md={4}>
              <FormGroup controlId="txtotp">
                <FormLabel>
                  {t('otp')} <span className="text-danger">*</span>
                </FormLabel>
                <FormControl
                  type="text"
                  placeholder={t('enter_otp')}
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                />
                {errors.otp && <div className="text-danger">{errors.otp}</div>}
              </FormGroup>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col xs={12} md={4}>
              <FormGroup controlId="password">
                <FormLabel>
                  {t('password')} <span className="text-danger">*</span>
                </FormLabel>
                <FormControl
                  type="password"
                  placeholder={t('enter_password')}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                />
                {errors.password && <div className="text-danger">{errors.password}</div>}
              </FormGroup>
            </Col>
            <Col xs={12} md={4}>
              <FormGroup controlId="conpassword">
                <FormLabel>
                  {t('conpassword')} <span className="text-danger">*</span>
                </FormLabel>
                <FormControl
                  type="password"
                  placeholder={t('enter_conpassword')}
                  name="conpassword"
                  value={formData.conpassword}
                  onChange={handleChange}
                />
                {errors.conpassword && <div className="text-danger">{errors.conpassword}</div>}
              </FormGroup>
            </Col>
            <Col xs={12} md={4}>
              <FormGroup controlId="address1">
                <FormLabel>
                  {t('address_line1')}
                </FormLabel>
                <FormControl
                  type="text"
                  placeholder={t('enter_address_line1')}
                  name="address_line1"
                  value={formData.address_line1}
                  onChange={handleChange}
                />
                {errors.address_line1 && <div className="text-danger">{errors.address_line1}</div>}
              </FormGroup>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col xs={12} md={4}>
              <FormGroup controlId="address2">
                <FormLabel>
                  {t('address_line2')}
                </FormLabel>
                <FormControl
                  type="text"
                  placeholder={t('enter_address_line2')}
                  name="address_line2"
                  value={formData.address_line2}
                  onChange={handleChange}
                />
                {errors.address_line2 && <div className="text-danger">{errors.address_line2}</div>}
              </FormGroup>
            </Col>
            <Col xs={12} md={4}>
              <FormGroup controlId="country">
                <FormLabel>
                  {t('country')}
                </FormLabel>
                <FormSelect
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                >
                  <option value="">{t('select_country')}</option>
                  <option value="1">{t('india')}</option>
                  <option value="2">{t('singapore')}</option>
                  <option value="3">{t('usa')}</option>
                </FormSelect>
                {errors.country && <div className="text-danger">{errors.country}</div>}
              </FormGroup>
            </Col>
            <Col xs={12} md={4}>
              <FormGroup controlId="state">
                <FormLabel>
                  {t('state')}
                </FormLabel>
                <FormSelect
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                >
                  <option value="">{t('select_state')}</option>
                  <option>{t('tamil_nadu')}</option>
                  <option>{t('karnataka')}</option>
                  <option>{t('kerala')}</option>
                </FormSelect>
                {errors.state && <div className="text-danger">{errors.state}</div>}
              </FormGroup>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col xs={12} md={4}>
              <FormGroup controlId="city">
                <FormLabel>
                  {t('city')}
                </FormLabel>
                <FormControl
                  type="text"
                  placeholder={t('enter_city')}
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                />
                {errors.city && <div className="text-danger">{errors.city}</div>}
              </FormGroup>
            </Col>
            <Col xs={12} md={4}>
              <FormGroup controlId="pincode">
                <FormLabel>
                  {t('pincode')}
                </FormLabel>
                <FormControl
                  type="text"
                  placeholder={t('enter_pincode')}
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                />
                {errors.pincode && <div className="text-danger">{errors.pincode}</div>}
              </FormGroup>
            </Col>
          </Row>

          <div className="d-flex justify-content-end">
            <Button variant="success" type="submit" className="me-3">
              {t('save')}
            </Button>
            <Button variant="danger" type="button">
              {t('cancel')}
            </Button>
          </div>
        </Form>
      </CardBody>
    </Card>
  );
};

export default Registration;
