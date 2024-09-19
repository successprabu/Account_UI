import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "./css/Calendar.css"; // Import Calendar styles
import { useTranslation } from "react-i18next";
import { Table, Container, Row, Col } from "react-bootstrap"; // Use Bootstrap for layout
import Header from "../common/Header";
import { API_SERVICE } from "../common/CommonMethod";
import { toast } from "react-toastify";
import { LIST_MAHAL_BOOKING_LIST_API } from "../common/CommonApiURL";

const MahalBookingList = () => {
  const { t } = useTranslation();
  const [bookings, setBookings] = useState([]); // Store booking list
  const [bookedDates, setBookedDates] = useState([]); // Store booked dates

  const fetchBookings = async () => {
    try {
      const response = await API_SERVICE.get(LIST_MAHAL_BOOKING_LIST_API, {
        id: null,
        mahalId: 0,
        fromDate: null,
        toDate: null,
        customerName: "",
        primary_phone: ""
      });

      console.log("response:", response);

      if (response.data.result) {
        setBookings(response.data.data); // Set bookings from API response
        setBookedDates(response.data.data.map((booking) => new Date(booking.date))); // Set booked dates from API response
      } else {
        toast.error(
          response.data.message || "Something went wrong while fetching functions"
        );
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "API call error");
      console.error("API call error:", error);
    }
  };

  useEffect(() => {
    fetchBookings(); // Invoke the function inside useEffect
  }, []); // No dependencies, only runs once

  const tileClassName = ({ date }) => {
    if (bookedDates.find((d) => d.toDateString() === date.toDateString())) {
      return "booked"; // Custom CSS class for booked dates
    }
    return "available"; // Custom CSS class for available dates
  };

  return (
    <Container fluid>
      <Header
        titles={[t("mahalBookingList")]}
        links={[
          { to: "/dashboard", label: t("dashboard") },
          { to: "/mahal-booking", label: t("mahalBooking") },
        ]}
      />
      <Row>
        {/* Left Column: Calendar */}
        <Col md={3}>
          <h4>{t("selectDate")}</h4>
          <Calendar
            tileClassName={tileClassName} // Apply class based on booked/available status
          />
        </Col>

        {/* Vertical Divider */}
        <Col md={1} className="d-flex justify-content-center align-items-center">
          <div className="vertical-divider" />
        </Col>

        {/* Right Column: Booking List */}
        <Col md={8}>
        <h4>{t("mahalBookingList")}</h4>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>{t("customerName")}</th>
                <th>{t("mobile")}</th>
                <th>{t("functionDate")}</th>
                <th>{t("venue")}</th>
        
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.name}</td>
                  <td>{booking.mobile}</td>
                  <td>{new Date(booking.date).toLocaleDateString('en-GB')}</td>
                  <td>{booking.venue}</td>
          
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
};

export default MahalBookingList;
