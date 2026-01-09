import React, { useState, useEffect } from "react";
import { Modal, Card, Row, Col, Badge, ProgressBar, Dropdown, Button } from "react-bootstrap";
import {
  FaMoneyBillWave,
  FaClipboardCheck,
  FaMapMarkerAlt,
  FaWallet,
  FaChartBar,
  FaChartArea,
  FaChartPie,
  FaFilter,
  FaDownload,
  FaSync,
  FaArrowUp,
  FaArrowDown,
  FaUsers,
  FaRegCalendarAlt,
  FaRegClock
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../common/Header";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";
import { DASHBOARD_SUMMARY_API, DASHBOARD_DETAIL_API } from "../common/CommonApiURL";
import { API_SERVICE } from "../common/CommonMethod";
import Unauthorized from "../common/UnauthorizedAccess";
import './css/DashboardAdmin.css';

const DashboardAdmin = () => {
  const [showClientListModal, setShowClientListModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [dashboardData, setDashboardData] = useState({});
  const [dashboardDetail, setDashboardDetail] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('week');
  const [activeMetric, setActiveMetric] = useState('transactions');
  const navigate = useNavigate();
  const { t } = useTranslation();

  const userDetail = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userDetail || userDetail.customerID === 0) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        const [summaryResponse, detailResponse] = await Promise.all([
          API_SERVICE.get(DASHBOARD_SUMMARY_API, {
            customer_id: userDetail.customerID,
            function_id: userDetail.functionId,
            user_type: userDetail.userType,
            userId: userDetail.id,
          }),
          API_SERVICE.get(DASHBOARD_DETAIL_API, {
            customer_id: userDetail.customerID,
            function_id: userDetail.functionId,
            user_type: userDetail.userType,
            userId: userDetail.id,
          }),
        ]);

        if (summaryResponse.data.result && detailResponse.data.result) {
          setDashboardData(summaryResponse.data.data);
          
          // Format data with growth indicators
          const formattedData = detailResponse.data.data.map((item, index) => ({
            ...item,
            growth: index % 3 === 0 ? 12.5 : index % 3 === 1 ? -3.2 : 7.8,
            efficiency: 65 + (index * 5)
          }));
          setDashboardDetail(formattedData);
        } else {
          setError("Failed to fetch dashboard data");
        }
      } catch (err) {
        setError("An error occurred: " + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const COLORSFORRECORDS = ["#6366F1", "#8B5CF6", "#EC4899", "#10B981", "#F59E0B"];
  const COLORSFORAMOUNT = ["#3B82F6", "#06B6D4", "#14B8A6", "#84CC16", "#F59E0B"];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  if (isLoading) return (
    <div className="dashboard-loading">
      <div className="loading-container">
        <div className="spinner-modern">
          <div className="spinner-dot"></div>
          <div className="spinner-dot"></div>
          <div className="spinner-dot"></div>
        </div>
        <h4 className="mt-4">{t("loadingDashboard")}</h4>
        <p className="text-muted">{t("preparingYourData")}</p>
      </div>
    </div>
  );
  
  if (!isAuthenticated) return <Unauthorized />;
  if (error) return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="dashboard-error"
    >
      <div className="error-card">
        <div className="error-icon">⚠️</div>
        <h4>{t("errorLoadingDashboard")}</h4>
        <p>{error}</p>
        <Button variant="primary" onClick={() => window.location.reload()}>
          <FaSync className="me-2" />
          {t("retry")}
        </Button>
      </div>
    </motion.div>
  );

  const metricCards = [
    {
      titleKey: "dashbordTotalAmount",
      total: formatCurrency(dashboardData.totalRcdAmount || 0),
      subtitle: t("totalRevenue"),
      icon: <FaMoneyBillWave />,
      color: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
      trend: 12.5,
      timeFrame: t("thisMonth"),
      handleClick: () => setShowClientListModal(true),
    },
    {
      titleKey: "dashbordTotalTrans",
      total: dashboardData.totalRcdTransaction?.toLocaleString() || "0",
      subtitle: t("totalTransactions"),
      icon: <FaClipboardCheck />,
      color: "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
      trend: 7.8,
      timeFrame: t("last30Days"),
    },
    {
      titleKey: "dashbordTotalPlaces",
      total: dashboardData.totalPlaces?.toLocaleString() || "0",
      subtitle: t("activeLocations"),
      icon: <FaMapMarkerAlt />,
      color: "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)",
      trend: 3.2,
      timeFrame: t("current"),
    },
    {
      titleKey: "dashbordTotalExpenase",
      total: formatCurrency(dashboardData.totalExpenses || 0),
      subtitle: t("totalExpenditure"),
      icon: <FaWallet />,
      color: "linear-gradient(135deg, #EF4444 0%, #F87171 100%)",
      trend: -2.4,
      timeFrame: t("thisMonth"),
    },
  ];

  const activityData = [
    { time: "09:30 AM", activity: t("newClientRegistered"), type: "success" },
    { time: "11:15 AM", activity: t("transactionProcessed"), type: "info" },
    { time: "02:45 PM", activity: t("paymentReceived"), type: "success" },
    { time: "04:20 PM", activity: t("systemMaintenance"), type: "warning" },
    { time: "06:00 PM", activity: t("dailyReportGenerated"), type: "info" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="dashboard-modern"
    >
      <Header
        titles={[t("dashboard")]}
        links={[{ to: "/purchase", label: t("addClient") }]}
      />

      
      <div className="container-fluid dashboard-content">
        {/* Summary Cards Grid */}
        <Row className="g-4 mb-4">
          <AnimatePresence>
            {metricCards.map((card, index) => (
              <Col key={index} xs={12} sm={6} xl={3}>
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="metric-card"
                  onClick={card.handleClick || undefined}
                  style={{ cursor: card.handleClick ? 'pointer' : 'default' }}
                >
                  <div className="metric-card-bg" style={{ background: card.color }}></div>
                  <div className="metric-card-content">
                    <div className="metric-header">
                      <div className="metric-icon">
                        {card.icon}
                      </div>
                      <div className="metric-trend">
                        {card.trend > 0 ? (
                          <Badge bg="success" className="trend-badge">
                            <FaArrowUp className="me-1" />
                            {card.trend}%
                          </Badge>
                        ) : (
                          <Badge bg="danger" className="trend-badge">
                            <FaArrowDown className="me-1" />
                            {Math.abs(card.trend)}%
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="metric-body">
                      <h3 className="metric-value">{card.total}</h3>
                      <p className="metric-title">{t(card.titleKey)}</p>
                    </div>
                    {/* <div className="metric-footer">
                      <span className="metric-subtitle">{card.subtitle}</span>
                      <span className="metric-time">{card.timeFrame}</span>
                    </div> */}
                  </div>
                </motion.div>
              </Col>
            ))}
          </AnimatePresence>
        </Row>

        {/* Main Charts Section */}
        <Row className="g-4 mb-4">
          {/* Performance Chart */}
          <Col lg={8}>
            <motion.div
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="chart-card"
            >
              <div className="chart-card-header">
                <div>
                  <h5 className="chart-title">{t("performanceOverview")}</h5>
                  <p className="chart-subtitle">{t("revenueVsExpensesTrend")}</p>
                </div>
                <div className="chart-actions">
                  <div className="metric-selector">
                    {['transactions', 'revenue', 'expenses'].map((metric) => (
                      <Button
                        key={metric}
                        variant={activeMetric === metric ? "primary" : "outline-secondary"}
                        size="sm"
                        className="me-2"
                        onClick={() => setActiveMetric(metric)}
                      >
                        {t(metric)}
                      </Button>
                    ))}
                  </div>
                  <Button variant="outline-secondary" size="sm">
                    <FaSync />
                  </Button>
                </div>
              </div>
              <div className="chart-card-body">
                <div style={{ height: '350px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dashboardDetail}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#6b7280"
                        tick={{ fill: '#6b7280' }}
                      />
                      <YAxis 
                        stroke="#6b7280"
                        tick={{ fill: '#6b7280' }}
                        tickFormatter={(value) => value > 1000 ? `${(value/1000).toFixed(1)}k` : value}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid #e5e7eb',
                          borderRadius: '10px',
                          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                        }}
                        formatter={(value) => [formatCurrency(value), t("amount")]}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="transactions" 
                        stroke="#6366F1" 
                        fill="url(#colorRevenue)" 
                        strokeWidth={2}
                        name={t("totalRcdAmount")}
                        dot={{ stroke: '#6366F1', strokeWidth: 2, r: 4 }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="expenses" 
                        stroke="#10B981" 
                        fill="url(#colorExpenses)" 
                        strokeWidth={2}
                        name={t("totalExpenses")}
                        dot={{ stroke: '#10B981', strokeWidth: 2, r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="growth" 
                        stroke="#F59E0B" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name={t("growthRate")}
                        dot={{ stroke: '#F59E0B', strokeWidth: 2, r: 4 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          </Col>

          {/* Performance Metrics */}
          <Col lg={4}>
            <motion.div
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="metrics-card"
            >
              <div className="metrics-card-header">
                <h5 className="metrics-title">{t("performanceMetrics")}</h5>
                <p className="metrics-subtitle">{t("keyPerformanceIndicators")}</p>
              </div>
              <div className="metrics-list">
                {[
                  { label: t("transactionSuccessRate"), value: 98.5, target: 95, color: "#10B981" },
                  { label: t("averageTransactionValue"), value: formatCurrency(24500), color: "#6366F1" },
                  { label: t("customerSatisfaction"), value: 92, target: 90, color: "#F59E0B" },
                  { label: t("systemUptime"), value: 99.9, target: 99.5, color: "#8B5CF6" },
                ].map((metric, index) => (
                  <div key={index} className="metric-item">
                    <div className="metric-info">
                      <span className="metric-label">{metric.label}</span>
                      <span className="metric-value" style={{ color: metric.color }}>
                        {metric.value}{typeof metric.value === 'number' && !metric.value.toString().includes('₹') ? '%' : ''}
                      </span>
                    </div>
                    {metric.target && (
                      <ProgressBar 
                        now={(metric.value / metric.target) * 100} 
                        className="metric-progress"
                      >
                        <ProgressBar 
                          variant="success" 
                          now={Math.min((metric.value / metric.target) * 100, 100)}
                          style={{ backgroundColor: metric.color }}
                        />
                      </ProgressBar>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </Col>
        </Row>

        {/* Detailed Analytics */}
        <Row className="g-4">
          {/* Transactions Breakdown */}
          <Col lg={6}>
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="chart-card"
            >
              <div className="chart-card-header">
                <div>
                  <h5 className="chart-title">{t("transactionsBreakdown")}</h5>
                  <p className="chart-subtitle">{t("totalRcdNosVsTotalExpenses")}</p>
                </div>
              </div>
              <div className="chart-card-body">
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dashboardDetail}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        stroke="#6b7280"
                        tick={{ fill: '#6b7280' }}
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="#6b7280"
                        tick={{ fill: '#6b7280' }}
                        axisLine={false}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid #e5e7eb',
                          borderRadius: '10px',
                          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Legend />
                      <Bar 
                        dataKey="transactionCount" 
                        fill="#6366F1" 
                        name={t("totalRcdNos")} 
                        radius={[6, 6, 0, 0]}
                        maxBarSize={40}
                      />
                      <Bar 
                        dataKey="expenseCount" 
                        fill="#10B981" 
                        name={t("totalExpenses")} 
                        radius={[6, 6, 0, 0]}
                        maxBarSize={40}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          </Col>

          {/* Distribution Charts */}
          <Col lg={6}>
            <Row className="g-4">
             
       
              {/* Recent Activity */}
              <Col sm={12}>
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="activity-card"
                >
                  <div className="activity-card-header">
                    <h6 className="activity-title">{t("recentActivity")}</h6>
                    <Button variant="link" size="sm">
                      {t("viewAll")} →
                    </Button>
                  </div>
                  <div className="activity-list">
                    {activityData.map((activity, index) => (
                      <div key={index} className="activity-item">
                        <div className={`activity-indicator activity-${activity.type}`}></div>
                        <div className="activity-content">
                          <p className="activity-text">{activity.activity}</p>
                          <span className="activity-time">
                            <FaRegClock className="me-1" />
                            {activity.time}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>

      {/* Client List Modal */}
      <Modal
        size="lg"
        show={showClientListModal}
        onHide={() => setShowClientListModal(false)}
        centered
        className="dashboard-modal"
      >
        <Modal.Header closeButton className="modal-header-gradient">
          <Modal.Title className="fw-bold text-white">
            <FaUsers className="me-3" />
            {t("recentlyCreatedClients")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
          <div className="text-center py-5">
            <div className="modal-icon">
              <FaUsers size={48} className="text-primary" />
            </div>
            <h5 className="mt-3">{t("clientListWillBeShownHere")}</h5>
            <p className="text-muted mb-4">
              {t("clientListDescription")}
            </p>
            <Button 
              variant="primary"
              onClick={() => navigate('/purchase')}
              className="px-4"
            >
              {t("addNewClient")}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </motion.div>
  );
};

export default DashboardAdmin;