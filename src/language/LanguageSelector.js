
import React from "react";
import { useLanguage } from "./LanguageContext";

const LanguageSelector = () => {
  const { changeLanguage } = useLanguage();

  const handleLanguageChange = (e) => {
    const language = e.target.value;
    changeLanguage(language);
  };

  return (
    <div>
      <label>Select Language:</label>
      <select onChange={handleLanguageChange}>
        <option value="en">English</option>
        <option value="ta">Tamil</option>
      </select>
    </div>
  );
};

export default LanguageSelector;
