import React from 'react';
import { useLanguage } from './LanguageContext';
import { Dropdown } from 'react-bootstrap';
import { BsGlobe } from 'react-icons/bs';
import './language.css'; // Import custom CSS for additional styling

const LanguageSelector = () => {
  const { changeLanguage } = useLanguage();

  const handleLanguageChange = (language) => {
    changeLanguage(language);
  };

  return (
    <Dropdown className="language-selector">
      <Dropdown.Toggle variant="secondary" id="dropdown-basic">
        <BsGlobe className="language-icon" />
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item onClick={() => handleLanguageChange('en')}>English</Dropdown.Item>
        <Dropdown.Item onClick={() => handleLanguageChange('ta')}>தமிழ்</Dropdown.Item>
        {/* Add more languages as needed */}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default LanguageSelector;
