import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { FaCheck, FaRedo } from "react-icons/fa";
import {
  Button,
  Card,
  CardBody,
  Col,
  Row,
  FormGroup,
  FormLabel,
} from "react-bootstrap";
import styled from "styled-components";
import { Oval } from "react-loader-spinner";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import InputWithMicrophone from "../../common/InputWithMicrophone";
import Header from "../../common/Header";
import { API_SERVICE } from "../../common/CommonMethod";
import "react-datepicker/dist/react-datepicker.css";
import "./css/mahal.css";
import { SAVE_NEW_MAHAL_API } from "../../common/CommonApiURL";
import StateDropdown from "../../common/StateDropDown";
import DistrictDropDown from "../../common/DistrictDropDown";
import CountryDropdown from "../../common/CountryDropDown";

const StyledCard = styled(Card)`
  margin: 0px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const StyledButton = styled(Button)`
  margin-right: 8px;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const LoadingText = styled.p`
  margin-top: 10px;
  font-size: 16px;
`;

// Validation Schema
const validationSchema = yup.object().shape({
  mahalName: yup.string().required("Please Enter Mahal name"),
  addressLine1: yup.string().required("Please Enter Mahal Address"),
  contactPerson: yup
    .string()
    .required("Please enter the contact person's name"),
  contactNumber: yup
    .number()
    .typeError("Contact number must be a number")
    .test(
      "len",
      "Contact number must be exactly 10 digits",
      (val) => val && val.toString().length === 10
    )
    .required("Please enter a contact number"),
  pincode: yup
    .number()
    .typeError("Pincode must be a number")
    .integer("Pincode must be an integer")
    .positive("Pincode must be positive")
    .test(
      "len",
      "Pincode must be exactly 6 digits",
      (val) => val && val.toString().length === 6
    )
    .required("Pincode is required"),
  country: yup
    .number()
    .moreThan(0, "Please select a Country")
    .required("Country is required"),
  state: yup
    .number()
    .moreThan(0, "Please select a State")
    .required("State is required"),
  district: yup
    .number()
    .moreThan(0, "Please select a District")
    .required("District is required"),
});

