import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useTranslation } from "react-i18next";
import { Table, Container, Row, Col, Card, Badge } from "react-bootstrap";
import Header from "../common/Header";
import { API_SERVICE } from "../common/CommonMethod";
import { toast } from "react-toastify";
import { LIST_MAHAL_BOOKING_LIST_API } from "../common/CommonApiURL";
import { FaCalendarAlt, FaUser, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import "./css/MahalBookingList.css"; // New custom CSS file

const MahalBookingList = () => {
  const { t } = useTranslation();
  const [bookings, setBookings] = useState([]);
  const [bookedDates, setBookedDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const response = await API_SERVICE.get(LIST_MAHAL_BOOKING_LIST_API, {
        id: null,
        mahalId: 0,
        fromDate: null,
        toDate: null,
        customerName: "",
        primary_phone: "",
      });

      if (response.data.result) {
        setBookings(response.data.data);
        setBookedDates(response.data.data.map(booking => new Date(booking.date)));
      } else {
        toast.error(response.data.message || t("bookingFetchError"));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t("apiError"));
      console.error("API call error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const isBooked = bookedDates.some(d => d.toDateString() === date.toDateString());
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = date.toDateString() === selectedDate.toDateString();

      return [
        isBooked ? 'booked-date' : 'available-date',
        isToday ? 'today' : '',
        isSelected ? 'selected-date' : ''
      ].join(' ');
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const filteredBookings = selectedDate 
    ? bookings.filter(booking => {
        const bookingDate = new Date(booking.date);
        return bookingDate.toDateString() === selectedDate.toDateString();
      })
    : bookings;

  return (
    <div className="mahal-booking-page">
      <Header
        titles={[t("mahalBookingList")]}
        links={[
          { to: "/dashboard", label: t("dashboard") },
          { to: "/mahal-booking", label: t("mahalBooking") },
        ]}
      />

      <Container fluid className="py-4">
        <Row className="g-4">
          {/* Calendar Section */}
          <Col lg={4}>
            <Card className="shadow-sm border-0 h-100">
              <Card.Header className="bg-white border-0 py-3">
                <h5 className="mb-0 d-flex align-items-center">
                  <FaCalendarAlt className="me-2 text-primary" />
                  {t("bookingCalendar")}
                </h5>
              </Card.Header>
              <Card.Body className="p-3">
                <Calendar
                  onChange={handleDateChange}
                  value={selectedDate}
                  tileClassName={tileClassName}
                  className="border-0"
                />
                <div className="mt-4">
                  <div className="d-flex align-items-center mb-2">
                    <div className="legend-dot booked-dot me-2"></div>
                    <small>{t("booked")}</small>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <div className="legend-dot available-dot me-2"></div>
                    <small>{t("available")}</small>
                  </div>
                  <div className="d-flex align-items-center">
                    <div className="legend-dot today-dot me-2"></div>
                    <small>{t("today")}</small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Bookings List Section */}
          <Col lg={8}>
            <Card className="shadow-sm border-0 h-100">
              <Card.Header className="bg-white border-0 py-3">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    {selectedDate 
                      ? t("bookingsFor") + " " + selectedDate.toLocaleDateString() 
                      : t("allBookings")}
                  </h5>
                  <Badge bg="light" text="dark" pill>
                    {filteredBookings.length} {t("bookings")}
                  </Badge>
                </div>
              </Card.Header>
              <Card.Body className="p-0">
                {isLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : filteredBookings.length > 0 ? (
                  <div className="table-responsive">
                    <Table hover className="mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th className="ps-4">
                            <FaUser className="me-2" />
                            {t("customerName")}
                          </th>
                          <th>
                            <FaPhone className="me-2" />
                            {t("mobile")}
                          </th>
                          <th>
                            <FaCalendarAlt className="me-2" />
                            {t("fromDate")}
                          </th>
                          <th>
                            <FaCalendarAlt className="me-2" />
                            {t("toDate")}
                          </th>
                          <th>
                            <FaMapMarkerAlt className="me-2" />
                            {t("venue")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBookings.map((booking) => (
                          <tr key={booking.id} className="align-middle">
                            <td className="ps-4 fw-medium">{booking.name}</td>
                            <td>
                              <a href={`tel:${booking.mobile}`} className="text-decoration-none">
                                {booking.mobile}
                              </a>
                            </td>
                            <td>{new Date(booking.fromDate).toLocaleDateString()}</td>
                            <td>{new Date(booking.toDate).toLocaleDateString()}</td>
                            <td>
                              <Badge bg="info" className="text-capitalize">
                                {booking.venue}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <h5 className="text-muted">{t("noBookingsFound")}</h5>
                    <p className="text-muted">{t("tryAnotherDate")}</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default MahalBookingList;