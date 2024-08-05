import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import LanguageSelector from "../../language/LanguageSelector";

const HeaderContainer = styled.header`
  background-color: #0e2238;
  color: white;
  margin: 1px;
  padding: 1px; /* Adjust padding for better spacing */
  font-family: "Trebuchet MS", "Lucida Sans Unicode", "Lucida Grande",
    "Lucida Sans", "Arial, sans-serif";
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const HeadingTitle = styled.div`
  font-size: 1.5rem;
`;

const HeaderLinks = styled.div`
  display: flex;
  align-items: center;
`;

const HeadingLink = styled(Link)`
  color: white;
  text-decoration: none;
  font-size: 1rem;
  padding: 5px 10px; /* Adjust padding for better spacing */
  border-radius: 4px;
  margin-left: 10px; /* Space between language selector and link */
`;

const LanguageSelectorWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const Header = ({ titles, links }) => {
    return (
      <HeaderContainer>
        <HeadingTitle>
          {titles.map((title, index) => (
            <span key={index} style={{ marginRight: index < titles.length - 1 ? "1rem" : "0" }}>
              {title}
            </span>
          ))}
        </HeadingTitle>
        <HeaderLinks>
          {links.map((link, index) => (
            <HeadingLink key={index} to={link.to}>
              {link.label}
            </HeadingLink>
          ))}
          <LanguageSelectorWrapper>
            <LanguageSelector />
          </LanguageSelectorWrapper>
        </HeaderLinks>
      </HeaderContainer>
    );
  };
  
  export default Header;