const NewMahal = () => {
  const [selectedState, setSelectedState] = useState();
  const [selectedDistrict, setSelectedDistrict] = useState();
  const [selectedCountry, setSelectedCountry] = useState();
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      id: 0,
      customerId: 7,
      mahalName: "",
      contactPerson: "",
      contactNumber: "",
      country: 0,
      state: 0,
      district: 0,
      addressLine1: "",
      addressLine2: "",
      landmark: "",
      pincode: 0,
      isOnlineBooking: false,
      createdBy: "Admin",
      createdDt: "2025-02-18T08:53:08.488Z",
      updatedBy: "Admin",
      updatedDt: "2025-02-18T08:53:08.488Z",
      isActive: true,
    },
  });

  const onSubmit = async (data) => {
    try {
      const response = await API_SERVICE.post(SAVE_NEW_MAHAL_API, data);

      if (response && response.data) {
        toast.success(t("saveSuccessMessage"));
        reset(); // Clear form on success
      } else {
        toast.error(t("an_error_occurred"));
      }
    } catch (error) {
      toast.error(t("an_error_occurred"));
    }
  };

  const clearError = (fieldName) => {
    // Clear error message when the input field is focused
    setValue(fieldName, "", { shouldValidate: false });
  };

  return (
    <StyledCard>
      <Header
        titles={[t("addMahal")]}
        links={[
          { to: "/dashboard", label: t("dashboard") },
          { to: "/mahal-booking", label: t("mahalBooking") },
          { to: "/mahal-booking-list", label: t("mahalBookingList") },
        ]}
      />
      <CardBody>
        {isSubmitting ? (
          <LoadingContainer>
            <Oval
              height={80}
              width={80}
              color="#4fa94d"
              visible={true}
              ariaLabel="oval-loading"
            />
            <LoadingText>{t("processing_your_request")}</LoadingText>
          </LoadingContainer>
        ) : (
          <form
            className="text-primary w-100"
            onSubmit={handleSubmit(onSubmit)}
          >
            <Row className="mb-3">
              <Col xs={12} md={4}>
                <FormGroup controlId="mahalName">
                  <FormLabel>
                    {t("mahalName")}
                    <span className="text-danger">*</span>
                  </FormLabel>
                  <Controller
                    name="mahalName"
                    control={control}
                    render={({ field }) => (
                      <InputWithMicrophone
                        {...field}
                        placeholder={t("enter_mahal_name")}
                        onFocus={() => clearError("mahalName")}
                      />
                    )}
                  />
                  <div className="invalid-feedback">
                    {errors.mahalName?.message}
                  </div>
                </FormGroup>
              </Col>
              <Col xs={12} md={4}>
                <FormGroup controlId="contactPerson">
                  <FormLabel>
                    {t("contactPerson")}
                    <span className="text-danger">*</span>
                  </FormLabel>
                  <Controller
                    name="contactPerson"
                    control={control}
                    render={({ field }) => (
                      <InputWithMicrophone
                        {...field}
                        placeholder={t("enterContactPerson")}
                        error={errors.contactPerson?.message}
                        onFocus={() => clearError("contactPerson")}
                      />
                    )}
                  />
                  <div className="invalid-feedback">
                    {errors.contactPerson?.message}
                  </div>
                </FormGroup>
              </Col>
              <Col xs={12} md={4}>
                <FormGroup controlId="contactNumber">
                  <FormLabel>
                    {t("contactNumber")}
                    <span className="text-danger">*</span>
                  </FormLabel>
                  <Controller
                    name="contactNumber"
                    control={control}
                    render={({ field }) => (
                      <InputWithMicrophone
                        {...field}
                        placeholder={t("enterContactNumber")}
                        error={errors.contactNumber?.message}
                        onFocus={() => clearError("contactNumber")}
                      />
                    )}
                  />
                  <div className="invalid-feedback">
                    {errors.contactNumber?.message}
                  </div>
                </FormGroup>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col xs={12} md={4}>
                <FormGroup controlId="country">
                  <div className="m2 text-primary">
                    <label htmlFor="country">{t("country")}</label>
                    <span className="text-danger">*</span>
                    <div className="input-group">
                      <Controller
                        name="country"
                        control={control}
                        render={({ field }) => (
                          <CountryDropdown
                            onChange={(value) => {
                              field.onChange(value); // Update form state
                              setSelectedCountry(value); // Update local state
                            }}
                            value={field.value} // Bind the selected value
                          />
                        )}
                      />
                    </div>
                  </div>
                  <div className="invalid-feedback">
                    {errors.country?.message}
                  </div>
                </FormGroup>
              </Col>

              <Col xs={12} md={4}>
                <FormGroup controlId="state">
                  <div className="m2 text-primary">
                    <label htmlFor="state">{t("state")}</label>
                    <span className="text-danger">*</span>
                    <div className="input-group">
                      <Controller
                        name="state"
                        control={control}
                        render={({ field }) => (
                          <StateDropdown
                            countryId={selectedCountry}
                            onChange={(value) => {
                              field.onChange(value);
                              setSelectedState(value);
                            }}
                            value={field.value}
                          />
                        )}
                      />
                    </div>
                  </div>
                  <div className="invalid-feedback">
                    {errors.state?.message}
                  </div>
                </FormGroup>
              </Col>
              <Col xs={12} md={4}>
                <FormGroup controlId="district">
                  <div className="m2 text-primary">
                    <label htmlFor="district">{t("district")}</label>
                    <span className="text-danger">*</span>
                    <div className="input-group">
                      <Controller
                        name="district"
                        control={control}
                        render={({ field }) => (
                          <DistrictDropDown
                            stateId={selectedState}
                            onChange={(value) => {
                              field.onChange(value);
                              setSelectedDistrict(value);
                            }}
                            value={field.value}
                          />
                        )}
                      />
                    </div>
                  </div>
                  <div className="invalid-feedback">
                    {errors.district?.message}
                  </div>
                </FormGroup>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col xs={12} md={4}>
                <FormGroup controlId="addressLine1">
                  <FormLabel>{t("address_line1")}</FormLabel>
                  <span className="text-danger">*</span>
                  <Controller
                    name="addressLine1"
                    control={control}
                    render={({ field }) => (
                      <InputWithMicrophone
                        {...field}
                        placeholder={t("enter_address_line1")}
                        error={errors.address_line1?.message}
                        onFocus={() => clearError("addressLine1")}
                      />
                    )}
                  />
                  <div className="invalid-feedback">
                    {errors.addressLine1?.message}
                  </div>
                </FormGroup>
              </Col>
              <Col xs={12} md={4}>
                <FormGroup controlId="address_line2">
                  <FormLabel>{t("address_line2")}</FormLabel>
                  <Controller
                    name="address_line2"
                    control={control}
                    render={({ field }) => (
                      <InputWithMicrophone
                        {...field}
                        placeholder={t("enter_address_line2")}
                        error={errors.rcdAmount?.message}
                        onFocus={() => clearError("address_line2")}
                      />
                    )}
                  />
                  <div className="invalid-feedback">
                    {errors.address_line2?.message}
                  </div>
                </FormGroup>
              </Col>
              <Col xs={12} md={4}>
                <FormGroup controlId="landmark">
                  <FormLabel>{t("landmark")}</FormLabel>
                  <Controller
                    name="landmark"
                    control={control}
                    render={({ field }) => (
                      <InputWithMicrophone
                        {...field}
                        placeholder={t("enterLandmark")}
                        error={errors.landmark?.message}
                        onFocus={() => clearError("remarks")}
                      />
                    )}
                  />
                  <div className="invalid-feedback">
                    {errors.landmark?.message}
                  </div>
                </FormGroup>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col xs={12} md={4}>
                <FormGroup controlId="pincode">
                  <FormLabel>{t("pincode")}</FormLabel>
                  <span className="text-danger">*</span>
                  <Controller
                    name="pincode"
                    control={control}
                    render={({ field }) => (
                      <InputWithMicrophone
                        {...field}
                        placeholder={t("enter_pincode")}
                        error={errors.cancelReason?.message}
                        onFocus={() => clearError("pincode")}
                      />
                    )}
                  />
                  <div className="invalid-feedback">
                    {errors.pincode?.message}
                  </div>
                </FormGroup>
              </Col>
              <Col xs={12} md={4}>
                <FormGroup controlId="onlineBooking">
                  <Controller
                    name="onlineBooking"
                    control={control}
                    render={({ field }) => (
                      <div className="form-check">
                        <input
                          type="checkbox"
                          {...field}
                          checked={field.value}
                          className={`form-check-input ${
                            errors.isCancelled ? "is-invalid" : ""
                          }`}
                        />
                        <FormLabel className="form-check-label">
                          {t("onlineBooking")}
                        </FormLabel>
                      </div>
                    )}
                  />
                  <div className="invalid-feedback">
                    {errors.isCancelled?.message}
                  </div>
                </FormGroup>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col xs={12}>
                <div className="d-flex justify-content-end">
                  <StyledButton
                    variant="primary"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Oval
                          height={20}
                          width={20}
                          color="#fff"
                          visible={true}
                          ariaLabel="oval-loading"
                        />
                        <span className="ms-2">{t("Submitting...")}</span>
                      </>
                    ) : (
                      <>
                        <FaCheck /> {t("save")}
                      </>
                    )}
                  </StyledButton>
                  <StyledButton variant="secondary" onClick={() => reset()}>
                    <FaRedo /> {t("clearButton")}
                  </StyledButton>
                </div>
              </Col>
            </Row>
          </form>
        )}
      </CardBody>
    </StyledCard>
  );
};

export default NewMahal;
