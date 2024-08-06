import React from 'react';
import { useLanguage } from './LanguageContext';
import { Dropdown } from 'react-bootstrap';
import { FaLanguage } from 'react-icons/fa';
import styled from 'styled-components';

// Styled components for custom dropdown styling
const CustomDropdownToggle = styled(Dropdown.Toggle)`
  background-color: #0e2238;
  color: white; /* Set text color to white */
  border: none; /* Remove border */
  &:hover {
    background-color: #0a1e2d; /* Slightly darker shade for hover effect */
  }
`;

const CustomDropdownMenu = styled(Dropdown.Menu)`
  background-color: #0e2238; /* Match the background color of the toggle */
  .dropdown-item {
    color: white; /* Set text color for dropdown items */
    &:hover {
      background-color: #0a1e2d; /* Darker shade on hover */
    }
  }
`;

const LanguageSelector = () => {
  const { changeLanguage } = useLanguage();

  const handleLanguageChange = (language) => {
    changeLanguage(language);
  };

  return (
    <Dropdown className="language-selector">
      <CustomDropdownToggle id="dropdown-basic">
        <FaLanguage className="language-icon" size={24} />
      </CustomDropdownToggle>

      <CustomDropdownMenu>
        <Dropdown.Item onClick={() => handleLanguageChange('en')}>English</Dropdown.Item>
        <Dropdown.Item onClick={() => handleLanguageChange('ta')}>தமிழ்</Dropdown.Item>
      </CustomDropdownMenu>
    </Dropdown>
  );
};

export default LanguageSelector;
