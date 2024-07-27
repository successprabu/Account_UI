import React, { useState } from "react";
import { Collapse, Nav } from "react-bootstrap";
import { BiUser, BiMenu, BiShield, BiDollar, BiBook, BiCog, BiExit } from "react-icons/bi";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import "./css/sidebar.css";
import LanguageSelector from "../../language/LanguageSelector";

const SideBar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [multiOpen, setMultiOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      localStorage.removeItem("user");
      navigate("/login"); // Redirect to the login page
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

  return (
    <div className="wrapper">
      <aside id="sidebar" className={isExpanded ? "expand" : ""}>
        <div className="d-flex">
          <button className="toggle-btn" type="button" onClick={handleToggle}>
            <BiMenu />
          </button>
          <div className="sidebar-logo">
            <a href="#"> {t('my_accounts')}</a>
          </div>
        </div>
        <ul className="sidebar-nav">
          <li className="sidebar-item">
            <NavLink to="/client-list" className="sidebar-link" onClick={handleExpand}>
              <BiUser />
              <span className={isExpanded ? "nav-text" : "hidden"}>{t('Clients')}</span>
            </NavLink>
          </li>
          <li className={`sidebar-item has-dropdown ${authOpen ? "expanded" : ""}`}>
            <NavLink
              className="sidebar-link"
              onClick={() => { setAuthOpen(!authOpen); handleExpand(); }}
              aria-controls="auth"
              aria-expanded={authOpen}
            >
              <BiShield />
              <span className={isExpanded ? "nav-text" : "hidden"}>{t('Masters')}</span>
              <span className={`dropdown-icon ${authOpen ? "expanded" : ""}`} />
            </NavLink>
            <Collapse in={authOpen}>
              <ul id="auth" className="sidebar-dropdown list-unstyled">
                <li className="sidebar-item">
                  <Nav.Link href="/function" className="sidebar-link sidebar-sublink">
                    {t('functionMaster')}
                  </Nav.Link>
                </li>
                <li className="sidebar-item">
                  <Nav.Link href="#" className="sidebar-link sidebar-sublink">
                    {t('userMaster')}
                  </Nav.Link>
                </li>
                <li className="sidebar-item">
                  <Nav.Link href="/purchase" className="sidebar-link sidebar-sublink">
                    {t('clientMaster')}
                  </Nav.Link>
                </li>
              </ul>
            </Collapse>
          </li>
          <li className={`sidebar-item has-dropdown ${multiOpen ? "expanded" : ""}`}>
            <NavLink
              className="sidebar-link"
              onClick={() => { setMultiOpen(!multiOpen); handleExpand(); }}
              aria-controls="multi"
              aria-expanded={multiOpen}
            >
              <BiDollar />
              <span className={isExpanded ? "nav-text" : "hidden"}>{t('Transaction')}</span>
              <span className={`dropdown-icon ${multiOpen ? "expanded" : ""}`} />
            </NavLink>
            <Collapse in={multiOpen}>
              <ul id="multi" className="sidebar-dropdown list-unstyled">
                <li className="sidebar-item">
                  <Nav.Link href="/transaction" className="sidebar-link sidebar-sublink">
                    {t('addTransaction')}
                  </Nav.Link>
                </li>
                <li className="sidebar-item">
                  <Nav.Link href="/transaction-list" className="sidebar-link sidebar-sublink">
                    {t('transactionList')}
                  </Nav.Link>
                </li>
              </ul>
            </Collapse>
          </li>
          <li className={`sidebar-item has-dropdown ${reportOpen ? "expanded" : ""}`}>
            <NavLink
              className="sidebar-link"
              onClick={() => { setReportOpen(!reportOpen); handleExpand(); }}
              aria-controls="report"
              aria-expanded={reportOpen}
            >
              <BiBook />
              <span className={isExpanded ? "nav-text" : "hidden"}>{t('Reports')}</span>
              <span className={`dropdown-icon ${reportOpen ? "expanded" : ""}`} />
            </NavLink>
            <Collapse in={reportOpen}>
              <ul id="report" className="sidebar-dropdown list-unstyled">
                <li className="sidebar-item">
                  <Nav.Link href="#" className="sidebar-link sidebar-sublink">
                    {t('Name Reports')}
                  </Nav.Link>
                </li>
                <li className="sidebar-item">
                  <Nav.Link href="#" className="sidebar-link sidebar-sublink">
                    {t('Village Reports')}
                  </Nav.Link>
                </li>
                <li className="sidebar-item">
                  <Nav.Link href="#" className="sidebar-link sidebar-sublink">
                    {t('Transaction Report')}
                  </Nav.Link>
                </li>
              </ul>
            </Collapse>
          </li>
          <li className="sidebar-item">
            <NavLink to="#" className="sidebar-link" onClick={handleExpand}>
              <BiCog />
              <span className={isExpanded ? "nav-text" : "hidden"}>{t('Setting')}</span>
            </NavLink>
          </li>
        </ul>
        <div className="sidebar-footer">
          <NavLink to="#" onClick={handleLogout} className="sidebar-link">
            <BiExit />
            <span className={isExpanded ? "nav-text" : "hidden"}>{t('Logout')}</span>
          </NavLink>
        </div>
      </aside>
    </div>
  );
};

export default SideBar;
