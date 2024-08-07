//working as expected
import React, { useState, useEffect } from "react";
import { Collapse } from "react-bootstrap";
import {
  BiUser,
  BiMenu,
  BiShield,
  BiDollar,
  BiBook,
  BiCog,
  BiExit,
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
  const [appName, setAppName] = useState(null);
  const [userName, setUserName] = useState(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setUserType(user.userType);
      setAppName(user.appName);
      setUserName(user.userName);
    }
  }, []);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("expand");
  };

  const handleExpand = () => {
    if (!isExpanded) {
      setIsExpanded(true);
      const sidebar = document.getElementById("sidebar");
      sidebar.classList.add("expand");
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
            className={`sidebar-item has-dropdown ${
              authOpen ? "expanded" : ""
            }`}
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
                <li className="sidebar-item">
                  <NavLink
                    to="/purchase"
                    className="sidebar-link sidebar-sublink"
                  >
                    {t("clientMaster")}
                  </NavLink>
                </li>
              </ul>
            </Collapse>
          </li>
        )}
        {(isSuperAdmin || isAdminUser || isNormalUser) && (
          <li
            className={`sidebar-item has-dropdown ${
              multiOpen ? "expanded" : ""
            }`}
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
              <span
                className={`dropdown-icon ${multiOpen ? "expanded" : ""}`}
              />
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
              </ul>
            </Collapse>
          </li>
        )}
        {(isSuperAdmin || isAdminUser) && (
          <li
            className={`sidebar-item has-dropdown ${
              reportOpen ? "expanded" : ""
            }`}
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
              <span
                className={`dropdown-icon ${reportOpen ? "expanded" : ""}`}
              />
            </NavLink>
            <Collapse in={reportOpen}>
              <ul id="report" className="sidebar-dropdown list-unstyled">
                <li className="sidebar-item">
                  <NavLink
                    to="#"
                    className="sidebar-link sidebar-sublink"
                  >
                    {t("Name Reports")}
                  </NavLink>
                </li>
                <li className="sidebar-item">
                  <NavLink
                    to="#"
                    className="sidebar-link sidebar-sublink"
                  >
                    {t("Village Reports")}
                  </NavLink>
                </li>
                <li className="sidebar-item">
                  <NavLink
                    to="#"
                    className="sidebar-link sidebar-sublink"
                  >
                    {t("Transaction Report")}
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

  return (
    <div className="wrapper">
      <aside id="sidebar" className={isExpanded ? "expand" : ""}>
        <div className="d-flex">
          <button className="toggle-btn" type="button" onClick={handleToggle}>
            <BiMenu />
          </button>
          <div className="sidebar-logo">
            <a href="#">{t("my_accounts")}</a>
          </div>
        </div>
        <ul className="sidebar-nav">{renderMenuItems()}</ul>
        <div className="sidebar-footer">
          <NavLink to="#" onClick={handleLogout} className="sidebar-link">
            <BiExit />
            <span className={isExpanded ? "nav-text" : "hidden"}>
              {t("Logout")}
            </span>
          </NavLink>
        </div>
      </aside>
    </div>
  );
};

export default SideBar;
