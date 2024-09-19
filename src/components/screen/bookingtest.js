import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button, Col, FormGroup, FormLabel, Row } from "react-bootstrap";
import DatePicker from "react-datepicker";
import { toast } from "react-toastify";
import { API_SERVICE } from "../common/CommonMethod";
import { CHECK_MAHAL_AVAILABILITY_API, SAVE_MAHAL_BOOKING_API } from "../common/CommonApiURL"; // Assume you have an API for checking availability
import "react-datepicker/dist/react-datepicker.css";
import styled from "styled-components";

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
});

const MahalBooking = () => {
  const [isDateAvailable, setIsDateAvailable] = useState(null); // Track availability
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
      fromDate: null,
      toDate: null,
    },
  });

  const handleCheckAvailability = async (selectedDate) => {
    try {
      // Replace this with an actual API call to check availability
      const response = await API_SERVICE.get(`${CHECK_MAHAL_AVAILABILITY_API}?date=${selectedDate}`);
      const { available } = response.data;
      setIsDateAvailable(available);
      if (available) {
        toast.success("Mahal is available for booking.");
      } else {
        toast.error("Mahal is already booked on this date.");
      }
    } catch (error) {
      toast.error("Failed to check availability, please try again.");
    }
  };

  const handleFromDateChange = (date) => {
    setValue("fromDate", date);

    // Calculate the previous day for "From Date"
    const previousDay = new Date(date);
    previousDay.setDate(previousDay.getDate() - 1);

    // Set "To Date" as the selected date
    setValue("toDate", date);
  };

  const onSubmit = async (data) => {
    try {
      if (!isDateAvailable) {
        toast.error("Mahal is already booked. Please choose another date.");
        return;
      }
      await API_SERVICE.post(SAVE_MAHAL_BOOKING_API, data);
      toast.success("Booking saved successfully!");
    } catch (error) {
      toast.error("Failed to save booking, please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Row className="mb-3">
        <Col xs={12} md={4}>
          <FormGroup controlId="fromDate">
            <FormLabel>From Date <span className="text-danger">*</span></FormLabel>
            <Controller
              name="fromDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  selected={field.value}
                  onChange={(date) => {
                    handleFromDateChange(date);
                    handleCheckAvailability(date); // Check availability on date change
                  }}
                  minDate={new Date()}
                  dateFormat="dd/MM/yyyy"
                  className={`form-control ${errors.fromDate ? 'is-invalid' : ''}`}
                  placeholderText="Select From Date"
                />
              )}
            />
            <div className="invalid-feedback">{errors.fromDate?.message}</div>
          </FormGroup>
        </Col>
        <Col xs={12} md={4}>
          <FormGroup controlId="toDate">
            <FormLabel>To Date <span className="text-danger">*</span></FormLabel>
            <Controller
              name="toDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  selected={field.value}
                  onChange={(date) => setValue("toDate", date)}
                  minDate={watch("fromDate")}
                  dateFormat="dd/MM/yyyy"
                  className={`form-control ${errors.toDate ? 'is-invalid' : ''}`}
                  placeholderText="Select To Date"
                />
              )}
            />
            <div className="invalid-feedback">{errors.toDate?.message}</div>
          </FormGroup>
        </Col>
        <Col xs={12} md={4}>
          {isSubmitting ? (
            <Button disabled>
              Submitting...
            </Button>
          ) : (
            <Button type="submit">
              Submit Booking
            </Button>
          )}
        </Col>
      </Row>
    </form>
  );
};

export default MahalBooking;
