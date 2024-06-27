import React from "react";
import { Container, Nav, Navbar, NavbarBrand, NavbarToggle, NavbarCollapse } from "react-bootstrap";
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import LanguageSelector from "../../language/LanguageSelector";

const StyledNavLink = styled(NavLink)`
  color: #333566;
  text-decoration: none;
  padding: 10px 20px;
  margin: 0 10px;
  border-radius: 5px;
  
  &.active {
    background-color: #007bff;
    color: #fff;
  }

  &:hover {
    background-color: #0056b3;
    color: #fff;
  }
`;

const AppHeader = () => {
  return (
    <Navbar expand="lg" className="bg-body-white">
      <Container fluid>
        <NavbarBrand href="#home">
          <img
            alt=""
            src="accounts_icon.webp"
            width="30"
            height="30"
            className="d-inline-block align-top"
          />{" "}
          My Accounts
        </NavbarBrand>
        <NavbarToggle aria-controls="basic-navbar-nav" />
        <NavbarCollapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <StyledNavLink exact to='/'>Home</StyledNavLink>
            <StyledNavLink to='/about'>About Us</StyledNavLink>
            <StyledNavLink to='/purchase'>Purchase</StyledNavLink>
            <StyledNavLink to='/contactus'>Contact Us</StyledNavLink>
            <StyledNavLink to='/login'>Login</StyledNavLink>
            <LanguageSelector/>
          </Nav>
        </NavbarCollapse>
      </Container>
    </Navbar>
  );
};

export default AppHeader;
