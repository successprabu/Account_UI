import React from "react";
import { Container, Nav, Navbar, NavbarBrand, NavbarToggle, NavbarCollapse } from "react-bootstrap";
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import LanguageSelector from "../../language/LanguageSelector";
import { useTranslation } from "react-i18next";

const StyledNavLink = styled(NavLink)`
  color: #333566;
  text-decoration: none;
  padding: 10px 20px;
  margin: 0 10px;
  border-radius: 5px;
  white-space: nowrap;

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
  const { t } = useTranslation();

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
          {t('my_accounts')}
        </NavbarBrand>
        <NavbarToggle aria-controls="basic-navbar-nav" />
        <NavbarCollapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <StyledNavLink exact to='/'>{t('home')}</StyledNavLink>
            <StyledNavLink to='/about'>{t('about_us')}</StyledNavLink>
            <StyledNavLink to='/purchase'>{t('purchase')}</StyledNavLink>
            <StyledNavLink to='/contactus'>{t('contact_us')}</StyledNavLink>
            <StyledNavLink to='/login'>{t('login')}</StyledNavLink>
            <LanguageSelector />
          </Nav>
        </NavbarCollapse>
      </Container>
    </Navbar>
  );
};

export default AppHeader;
