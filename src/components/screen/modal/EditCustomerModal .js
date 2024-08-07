import React, { useState, useEffect, useRef } from "react";
import { Form, Button, Col, Row, InputGroup, FormControl, FormLabel, FormGroup, FormCheck, Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { Oval } from 'react-loader-spinner';
import { LIST_CLIENT_API, UPDATE_CUSTOMER_API } from "../../common/CommonApiURL";
import { API_SERVICE } from "../../common/CommonMethod";

const EditCustomerModal = ({ show, onHide, customerId, onSave }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    id: 0,
    name: "",
    primary_phone: "",
    secondary_phone: "",
    country: "",
    state: "",
    district: "",
    address_line1: "",
    address_line2: "",
    is_primary_phone_whatsup: false,
    is_secondary_phone_whatsup: false,
    pincode: 0,
    createdBy: "",
    createdDt: "",
    updatedBy: "",
    updatedDt: "",
    isActive: true,
    password: "",
    userType: "",
    customerId: 0,
    activated_from: "",
    activated_To: "",
    current_plan_id: 0,
    previous_plan_id: 0,
    country_code: ""
  });
  const [errors, setErrors] = useState({});
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (customerId) {
      API_SERVICE.get(LIST_CLIENT_API, {
        id: customerId,
        customer_name: "",
        mobile: "",
        isactive: null,
        current_page: 1,
        page_size: 10})
        .then(response => {
          const customer = response.data.data.customers[0];
          setFormData({
            id: customer.id,
            name: customer.name,
            primary_phone: customer.primary_phone,
            secondary_phone: customer.secondary_phone || "",
            country: customer.country,
            state: customer.state,
            district: customer.district,
            address_line1: customer.address_line1,
            address_line2: customer.address_line2 || "",
            is_primary_phone_whatsup: customer.is_primary_phone_whatsup,
            is_secondary_phone_whatsup: customer.is_secondary_phone_whatsup,
            pincode: customer.pincode,
            createdBy: customer.createdBy,
            createdDt: customer.createdDt,
            updatedBy: customer.updatedBy,
            updatedDt: customer.updatedDt,
            isActive: customer.isActive,
            password: customer.password,
            userType: customer.userType,
            customerId: customer.customerId,
            activated_from: customer.activated_from,
            activated_To: customer.activated_To,
            current_plan_id: customer.current_plan_id,
            previous_plan_id: customer.previous_plan_id,
            country_code: customer.country_code
          });
        })
        .catch(error => {
          toast.error("Error fetching customer details");
        });
    }
  }, [customerId]);

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

  const handleActiveChange = (e) => {
    const { value } = e.target;
    setFormData({
      ...formData,
      isActive: value === "Yes",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = {};
  
    if (!formData.name.trim()) {
      validationErrors.name = "Please Enter Your Name";
    }
  
    if (!formData.primary_phone.trim()) {
      validationErrors.primary_phone = "Please Enter valid 10 digit Mobile Number";
    } else if (!/^\d{10}$/.test(formData.primary_phone)) {
      validationErrors.primary_phone = "Mobile number must be 10 digits";
    }
  
    setErrors(validationErrors);
  
    if (Object.keys(validationErrors).length === 0) {
      setIsLoading(true);
      try {
        const payload = {
          ...formData,
          id: Number(formData.id),
          pincode: Number(formData.pincode),
          current_plan_id: Number(formData.current_plan_id),
          previous_plan_id: Number(formData.previous_plan_id),
          customerId: Number(formData.customerId),
          isActive: formData.isActive ? 1 : 0
        };
        API_SERVICE.post(UPDATE_CUSTOMER_API, payload)
        toast.success("Customer details updated successfully!");
        onSave();
        onHide();
      } catch (error) {
        console.error("Error updating customer details:", error.response || error.message);
        toast.error("Error updating customer details");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{t("editCustomer")}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {isLoading ? (
          <div className="text-center">
            <Oval
              height={80}
              width={80}
              color="#4fa94d"
              visible={true}
              ariaLabel="oval-loading"
              secondaryColor="#4fa94d"
              strokeWidth={2}
              strokeWidthSecondary={2}
            />
          </div>
        ) : (
          <Form onSubmit={handleSubmit}>
            <Row className="mb-4">
              <Col xs={12} md={6}>
                <FormGroup controlId="name">
                  <FormLabel>
                    {t('name')}<span className="text-danger">*</span>
                  </FormLabel>
                  <FormControl
                    type="text"
                    placeholder={t('enter_name')}
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    isInvalid={!!errors.name}
                  />
                  <FormControl.Feedback type="invalid">
                    {errors.name}
                  </FormControl.Feedback>
                </FormGroup>
              </Col>
              <Col xs={12} md={6}>
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
                    isInvalid={!!errors.primary_phone}
                  />
                  <FormControl.Feedback type="invalid">
                    {errors.primary_phone}
                  </FormControl.Feedback>
                </FormGroup>
              </Col>
            </Row>

            <Row className="mb-4">
              <Col xs={12} md={6}>
                <FormGroup controlId="secondary_phone">
                  <FormLabel>{t('secondary_phone')}</FormLabel>
                  <FormControl
                    type="text"
                    placeholder={t('enter_secondary_phone')}
                    name="secondary_phone"
                    value={formData.secondary_phone}
                    onChange={handleChange}
                  />
                </FormGroup>
              </Col>
              <Col xs={12} md={6}>
                <FormGroup controlId="country">
                  <FormLabel>{t('country')}</FormLabel>
                  <FormControl
                    type="text"
                    placeholder={t('enter_country')}
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                  />
                </FormGroup>
              </Col>
            </Row>

            <Row className="mb-4">
              <Col xs={12} md={4}>
                <FormGroup controlId="state">
                  <FormLabel>{t('state')}</FormLabel>
                  <FormControl
                    type="text"
                    placeholder={t('enter_state')}
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                  />
                </FormGroup>
              </Col>
              <Col xs={12} md={4}>
                <FormGroup controlId="district">
                  <FormLabel>{t('district')}</FormLabel>
                  <FormControl
                    type="text"
                    placeholder={t('enter_district')}
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                  />
                </FormGroup>
              </Col>
              <Col xs={12} md={4}>
                <FormGroup controlId="pincode">
                  <FormLabel>{t('pincode')}</FormLabel>
                  <FormControl
                    type="number"
                    placeholder={t('enter_pincode')}
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                  />
                </FormGroup>
              </Col>
            </Row>

            <Row className="mb-4">
              <Col xs={12} md={6}>
                <FormGroup controlId="address_line1">
                  <FormLabel>{t('address_line1')}</FormLabel>
                  <InputGroup>
                    <FormControl
                      type="text"
                      placeholder={t('enter_address_line1')}
                      name="address_line1"
                      value={formData.address_line1}
                      onChange={handleChange}
                    />
                  </InputGroup>
                  <FormControl.Feedback type="invalid">
                    {errors.address_line1}
                  </FormControl.Feedback>
                </FormGroup>
              </Col>
                <Col xs={12} md={6}>
                <FormGroup controlId="address_line2">
                  <FormLabel>{t('address_line2')}</FormLabel>
                  <FormControl
                    type="text"
                    placeholder={t('enter_address_line2')}
                    name="address_line2"
                    value={formData.address_line2}
                    onChange={handleChange}
                  />
                </FormGroup>
              </Col>
            </Row>

            <Row className="mb-4">
              <Col xs={12} md={4}>
                <FormGroup controlId="is_primary_phone_whatsup">
                  <FormCheck
                    type="checkbox"
                    label={t('is_primary_phone_whatsup')}
                    name="is_primary_phone_whatsup"
                    checked={formData.is_primary_phone_whatsup}
                    onChange={handleCheckboxChange}
                  />
                </FormGroup>
              </Col>
              <Col xs={12} md={4}>
                <FormGroup controlId="is_secondary_phone_whatsup">
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
                <FormGroup controlId="isActive">
                  <FormLabel>{t('active')}</FormLabel>
                  <FormControl
                    as="select"
                    name="isActive"
                    value={formData.isActive ? t('yes') : t('no')}
                    onChange={handleActiveChange}
                  >
                     <option value="Yes">{t('yes')}</option>
                      <option value="No">{t('no')}</option>
                  </FormControl>
                </FormGroup>
              </Col>
            </Row>

            <div className="text-end">
              <Button type="submit" variant="primary" className="me-3">
                {t('save')}
              </Button>
              <Button type="button" variant="secondary" onClick={onHide}>
                {t('cancel')}
              </Button>
            </div>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default EditCustomerModal;
