import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { Navbar, Container } from "react-bootstrap";
import LanguageSelector from "../../language/LanguageSelector";

const ModernHeader = styled(Navbar)`
  background: linear-gradient(145deg, #2d3436 0%, #0984e3 100%);
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  padding: 0.8rem 0;
  transition: all 0.3s ease;
  
  @media (max-width: 991px) {
    background: #2d3436;
  }
`;

const BrandTitle = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  background: linear-gradient(90deg, #fff 0%, #e0f3ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.5px;
  
  span {
    margin-right: 1.5rem;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
    }
  }
`;

const NavLink = styled(Link)`
  color: rgba(255,255,255,0.9) !important;
  text-decoration: none;
  padding: 0.6rem 1.2rem;
  margin: 0 0.5rem;
  border-radius: 8px;
  position: relative;
  transition: all 0.3s ease;
  font-weight: 500;
  display: flex;
  align-items: center;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 50%;
    width: 0;
    height: 2px;
    background: #fff;
    transition: all 0.3s ease;
  }

  &:hover {
    color: #fff !important;
    transform: translateY(-2px);
    
    &::after {
      width: 60%;
      left: 20%;
    }
  }

  &.active {
    color: #fff !important;
    
    &::after {
      width: 60%;
      left: 20%;
    }
  }
`;

const CustomToggle = styled(Navbar.Toggle)`
  border: none;
  &:focus {
    box-shadow: none;
  }

  .navbar-toggler-icon {
    background-image: url("data:image/svg2charset=utf8,%3Csvg viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='rgba(255, 255, 255, 0.9)' stroke-width='2' stroke-linecap='round' stroke-miterlimit='10' d='M4 7h22M4 15h22M4 23h22'/%3E%3C/svg%3E");
  }
`;

const Header = ({ titles, links, showLanguageSelector = true }) => {
  return (
    <ModernHeader expand="lg" collapseOnSelect>
      <Container fluid>
        <BrandTitle as={Link} to="/">
          {titles.map((title, index) => (
            <span key={index}>{title}</span>
          ))}
        </BrandTitle>
        
        <CustomToggle aria-controls="responsive-header" />
        
        <Navbar.Collapse id="responsive-header">
          <div className="ms-auto d-flex align-items-center">
            {links.map((link, index) => (
              <NavLink key={index} to={link.to}>
                {link.label}
              </NavLink>
            ))}
            {showLanguageSelector && (
              <LanguageSelector
                backgroundColor="#0e2238"
                textColor="#fff"
                hoverColor="#0984e3"
                className="ms-3"
              />
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </ModernHeader>
  );
};

export default Header;