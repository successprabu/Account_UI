import React, { useState, useEffect } from "react";
import { Collapse, Nav } from "react-bootstrap";
import {
  BiUser,
  BiMenu,
  BiShield,
  BiDollar,
  BiBook,
  BiCog,
  BiExit,
  BiHelpCircle,
} from "react-icons/bi";
import { FaTachometerAlt } from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./css/sidebar.css";

const SideBar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [multiOpen, setMultiOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [userType, setUserType] = useState(null);
  const [userName, setUserName] = useState(null);
  const [designation, setDesignation] = useState(null);
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (user) {
      setUserType(user.userType);
      setUserName(user.name);
      setDesignation(user.userTypeDescription);
    }
  }, [user]);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleExpand = () => {
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  const renderMenuItems = () => {
    if (!userType) return null; 
    const isSuperAdmin = userType === "SU";
    const isAdminUser = userType === "AU";
    const isNormalUser = userType === "NU";

    return (
      <>
        {(isSuperAdmin || isAdminUser || isNormalUser) && (
          <li className="sidebar-item">
            <NavLink
              to="/dashboard"
              className="sidebar-link"
              onClick={handleExpand}
            >
              <FaTachometerAlt />
              <span className={isExpanded ? "nav-text" : "hidden"}>
                {t("dashboard")}
              </span>
            </NavLink>
          </li>
        )}
        {isSuperAdmin && (
          <li className="sidebar-item">
            <NavLink
              to="/client-list"
              className="sidebar-link"
              onClick={handleExpand}
            >
              <BiUser />
              <span className={isExpanded ? "nav-text" : "hidden"}>
                {t("Clients")}
              </span>
            </NavLink>
          </li>
        )}
        {(isSuperAdmin || isAdminUser) && (
          <li
            className={`sidebar-item has-dropdown ${authOpen ? "expanded" : ""}`}
          >
            <NavLink
              className="sidebar-link"
              onClick={() => {
                setAuthOpen(!authOpen);
                handleExpand();
              }}
              aria-controls="auth"
              aria-expanded={authOpen}
            >
              <BiShield />
              <span className={isExpanded ? "nav-text" : "hidden"}>
                {t("Masters")}
              </span>
              <span className={`dropdown-icon ${authOpen ? "expanded" : ""}`} />
            </NavLink>
            <Collapse in={authOpen}>
              <ul id="auth" className="sidebar-dropdown list-unstyled">
                <li className="sidebar-item">
                  <NavLink
                    to="/function"
                    className="sidebar-link sidebar-sublink"
                  >
                    {t("functionMaster")}
                  </NavLink>
                </li>
                <li className="sidebar-item">
                  <NavLink
                    to="/user"
                    className="sidebar-link sidebar-sublink"
                  >
                    {t("userMaster")}
                  </NavLink>
                </li>
              </ul>
            </Collapse>
          </li>
        )}
        {(isSuperAdmin || isAdminUser || isNormalUser) && (
          <li
            className={`sidebar-item has-dropdown ${multiOpen ? "expanded" : ""}`}
          >
            <NavLink
              className="sidebar-link"
              onClick={() => {
                setMultiOpen(!multiOpen);
                handleExpand();
              }}
              aria-controls="multi"
              aria-expanded={multiOpen}
            >
              <BiDollar />
              <span className={isExpanded ? "nav-text" : "hidden"}>
                {t("transactions")}
              </span>
              <span className={`dropdown-icon ${multiOpen ? "expanded" : ""}`} />
            </NavLink>
            <Collapse in={multiOpen}>
              <ul id="multi" className="sidebar-dropdown list-unstyled">
                <li className="sidebar-item">
                  <NavLink
                    to="/transaction"
                    className="sidebar-link sidebar-sublink"
                  >
                    {t("addTransaction")}
                  </NavLink>
                </li>
                <li className="sidebar-item">
                  <NavLink
                    to="/transaction-list"
                    className="sidebar-link sidebar-sublink"
                  >
                    {t("transactionList")}
                  </NavLink>
                </li>
                <li className="sidebar-item">
                  <NavLink
                    to="/addExpenses"
                    className="sidebar-link sidebar-sublink"
                  >
                    {t("addExpenses")}
                  </NavLink>
                </li>
                <li className="sidebar-item">
                  <NavLink
                    to="/expenses-list"
                    className="sidebar-link sidebar-sublink"
                  >
                    {t("expensesList")}
                  </NavLink>
                </li>
                <li className="sidebar-item">
                  <NavLink
                    to="/others"
                    className="sidebar-link sidebar-sublink"
                  >
                    {t("addOthers")}
                  </NavLink>
                </li>
                <li className="sidebar-item">
                  <NavLink
                    to="/others-list"
                    className="sidebar-link sidebar-sublink"
                  >
                    {t("othersList")}
                  </NavLink>
                </li>
                <li className="sidebar-item">
                  <NavLink
                    to="/handover"
                    className="sidebar-link sidebar-sublink"
                  >
                    {t("handOver")}
                  </NavLink>
                </li>
              </ul>
            </Collapse>
          </li>
        )}
        {(isSuperAdmin || isAdminUser) && (
          <li
            className={`sidebar-item has-dropdown ${reportOpen ? "expanded" : ""}`}
          >
            <NavLink
              className="sidebar-link"
              onClick={() => {
                setReportOpen(!reportOpen);
                handleExpand();
              }}
              aria-controls="report"
              aria-expanded={reportOpen}
            >
              <BiBook />
              <span className={isExpanded ? "nav-text" : "hidden"}>
                {t("Reports")}
              </span>
              <span className={`dropdown-icon ${reportOpen ? "expanded" : ""}`} />
            </NavLink>
            <Collapse in={reportOpen}>
              <ul id="report" className="sidebar-dropdown list-unstyled">
                <li className="sidebar-item">
                  <NavLink to="/income-report" className="sidebar-link sidebar-sublink">
                    {t("receiptReport")}
                  </NavLink>
                </li>
                <li className="sidebar-item">
                  <NavLink to="/expenses-report" className="sidebar-link sidebar-sublink">
                    {t("expenseReport")}
                  </NavLink>
                </li>
                <li className="sidebar-item">
                  <NavLink to="/others-report" className="sidebar-link sidebar-sublink">
                    {t("othersReport")}
                  </NavLink>
                </li>
                <li className="sidebar-item">
                  <NavLink to="/regional-report#" className="sidebar-link sidebar-sublink">
                    {t("locationAmountReport")}
                  </NavLink>
                </li>
                <li className="sidebar-item">
                  <NavLink to="/summary-report" className="sidebar-link sidebar-sublink">
                    {t("summaryReport")}
                  </NavLink>
                </li>
                <li className="sidebar-item">
                  <NavLink to="#" className="sidebar-link sidebar-sublink">
                    {t("rankingReport")}
                  </NavLink>
                </li>
              </ul>
            </Collapse>
          </li>
        )}
        {(isSuperAdmin || isAdminUser || isNormalUser) && (
          <li className="sidebar-item">
            <NavLink to="#" className="sidebar-link" onClick={handleExpand}>
              <BiCog />
              <span className={isExpanded ? "nav-text" : "hidden"}>
                {t("Setting")}
              </span>
            </NavLink>
          </li>
        )}
      </>
    );
  };

  const handleUserDetailsToggle = () => {
    setUserDetailsOpen(!userDetailsOpen);
  };

  return (
    <div className="wrapper">
      <aside id="sidebar" className={isExpanded ? "expand" : ''}>
        <div className="d-flex">
          <button className="toggle-btn" type="button" onClick={handleToggle}>
            <BiMenu />
          </button>
          <div className="sidebar-logo">
            <NavLink to="#"> {t("my_accounts")}</NavLink>
          </div>
        </div>
        <ul className="sidebar-nav">{renderMenuItems()}</ul>
        <div className="user-details" onClick={handleUserDetailsToggle}>
          <BiUser />
          <div className="user-info">
            <div>{userName}</div>
            <div>{designation}</div>
          </div>
          <span className={`dropdown-icon ${userDetailsOpen ? "expanded" : ""}`}></span>
        </div> 
        {userDetailsOpen &&  (
          <div className="user-menu">
            <NavLink to="/" onClick={handleLogout} className="sidebar-link">
              <BiExit />
              <span className="nav-text">{t("Logout")}</span>
            </NavLink>
            <NavLink to="/help" className="sidebar-link">
              <BiHelpCircle />
              <span className="nav-text">{t("help")}</span>
            </NavLink>
          </div>
        )}
      </aside>
    </div>
  );
};

export default SideBar;
