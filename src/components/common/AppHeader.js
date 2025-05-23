import React from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import LanguageSelector from "../../language/LanguageSelector";
import { useTranslation } from "react-i18next";

const StyledNavbar = styled(Navbar)`
  background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  padding: 0.5rem 0;
  transition: all 0.3s ease;

  @media (max-width: 991px) {
    background: rgba(255,255,255,0.98);
    backdrop-filter: blur(10px);
  }
`;

const BrandLogo = styled.img`
  transition: transform 0.3s ease;
  &:hover {
    transform: rotate(-15deg);
  }
`;

const StyledNavLink = styled(NavLink)`
  color: #2d3436 !important;
  text-decoration: none;
  padding: 0.8rem 1.2rem;
  margin: 0 0.5rem;
  border-radius: 8px;
  position: relative;
  transition: all 0.3s ease;
  font-weight: 500;
  display: flex;
  align-items: center;

  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 3px;
    background: linear-gradient(90deg, #0984e3 0%, #6c5ce7 100%);
    transition: width 0.3s ease;
  }

  &:hover {
    color: #0984e3 !important;
    background: rgba(9, 132, 227, 0.05);
    transform: translateY(-2px);

    &::before {
      width: 100%;
    }
  }

  &.active {
    color: #0984e3 !important;
    background: rgba(9, 132, 227, 0.1);
    
    &::before {
      width: 100%;
    }
  }

  @media (max-width: 991px) {
    margin: 0.5rem 0;
    padding: 1rem;
    justify-content: center;
    border-radius: 12px;
    
    &:hover {
      transform: none;
    }
  }
`;

const NavbarBrandText = styled.span`
  font-weight: 700;
  background: linear-gradient(90deg, #0984e3 0%, #6c5ce7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-left: 0.5rem;
`;

const CustomToggle = styled(Navbar.Toggle)`
  border: none;
  &:focus {
    box-shadow: none;
  }

  .navbar-toggler-icon {
    background-image: url("data:image/svg2charset=utf8,%3Csvg viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='rgba(9, 132, 227, 1)' stroke-width='2' stroke-linecap='round' stroke-miterlimit='10' d='M4 7h22M4 15h22M4 23h22'/%3E%3C/svg%3E");
  }
`;

const AppHeader = () => {
  const { t } = useTranslation();

  return (
    <StyledNavbar expand="lg" collapseOnSelect>
      <Container fluid>
        <Navbar.Brand href="#home" className="d-flex align-items-center">
          <BrandLogo
            alt="Logo"
            src="logo.png"
            width="40"
            height="40"
            className="d-inline-block align-top"
          />
          <NavbarBrandText className="h4 mb-0">{t('my_accounts')}</NavbarBrandText>
        </Navbar.Brand>
        
        <CustomToggle aria-controls="responsive-navbar-nav" />
        
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="ms-auto align-items-lg-center">
            <StyledNavLink exact to='/'>{t('home')}</StyledNavLink>
            <StyledNavLink to='/about'>{t('about_us')}</StyledNavLink>
            <StyledNavLink to='/services'>{t('ourServices')}</StyledNavLink>
            <StyledNavLink to='/contactus'>{t('contact_us')}</StyledNavLink>
            <StyledNavLink to='/login' className="gradient-btn">
              {t('login')}
            </StyledNavLink>
            <LanguageSelector
              backgroundColor="rgba(9, 132, 227, 0.1)"
              textColor="#0984e3"
              hoverColor="#6c5ce7"
              className="ms-2"
            />
          </Nav>
        </Navbar.Collapse>
      </Container>
    </StyledNavbar>
  );
};

export default AppHeader;