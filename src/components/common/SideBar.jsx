import React, { useState } from 'react';
import { Collapse, Nav } from 'react-bootstrap';
import { BiGridAlt, BiUser, BiMenu, BiShield, BiLayout, BiNotification, BiCog, BiExit } from 'react-icons/bi';
import { NavLink } from 'react-router-dom'; // Assuming you are using React Router
import './css/sidebar.css'; // Adjust the path as needed

const SideBar = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [authOpen, setAuthOpen] = useState(false);
    const [multiOpen, setMultiOpen] = useState(false);
    const [multiTwoOpen, setMultiTwoOpen] = useState(false);

    const handleToggle = () => {
        setIsExpanded(!isExpanded);
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('expand');
    };

    return (
        <div className="wrapper">
            <aside id="sidebar" className={isExpanded ? 'expand' : ''}>
                <div className="d-flex">
                    <button className="toggle-btn" type="button" onClick={handleToggle}>
                        <BiMenu />
                    </button>
                    <div className="sidebar-logo">
                        <a href="#">CodzSword</a>
                    </div>
                </div>
                <ul className="sidebar-nav">
                    <li className="sidebar-item">
                        <NavLink to="#" className="sidebar-link">
                            <BiUser />
                            <span>Profile</span>
                        </NavLink>
                    </li>
                    <li className="sidebar-item">
                        <NavLink to="#" className="sidebar-link">
                            <BiGridAlt />
                            <span>Task</span>
                        </NavLink>
                    </li>
                    <li className="sidebar-item">
                        <NavLink
                            className="sidebar-link"
                            onClick={() => setAuthOpen(!authOpen)}
                            aria-controls="auth"
                            aria-expanded={authOpen}
                        >
                            <BiShield />
                            <span>Auth</span>
                        </NavLink>
                        <Collapse in={authOpen}>
                            <ul id="auth" className="sidebar-dropdown list-unstyled">
                                <li className="sidebar-item">
                                    <Nav.Link href="#" className="sidebar-link">Login</Nav.Link>
                                </li>
                                <li className="sidebar-item">
                                    <Nav.Link href="#" className="sidebar-link">Register</Nav.Link>
                                </li>
                            </ul>
                        </Collapse>
                    </li>
                    <li className="sidebar-item">
                        <NavLink
                            className="sidebar-link"
                            onClick={() => setMultiOpen(!multiOpen)}
                            aria-controls="multi"
                            aria-expanded={multiOpen}
                        >
                            <BiLayout />
                            <span>Multi Level</span>
                        </NavLink>
                        <Collapse in={multiOpen}>
                            <ul id="multi" className="sidebar-dropdown list-unstyled">
                                <li className="sidebar-item">
                                    <Nav.Link
                                        className="sidebar-link"
                                        onClick={() => setMultiTwoOpen(!multiTwoOpen)}
                                        aria-controls="multi-two"
                                        aria-expanded={multiTwoOpen}
                                    >
                                        Two Links
                                    </Nav.Link>
                                    <Collapse in={multiTwoOpen}>
                                        <ul id="multi-two" className="sidebar-dropdown list-unstyled">
                                            <li className="sidebar-item">
                                                <Nav.Link href="#" className="sidebar-link">Link 1</Nav.Link>
                                            </li>
                                            <li className="sidebar-item">
                                                <Nav.Link href="#" className="sidebar-link">Link 2</Nav.Link>
                                            </li>
                                        </ul>
                                    </Collapse>
                                </li>
                            </ul>
                        </Collapse>
                    </li>
                    <li className="sidebar-item">
                        <NavLink to="#" className="sidebar-link">
                            <BiNotification />
                            <span>Notification</span>
                        </NavLink>
                    </li>
                    <li className="sidebar-item">
                        <NavLink to="#" className="sidebar-link">
                            <BiCog />
                            <span>Setting</span>
                        </NavLink>
                    </li>
                </ul>
                <div className="sidebar-footer">
                    <NavLink to="#" className="sidebar-link">
                        <BiExit />
                        <span>Logout</span>
                    </NavLink>
                </div>
            </aside>
        </div>
    );
};

export default SideBar;
