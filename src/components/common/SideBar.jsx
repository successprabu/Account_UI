import React, { useState } from "react";
import { Collapse, Nav } from "react-bootstrap";
import {
  BiGridAlt,
  BiUser,
  BiMenu,
  BiShield,
  BiLayout,
  BiNotification,
  BiCog,
  BiExit,
} from "react-icons/bi";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import "./css/sidebar.css";
import LanguageSelector from "../../language/LanguageSelector";

const SideBar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [multiOpen, setMultiOpen] = useState(false);
  const [multiTwoOpen, setMultiTwoOpen] = useState(false);
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
            <NavLink to="/client-list" className="sidebar-link">
              <BiUser />
              <span className={isExpanded ? "nav-text" : "hidden"}>{t('Clients')}</span>
            </NavLink>
          </li>
          <li className="sidebar-item">
            <NavLink to="#" className="sidebar-link">
              <BiGridAlt />
              <span className={isExpanded ? "nav-text" : "hidden"}>{t('Masters')}</span>
            </NavLink>
          </li>
          <li
            className={`sidebar-item has-dropdown ${
              authOpen ? "expanded" : ""
            }`}
          >
            <NavLink
              className="sidebar-link"
              onClick={() => setAuthOpen(!authOpen)}
              aria-controls="auth"
              aria-expanded={authOpen}
            >
              <BiShield />
              <span className={isExpanded ? "nav-text" : "hidden"}>{t('Masters')}</span>
            </NavLink>
            <Collapse in={authOpen}>
              <ul id="auth" className="sidebar-dropdown list-unstyled">
                <li className="sidebar-item">
                  <Nav.Link href="#" className="sidebar-link">
                    {t('Name Master')}
                  </Nav.Link>
                </li>
                <li className="sidebar-item">
                  <Nav.Link href="#" className="sidebar-link">
                    {t('Village Master')}
                  </Nav.Link>
                </li>
                <li className="sidebar-item">
                  <Nav.Link href="#" className="sidebar-link">
                   {t('Client Master')}
                  </Nav.Link>
                </li>
              </ul>
            </Collapse>
          </li>
          <li
            className={`sidebar-item has-dropdown ${
              multiOpen ? "expanded" : ""
            }`}
          >
            <NavLink
              className="sidebar-link"
              onClick={() => setMultiOpen(!multiOpen)}
              aria-controls="multi"
              aria-expanded={multiOpen}
            >
              <BiLayout />
              <span className={isExpanded ? "nav-text" : "hidden"}>{t('Transactions')}</span>
            </NavLink>
            <Collapse in={multiOpen}>
              <ul id="multi" className="sidebar-dropdown list-unstyled">
                <li
                  className={`sidebar-item has-dropdown ${
                    multiTwoOpen ? "expanded" : ""
                  }`}
                >
                  <Nav.Link
                    className="sidebar-link"
                    onClick={() => setMultiTwoOpen(!multiTwoOpen)}
                    aria-controls="multi-two"
                    aria-expanded={multiTwoOpen}
                  >
                    {t('Two Links')}
                  </Nav.Link>
                  <Collapse in={multiTwoOpen}>
                    <ul
                      id="multi-two"
                      className="sidebar-dropdown list-unstyled"
                    >
                      <li className="sidebar-item">
                        <Nav.Link href="/transaction" className="sidebar-link">
                          {t('Link 1')}
                        </Nav.Link>
                      </li>
                      <li className="sidebar-item">
                        <Nav.Link href="/transaction-list" className="sidebar-link">
                          {t('Link 2')}
                        </Nav.Link>
                      </li>
                    </ul>
                  </Collapse>
                </li>
              </ul>
            </Collapse>
          </li>
          <li
            className={`sidebar-item has-dropdown ${
              reportOpen ? "expanded" : ""
            }`}
          >
            <NavLink
              className="sidebar-link"
              onClick={() => setReportOpen(!reportOpen)}
              aria-controls="report"
              aria-expanded={reportOpen}
            >
              <BiNotification />
              <span className={isExpanded ? "nav-text" : "hidden"}>{t('Reports')}</span>
            </NavLink>
            <Collapse in={reportOpen}>
              <ul id="report" className="sidebar-dropdown list-unstyled">
                <li className="sidebar-item">
                  <Nav.Link href="#" className="sidebar-link">
                    {t('Name Reports')}
                  </Nav.Link>
                </li>
                <li className="sidebar-item">
                  <Nav.Link href="#" className="sidebar-link">
                    {t('Village Reports')}
                  </Nav.Link>
                </li>
                <li className="sidebar-item">
                  <Nav.Link href="#" className="sidebar-link">
                    {t('Transaction Report')}
                  </Nav.Link>
                </li>
              </ul>
            </Collapse>
          </li>
          <li className="sidebar-item">
            <NavLink to="#" className="sidebar-link">
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
