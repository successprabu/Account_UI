import React from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { FaCheck, FaRedo, FaCalendarAlt } from "react-icons/fa";
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
import InputWithMicrophone from "../common/InputWithMicrophone";
import Header from "../common/Header";
import { API_SERVICE } from "../common/CommonMethod";
import { SAVE_MAHAL_BOOKING_API } from "../common/CommonApiURL";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./css/MahalBooking.css"; // Ensure you import the CSS file

// Styled Components
const StyledCard = styled(Card)`
  margin: 20px;
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

const Separator = styled.hr`
  margin: 20px 0;
  border: 1px solid #ddd;
`;

// Validation Schema
const validationSchema = yup.object().shape({
  customerName: yup.string().required("Please enter customer name"),
  primary_phone: yup
    .string()
    .matches(/^\d{10}$/, "Mobile number must be 10 digits")
    .required("Please enter primary phone"),
  fromDate: yup.date().required("Please select start date"),
  toDate: yup.date().required("Please select end date"),
  totalAmount: yup
    .number()
    .min(0, "Total amount cannot be negative")
    .required("Please enter total amount"),
  discount: yup.number().min(0, "Discount cannot be negative"),
  advance: yup.number().min(0, "Advance cannot be negative"),
  balance: yup.number().min(0, "Balance cannot be negative"),
  isCancelled: yup.boolean(),
  cancelReason: yup.string().when("isCancelled", {
    is: true,
    then: yup.string().required("Please enter cancellation reason"),
  }),
  remarks: yup.string(),
});

const MahalBooking = () => {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      id:0,
      mahalId:0,
      customerName: "",
      primary_phone: "",
      fromDate: null,
      toDate: null,
      payMethod: "",
      totalAmount: 0,
      discount: 0,
      advance: 0,
      balance: 0,
      isCancelled: false,
      cancelReason: "",
      remarks: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      // Example API call
      await API_SERVICE.post(SAVE_MAHAL_BOOKING_API, data);
      toast.success(t("Data saved successfully!"));
    } catch (error) {
      toast.error(t("Failed to save data, please try again."));
    }
  };

  const handleCheckAvailability = () => {
    // Logic to check availability
    toast.info("Checking availability...");
  };

  const clearError = (fieldName) => {
    // Clear error message when the input field is focused
    setValue(fieldName, "", { shouldValidate: false });
  };

  const handleFromDateChange = (date) => {
    setValue("fromDate", date);

    // Calculate the next day
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    // Set "To Date" to next day
    setValue("toDate", nextDay);
  };

  return (
    
    <StyledCard>
       <Header
        titles={[t("mahalBooking")]}
        links={[
          { to: "/dashboard", label: t("dashboard") },
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
            <LoadingText>{t("Processing your request...")}</LoadingText>
          </LoadingContainer>
        ) : (
          <form
            className="text-primary w-100"
            onSubmit={handleSubmit(onSubmit)}
          >
         <Row className="mb-3">
  <Col xs={12} md={4}>
    <FormGroup controlId="fromDate">
      <FormLabel>{t("fromDate")}<span className="text-danger">*</span></FormLabel>
      <Controller
        name="fromDate"
        control={control}
        render={({ field }) => (
          <DatePicker
            selected={field.value}
            onChange={handleFromDateChange} // Updated handler
            minDate={new Date()}
            showTimeSelect
            timeIntervals={15}
            dateFormat="dd/MM/yyyy hh:mm aa"
            className={`form-control ${errors.fromDate ? 'is-invalid' : ''}`}
            placeholderText={t("Select From Date & Time")}
          />
        )}
      />
      <div className="invalid-feedback">{errors.fromDate?.message}</div>
    </FormGroup>
  </Col>
  <Col xs={12} md={4}>
    <FormGroup controlId="toDate">
      <FormLabel>{t("toDate")}<span className="text-danger">*</span></FormLabel>
      <Controller
        name="toDate"
        control={control}
        render={({ field }) => (
          <DatePicker
            selected={field.value}
            onChange={(date) => setValue("toDate", date)}
            minDate={watch("fromDate") ? new Date(watch("fromDate")).setDate(new Date(watch("fromDate")).getDate()) : new Date()}
            showTimeSelect
            timeIntervals={15}
            dateFormat="dd/MM/yyyy hh:mm aa"
            className={`form-control ${errors.toDate ? 'is-invalid' : ''}`}
            placeholderText={t("Select To Date & Time")}
          />
        )}
      />
      <div className="invalid-feedback">{errors.toDate?.message}</div>
    </FormGroup>
  </Col>
  <Col xs={12} md={4}>
    <Button variant="outline-primary" onClick={handleCheckAvailability}>
      {t("checkAval")}
    </Button>
  </Col>
</Row>
            <Separator />
            <Row className="mb-3">
              <Col xs={12} md={4}>
                <FormGroup controlId="customerName">
                  <FormLabel>
                    {t("customerName")}
                    <span className="text-danger">*</span>
                  </FormLabel>
                  <Controller
                    name="customerName"
                    control={control}
                    render={({ field }) => (
                      <InputWithMicrophone
                        {...field}
                        placeholder={t("enterCustomerName")}
                       // error={errors.customerName?.message}
                        onFocus={() => clearError("customerName")}
                      />
                    )}
                  />
                  <div className="invalid-feedback">
                    {errors.customerName?.message}
                  </div>
                </FormGroup>
              </Col>
              <Col xs={12} md={4}>
                <FormGroup controlId="primary_phone">
                  <FormLabel>
                    {t("customerContactNum")}
                    <span className="text-danger">*</span>
                  </FormLabel>
                  <Controller
                    name="primary_phone"
                    control={control}
                    render={({ field }) => (
                      <InputWithMicrophone
                        {...field}
                        type="number"
                        placeholder={t("enterContactNum")}
                       // error={errors.primary_phone?.message}
                        onFocus={() => clearError("primary_phone")}
                      />
                    )}
                  />
                  <div className="invalid-feedback">
                    {errors.primary_phone?.message}
                  </div>
                </FormGroup>
              </Col>
              <Col xs={12} md={4}>
                <FormGroup controlId="payMethod">
                  <FormLabel>{t("payMethod")}</FormLabel>
                  <Controller
                    name="payMethod"
                    control={control}
                    render={({ field }) => (
                      <InputWithMicrophone
                        {...field}
                        placeholder={t("enterpayMethod")}
                        error={errors.payMethod?.message}
                        onFocus={() => clearError("payMethod")}
                      />
                    )}
                  />
                  <div className="invalid-feedback">
                    {errors.payMethod?.message}
                  </div>
                </FormGroup>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col xs={12} md={4}>
                <FormGroup controlId="totalAmount">
                  <FormLabel>
                    {t("totalAmount")}
                    <span className="text-danger">*</span>
                  </FormLabel>
                  <Controller
                    name="totalAmount"
                    control={control}
                    render={({ field }) => (
                      <InputWithMicrophone
                        {...field}
                        type="number"
                        placeholder={t("enterTotalAmt")}
                        error={errors.totalAmount?.message}
                        onFocus={() => clearError("totalAmount")}
                      />
                    )}
                  />
                  <div className="invalid-feedback">
                    {errors.totalAmount?.message}
                  </div>
                </FormGroup>
              </Col>
              <Col xs={12} md={4}>
                <FormGroup controlId="discount">
                  <FormLabel>{t("discount")}</FormLabel>
                  <Controller
                    name="discount"
                    control={control}
                    render={({ field }) => (
                      <InputWithMicrophone
                        {...field}
                        type="number"
                        placeholder={t("enterDiscount")}
                        error={errors.discount?.message}
                        onFocus={() => clearError("discount")}
                      />
                    )}
                  />
                  <div className="invalid-feedback">
                    {errors.discount?.message}
                  </div>
                </FormGroup>
              </Col>
              <Col xs={12} md={4}>
                <FormGroup controlId="advance">
                  <FormLabel>{t("advance")}</FormLabel>
                  <Controller
                    name="advance"
                    control={control}
                    render={({ field }) => (
                      <InputWithMicrophone
                        {...field}
                        type="number"
                        placeholder={t("Enter Advance")}
                        error={errors.advance?.message}
                        onFocus={() => clearError("advance")}
                      />
                    )}
                  />
                  <div className="invalid-feedback">
                    {errors.advance?.message}
                  </div>
                </FormGroup>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col xs={12} md={4}>
                <FormGroup controlId="balance">
                  <FormLabel>{t("balance")}</FormLabel>
                  <Controller
                    name="balance"
                    control={control}
                    render={({ field }) => (
                      <InputWithMicrophone
                        {...field}
                        type="number"
                        placeholder={t("Enter Balance")}
                        error={errors.balance?.message}
                        onFocus={() => clearError("balance")}
                      />
                    )}
                  />
                  <div className="invalid-feedback">
                    {errors.balance?.message}
                  </div>
                </FormGroup>
              </Col>
              <Col xs={12} md={4}>
                <FormGroup controlId="rcdAmount">
                  <FormLabel>{t("rcdAmount")}</FormLabel>
                  <Controller
                    name="rcdAmount"
                    control={control}
                    render={({ field }) => (
                      <InputWithMicrophone
                        {...field}
                        type="number"
                        placeholder={t("enterRcdAmt")}
                        error={errors.rcdAmount?.message}
                        onFocus={() => clearError("rcdAmount")}
                      />
                    )}
                  />
                  <div className="invalid-feedback">
                    {errors.rcdAmount?.message}
                  </div>
                </FormGroup>
              </Col>
              <Col xs={12}  md={4}>
                <FormGroup controlId="remarks">
                  <FormLabel>{t("remarks")}</FormLabel>
                  <Controller
                    name="remarks"
                    control={control}
                    render={({ field }) => (
                      <InputWithMicrophone
                        {...field}
                        placeholder={t("enter_remarks")}
                        error={errors.remarks?.message}
                        onFocus={() => clearError("remarks")}
                      />
                    )}
                  />
                  <div className="invalid-feedback">
                    {errors.remarks?.message}
                  </div>
                </FormGroup>
              </Col>
              </Row>
              <Row className="mb-3">
              <Col xs={12} md={4}>
                <FormGroup controlId="isCancelled">
                  <Controller
                    name="isCancelled"
                    control={control}
                    render={({ field }) => (
                      <div className="form-check">
                        <input
                          type="checkbox"
                          {...field}
                          className={`form-check-input ${
                            errors.isCancelled ? "is-invalid" : ""
                          }`}
                        />
                        <FormLabel className="form-check-label">
                          {t("isCancelled")}
                        </FormLabel>
                      </div>
                    )}
                  />
                  <div className="invalid-feedback">
                    {errors.isCancelled?.message}
                  </div>
                </FormGroup>
              </Col>
              <Col xs={12} md={8} >
                <FormGroup controlId="cancelReason">
                  <FormLabel>{t("canceReason")}</FormLabel>
                  <Controller
                    name="cancelReason"
                    control={control}
                    render={({ field }) => (
                      <InputWithMicrophone
                        {...field}
                        placeholder={t("enterCanceReason")}
                        disabled={!watch("isCancelled")}
                        error={errors.cancelReason?.message}
                        onFocus={() => clearError("cancelReason")}
                      />
                    )}
                  />
                  <div className="invalid-feedback">
                    {errors.cancelReason?.message}
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

export default MahalBooking;
