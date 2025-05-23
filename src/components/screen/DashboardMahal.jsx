import React from "react";
import { Line } from "react-chartjs-2";
import { Card, Container, Row, Col } from "react-bootstrap";
import {
  FaCalendar,
  FaRupeeSign,
  FaBell,
  FaUserCog,
  FaPlusSquare,
  FaChartLine,
} from "react-icons/fa";
import { MdEventSeat } from "react-icons/md";
import "bootstrap/dist/css/bootstrap.min.css";
import "./css/Dashboard.css";

// Import Chart.js components and register them
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";

// Register the necessary components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const DashboardMahal = () => {
  const chartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Bookings",
        data: [10, 30, 20, 50, 40, 70],
        borderColor: "#6C63FF",
        backgroundColor: "rgba(108, 99, 255, 0.2)",
        borderWidth: 3,
        tension: 0.3,
        fill: true,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#6C63FF",
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            size: 14,
            family: "'Inter', sans-serif"
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: "circle"
        }
      },
      tooltip: {
        backgroundColor: "#2D3748",
        titleFont: {
          size: 16,
          weight: "bold"
        },
        bodyFont: {
          size: 14
        },
        padding: 12,
        usePointStyle: true,
        callbacks: {
          label: function(context) {
            return ` ${context.dataset.label}: ${context.raw}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)"
        },
        ticks: {
          font: {
            size: 12
          },
          stepSize: 10
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12
          }
        }
      }
    },
    maintainAspectRatio: false
  };

  return (
    <Container fluid className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard Overview</h1>
        <p className="dashboard-subtitle">Welcome back! Here's what's happening with your venue.</p>
      </div>

      {/* Overview Cards */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-4">
          <Card className="stat-card booking-card">
            <Card.Body>
              <div className="card-icon">
                <MdEventSeat size={28} />
              </div>
              <div className="card-content">
                <Card.Title>Bookings</Card.Title>
                <Card.Text>125</Card.Text>
                <div className="card-trend positive">
                  <FaChartLine size={14} />
                  <span>12% from last month</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} className="mb-4">
          <Card className="stat-card revenue-card">
            <Card.Body>
              <div className="card-icon">
                <FaRupeeSign size={28} />
              </div>
              <div className="card-content">
                <Card.Title>Revenue</Card.Title>
                <Card.Text>₹2,50,000</Card.Text>
                <div className="card-trend positive">
                  <FaChartLine size={14} />
                  <span>18% from last month</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} className="mb-4">
          <Card className="stat-card slots-card">
            <Card.Body>
              <div className="card-icon">
                <FaCalendar size={28} />
              </div>
              <div className="card-content">
                <Card.Title>Available Slots</Card.Title>
                <Card.Text>8</Card.Text>
                <div className="card-trend negative">
                  <FaChartLine size={14} />
                  <span>5% from last month</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} className="mb-4">
          <Card className="stat-card pending-card">
            <Card.Body>
              <div className="card-icon">
                <FaBell size={28} />
              </div>
              <div className="card-content">
                <Card.Title>Pending</Card.Title>
                <Card.Text>3</Card.Text>
                <div className="card-trend">
                  <FaChartLine size={14} />
                  <span>Same as last month</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Line Chart */}
      <Card className="mb-4 chart-card">
        <Card.Body>
          <Card.Title className="chart-title">
            <FaChartLine className="me-2" />
            Booking Trends
          </Card.Title>
          <div className="chart-container">
            <Line data={chartData} options={chartOptions} />
          </div>
        </Card.Body>
      </Card>

      {/* Quick Actions */}
      <Card className="mb-4">
        <Card.Body>
          <Card.Title className="section-title">Quick Actions</Card.Title>
          <Row className="action-row">
            <Col lg={4} md={6} className="mb-3">
              <button className="action-button add-booking">
                <div className="action-icon">
                  <FaPlusSquare size={24} />
                </div>
                <span>Add Booking</span>
              </button>
            </Col>
            <Col lg={4} md={6} className="mb-3">
              <button className="action-button view-calendar">
                <div className="action-icon">
                  <FaCalendar size={24} />
                </div>
                <span>View Calendar</span>
              </button>
            </Col>
            <Col lg={4} md={6} className="mb-3">
              <button className="action-button manage-services">
                <div className="action-icon">
                  <FaUserCog size={24} />
                </div>
                <span>Manage Services</span>
              </button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default DashboardMahal;