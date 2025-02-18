import React from "react";
import { Line } from "react-chartjs-2";
import { Card } from "react-bootstrap";
import {
  FaCalendar,
  FaRupeeSign,
  FaBell,
  FaUserCog,
  FaPlusSquare,
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
} from "chart.js";

// Register the necessary components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const DashboardMahal = () => {
  const chartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Bookings",
        data: [10, 30, 20, 50, 40, 70],
        borderColor: "rgba(0, 123, 255, 1)",
        backgroundColor: "rgba(0, 123, 255, 0.2)",
      },
    ],
  };

  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="container">
      {/* Overview Cards */}
      <div className="card-row">
        <Card className="custom-card">
          <MdEventSeat size={40} color="#4CAF50" />
          <h3 className="card-title">Bookings</h3>
          <p className="card-value">125</p>
        </Card>
        <Card className="custom-card">
          <FaRupeeSign size={40} color="#FF9800" />
          <h3 className="card-title">Revenue</h3>
          <p className="card-value">₹2,50,000</p>
        </Card>
      </div>

      <div className="card-row">
        <Card className="custom-card">
          <FaCalendar size={40} color="#2196F3" />
          <h3 className="card-title">Available Slots</h3>
          <p className="card-value">8</p>
        </Card>
        <Card className="custom-card">
          <FaBell size={40} color="#E91E63" />
          <h3 className="card-title">Pending</h3>
          <p className="card-value">3</p>
        </Card>
      </div>

      {/* Line Chart */}
      <h2 className="chart-title">Booking Trends</h2>
      <Line data={chartData} options={chartOptions} />

      {/* Quick Actions */}
      <h2 className="section-title">Quick Actions</h2>
      <div className="action-row">
        <button className="action-button">
          <FaPlusSquare size={30} color="#4CAF50" />
          <span>Add Booking</span>
        </button>
        <button className="action-button">
          <FaCalendar size={30} color="#FF9800" />
          <span>View Calendar</span>
        </button>
        <button className="action-button">
          <FaUserCog size={30} color="#2196F3" />
          <span>Manage Services</span>
        </button>
      </div>
    </div>
  );
};

export default DashboardMahal;
