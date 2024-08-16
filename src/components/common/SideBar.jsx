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
  //const [isLoggedIn, setIsLoggedIn] = useState(false); // New state for login check
  const navigate = useNavigate();
  const { t } = useTranslation();
  const user = JSON.parse(localStorage.getItem("user"));
  useEffect(() => {

    if (user) {
      setUserType(user.userType);
      setUserName(user.name);
      setDesignation(user.userTypeDescription);
     // setIsLoggedIn(true); // Set login state
     } else {
       console.log(user,"userfromsidebar")
     }
  }, []);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      localStorage.removeItem("user");
     // setIsLoggedIn(false); // Set login state to false on logout
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
                  <Nav.Link
                    href="/function"
                    className="sidebar-link sidebar-sublink"
                  >
                    {t("functionMaster")}
                  </Nav.Link>
                </li>
                <li className="sidebar-item">
                  <Nav.Link
                    href="/user"
                    className="sidebar-link sidebar-sublink"
                  >
                    {t("userMaster")}
                  </Nav.Link>
                </li>
                {/* <li className="sidebar-item">
                  <Nav.Link
                    href="/purchase"
                    className="sidebar-link sidebar-sublink"
                  >
                    {t("clientMaster")}
                  </Nav.Link>
                </li> */}
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
                  <Nav.Link
                    href="/transaction"
                    className="sidebar-link sidebar-sublink"
                  >
                    {t("addTransaction")}
                  </Nav.Link>
                </li>
                <li className="sidebar-item">
                  <Nav.Link
                    href="/transaction-list"
                    className="sidebar-link sidebar-sublink"
                  >
                    {t("transactionList")}
                  </Nav.Link>
                </li>
                <li className="sidebar-item">
                  <Nav.Link
                    href="/addExpenses"
                    className="sidebar-link sidebar-sublink"
                  >
                    {t("addExpenses")}
                  </Nav.Link>
                </li>
                <li className="sidebar-item">
                  <Nav.Link
                    href="/expenses-list"
                    className="sidebar-link sidebar-sublink"
                  >
                    {t("expensesList")}
                  </Nav.Link>
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
                  <Nav.Link href="#" className="sidebar-link sidebar-sublink">
                    {t("receiptReport")}
                  </Nav.Link>
                </li>
                <li className="sidebar-item">
                  <Nav.Link href="#" className="sidebar-link sidebar-sublink">
                    {t("expenseReports")}
                  </Nav.Link>
                </li>
                <li className="sidebar-item">
                  <Nav.Link href="#" className="sidebar-link sidebar-sublink">
                    {t("locationAmountReport")}
                  </Nav.Link>
                </li>
                <li className="sidebar-item">
                  <Nav.Link href="#" className="sidebar-link sidebar-sublink">
                    {t("userAmountReport")}
                  </Nav.Link>
                </li>
                <li className="sidebar-item">
                  <Nav.Link href="#" className="sidebar-link sidebar-sublink">
                    {t("summaryReport")}
                  </Nav.Link>
                </li>
                <li className="sidebar-item">
                  <Nav.Link href="#" className="sidebar-link sidebar-sublink">
                    {t("rankingReport")}
                  </Nav.Link>
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

  // Render the sidebar only if isLoggedIn is true
  // if (!isLoggedIn) {
  //   return null;
  // }

  return (
    <div className="wrapper">
      <aside id="sidebar" className={isExpanded ? "expand" : ''}>
        <div className="d-flex">
          <button className="toggle-btn" type="button" onClick={handleToggle}>
            <BiMenu />
          </button>
          <div className="sidebar-logo">
            <a href="#"> {t("my_accounts")}</a>
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
              <BiBook />
              <span className="nav-text">{t("help")}</span>
            </NavLink>
          </div>
        )}

      </aside>
    </div>
  );
};

export default SideBar;
