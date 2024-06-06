import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

import {
  Form,
  FormSelect,
  Button,
  Col,
  Row,
  FormLabel,
  FormGroup,
  FormControl,
  FormCheck,
  Card,
  CardHeader,
  CardBody,
} from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { SAVE_NEW_CUSTOMER_API } from "../common/CommonApiURL";

const Registration = () => {
  const [formData, setFormData] = useState({
    id: 0,
    name: "",
    primary_phone: "",
    secondary_phone: "",
    state: "",
    district: "",
    address_line1: " ",
    address_line2: " ",
    is_primary_phone_whatsup: false,
    is_secondary_phone_whatsup: false,
    otp: 0,
    password: "",
    pincode: 0,
    createdBy: "SYSTEM",
    createdDt: "2024-05-22T12:58:08.513Z",
    updateddBy: "",
    updatedDt: "2024-05-22T12:58:08.513Z",
    isActive: true,
    password:''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = {};

    if (!formData.name.trim()) {
      validationErrors.name = "Please Enter Your Name";
    }

    if (!formData.primary_phone.trim()) {
      validationErrors.primary_phone =
        "Please Enter valid 10 digit Mobile Number";
    } else if (!/^\d{10}$/.test(formData.primary_phone)) {
      validationErrors.primary_phone = "Mobile number must be 10 digits";
    }

    // if (!formData.email.trim()) {
    //   validationErrors.email = "Email is required";
    // } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    //   validationErrors.email = "Email is not valid";
    // }

    if (!formData.password.trim()) {
      validationErrors.password = "Password is required";
     } else if (formData.password.length < 6) {
      validationErrors.password = "Password should be at least 6 characters";
     }

     if (formData.conpassword !== formData.password) {
       validationErrors.conpassword = "Passwords do not match";
    }

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      try {
        console.log(SAVE_NEW_CUSTOMER_API, "url");
        const response = await axios.post(SAVE_NEW_CUSTOMER_API, formData);
        console.log(response.data.result,'cons')
        console.log(response,'res')
   if(response.data.result)
    {     
      toast.success("Registration successful!");   
      setFormData({});   
      navigate("/login");
    
    }
    else{
      toast.error("Something Went Wrong on Registration");
    }
        
      } catch (error) {
        toast.error("Something Went Wrong on Registration");
      }
    }
  };

  const navigate = useNavigate();

  return (
    <Card className="mt-1">
      <CardHeader>
        <h4 className="mb-0 text-primary">Registration</h4>
      </CardHeader>
      <CardBody>
        <Form className="text-primary w-100" onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col xs={12} md={4}>
              <FormGroup controlId="txtname">
                <FormLabel>
                  Name<span className="text-danger">*</span>
                </FormLabel>
                <FormControl
                  type="text"
                  placeholder="Please Enter Your Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
                {errors.name && (
                  <div className="text-danger">{errors.name}</div>
                )}
              </FormGroup>
            </Col>
            <Col xs={12} md={4}>
              <FormGroup controlId="primary_phone">
                <FormLabel>
                  Mobile Number<span className="text-danger">*</span>
                </FormLabel>
                <FormControl
                  type="text"
                  placeholder="Please Enter Your Mobile Number"
                  name="primary_phone"
                  value={formData.primary_phone}
                  onChange={handleChange}
                />
                {errors.primary_phone && (
                  <div className="text-danger">{errors.primary_phone}</div>
                )}
              </FormGroup>
            </Col>
            <Col xs={12} md={4} className="d-flex align-items-center">
              <FormGroup id="is_primary_phone_whatsup">
                <FormCheck
                  type="checkbox"
                  label="WhatsApp Yes/No"
                  name="is_primary_phone_whatsup"
                  checked={formData.is_primary_phone_whatsup}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      is_primary_phone_whatsup: e.target.checked,
                    })
                  }
                />
              </FormGroup>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col xs={12} md={4}>
              <FormGroup controlId="txtemail">
                <FormLabel>Email</FormLabel>
                <FormControl
                  type="text"
                  placeholder="Please Enter Your Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && (
                  <div className="text-danger">{errors.email}</div>
                )}
              </FormGroup>
            </Col>
            <Col xs={12} md={4}>
              <FormGroup controlId="mobile2">
                <FormLabel>Alternative Mobile Number</FormLabel>
                <FormControl
                  type="text"
                  placeholder="Please Enter Your Mobile Number"
                  name="secondary_phone"
                  value={formData.secondary_phone}
                  onChange={handleChange}
                />
                {errors.secondary_phone && (
                  <div className="text-danger">{errors.secondary_phone}</div>
                )}
              </FormGroup>
            </Col>
            <Col xs={12} md={4} className="d-flex align-items-center">
              <FormGroup id="is_secondary_phone_whatsup">
                <FormCheck
                  type="checkbox"
                  label="WhatsApp Yes/No"
                  name="is_secondary_phone_whatsup"
                  checked={formData.is_secondary_phone_whatsup}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      is_secondary_phone_whatsup: e.target.checked,
                    })
                  }
                />
              </FormGroup>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col xs={12} md={4}>
              <FormGroup controlId="txtotp">
                <FormLabel>
                  OTP <span className="text-danger">*</span>
                </FormLabel>
                <FormControl
                  type="text"
                  placeholder="Please Enter OTP Which was sent to Mobile/email"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                />
                {errors.otp && <div className="text-danger">{errors.otp}</div>}
              </FormGroup>
            </Col>
            <Col xs={12} md={4}>
              <FormGroup controlId="password">
                <FormLabel>
                  password <span className="text-danger">*</span>
                </FormLabel>
                <FormControl
                  type="password"
                  placeholder="Please Enter password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                />
                {errors.password && (
                  <div className="text-danger">{errors.password}</div>
                )}
              </FormGroup>
            </Col>
            <Col xs={12} md={4}>
              <FormGroup controlId="conpassword">
                <FormLabel>
                  Confirm Password <span className="text-danger">*</span>
                </FormLabel>
                <FormControl
                  type="password"
                  placeholder="Please Enter password"
                  name="conpassword"
                  value={formData.conpassword}
                  onChange={handleChange}
                />
                {errors.conpassword && (
                  <div className="text-danger">{errors.conpassword}</div>
                )}
              </FormGroup>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col xs={12} md={4}>
              <FormGroup controlId="address1">
                <FormLabel>Address Line 1</FormLabel>
                <FormControl
                  type="text"
                  placeholder="Please Enter Your Address"
                  name="address_line1"
                  value={formData.address_line1}
                  onChange={handleChange}
                />
                {errors.address_line1 && (
                  <div className="text-danger">{errors.address_line1}</div>
                )}
              </FormGroup>
            </Col>
            <Col xs={12} md={4}>
              <FormGroup controlId="address2">
                <FormLabel>Address Line 2</FormLabel>
                <FormControl
                  type="text"
                  placeholder="Please Enter Your Address"
                  name="address_line2"
                  value={formData.address_line2}
                  onChange={handleChange}
                />
                {errors.address_line2 && (
                  <div className="text-danger">{errors.address_line2}</div>
                )}
              </FormGroup>
            </Col>
            <Col xs={12} md={4}>
              <FormGroup controlId="country">
                <FormLabel>Country</FormLabel>
                <FormSelect
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                >
                  <option>Select Country</option>
                  <option value="1">India</option>
                  <option value="2">Singapore</option>
                  <option value="3">USA</option>
                </FormSelect>
                {errors.country && (
                  <div className="text-danger">{errors.country}</div>
                )}
              </FormGroup>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col xs={12} md={4}>
              <FormGroup controlId="drpstate">
                <FormLabel>State</FormLabel>
                <FormSelect
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                >
                  <option>Select State</option>
                  <option>Tamilnadu</option>
                  <option>Karnataka</option>
                  <option>Kerala</option>
                </FormSelect>
                {errors.state && (
                  <div className="text-danger">{errors.state}</div>
                )}
              </FormGroup>
            </Col>
            <Col xs={12} md={4}>
              <FormGroup controlId="txtcity">
                <FormLabel>City</FormLabel>
                <FormControl
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                />
                {errors.city && (
                  <div className="text-danger">{errors.city}</div>
                )}
              </FormGroup>
            </Col>
            <Col xs={12} md={4}>
              <FormGroup controlId="txtpin">
                <FormLabel>Pincode</FormLabel>
                <FormControl
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                />
                {errors.pincode && (
                  <div className="text-danger">{errors.pincode}</div>
                )}
              </FormGroup>
            </Col>
          </Row>

          <div className="d-flex justify-content-center">
            <Button variant="success" type="submit" className="me-3">
              Save
            </Button>
            <Button variant="danger" type="button">
              Cancel
            </Button>
          </div>
        </Form>
      </CardBody>
    </Card>
  );
};

export default Registration;
