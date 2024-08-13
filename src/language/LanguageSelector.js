import React from "react";
import { useLanguage } from "./LanguageContext";
import { Dropdown } from "react-bootstrap";
import { FaLanguage } from "react-icons/fa";
import styled from "styled-components";

// Styled components for custom dropdown styling
const CustomDropdownToggle = styled(Dropdown.Toggle)`
  background-color: ${({ bgColor }) => bgColor || "#0e2238"};
  color: ${({ textColor }) => textColor || "white"};
  border: none;
  &:hover {
    background-color: ${({ hoverColor }) => hoverColor || "#0a1e2d"};
  }
`;

const CustomDropdownMenu = styled(Dropdown.Menu)`
  background-color: ${({ bgColor }) => bgColor || "#0e2238"};
  .dropdown-item {
    color: ${({ textColor }) => textColor || "white"};
    &:hover {
      background-color: ${({ hoverColor }) => hoverColor || "#0a1e2d"};
    }
  }
`;

const LanguageSelector = ({ backgroundColor, textColor, hoverColor }) => {
  const { changeLanguage } = useLanguage();

  const handleLanguageChange = (language) => {
    changeLanguage(language);
  };

  return (
    <Dropdown className="language-selector">
      <CustomDropdownToggle
        id="dropdown-basic"
        bgColor={backgroundColor}
        textColor={textColor}
        hoverColor={hoverColor}
      >
        <FaLanguage className="language-icon" size={24} />
      </CustomDropdownToggle>

      <CustomDropdownMenu
        bgColor={backgroundColor}
        textColor={textColor}
        hoverColor={hoverColor}
      >
        <Dropdown.Item onClick={() => handleLanguageChange("en")}>
          English
        </Dropdown.Item>
        <Dropdown.Item onClick={() => handleLanguageChange("ta")}>
          தமிழ்
        </Dropdown.Item>
        <Dropdown.Item onClick={() => handleLanguageChange("ml")}>
          മലയാളം
        </Dropdown.Item>
        <Dropdown.Item onClick={() => handleLanguageChange("hi")}>
          हिंदी
        </Dropdown.Item>
        <Dropdown.Item onClick={() => handleLanguageChange("te")}>
          తెలుగు
        </Dropdown.Item>
        <Dropdown.Item onClick={() => handleLanguageChange("kn")}>
          ಕನ್ನಡ
        </Dropdown.Item>
      </CustomDropdownMenu>
    </Dropdown>
  );
};

export default LanguageSelector;
