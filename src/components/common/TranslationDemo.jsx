import React, { useState } from 'react';
import '../screen/css/TranslationDemo.css'; // Ensure to import the CSS file
import Translator from './TranslationBasedOnLanguage';

const TranslationDemo = () => {
  const [name, setName] = useState('');
  const [village, setVillage] = useState('');
  const [address, setAddress] = useState('');
  const [translatedText, setTranslatedText] = useState('');

  const handleTranslation = (text) => {
    setTranslatedText(text);
  };

  const handleInputChange = (event, setter) => {
    setter(event.target.value);
  };

  const getInputText = () => {
    // Combine fields into a single string to translate
    return `${name}, ${village}, ${address}`;
  };

  return (
    <div className="container">
      <h1 className="header">Translation Demo</h1>
      
      <div className="form-group">
        <label className="label">Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => handleInputChange(e, setName)}
          placeholder="Enter name"
          className="input-field"
        />
      </div>
      
      <div className="form-group">
        <label className="label">Village:</label>
        <input
          type="text"
          value={village}
          onChange={(e) => handleInputChange(e, setVillage)}
          placeholder="Enter village"
          className="input-field"
        />
      </div>

      <div className="form-group">
        <label className="label">Address:</label>
        <input
          type="text"
          value={address}
          onChange={(e) => handleInputChange(e, setAddress)}
          placeholder="Enter address"
          className="input-field"
        />
      </div>

      <button
        className="button"
        onClick={() => {
          const textToTranslate = getInputText();
          // Trigger translation
          handleTranslation(textToTranslate);
        }}
      >
        Translate
      </button>

      <Translator
        inputText={getInputText()}
        onTranslated={handleTranslation}
        sourceLanguage="en"
        targetLanguage="ta" // Tamil
      />

      <div className="result">
        <h2>Translated Text:</h2>
        <p>{translatedText}</p>
      </div>
    </div>
  );
};

export default TranslationDemo;
