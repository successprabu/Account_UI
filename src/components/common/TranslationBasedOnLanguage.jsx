import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { GOOGLE_TRANS_API } from './CommonApiURL';


const Translator = ({ inputText, onTranslated, sourceLanguage = 'en', targetLanguage = 'ta' }) => {
  const [isLoading, setIsLoading] = useState(false);

  const translateText = async (text) => {
    setIsLoading(true);
    try {
      const response = await axios.post(GOOGLE_TRANS_API, {
        q: text,
        source: sourceLanguage,
        target: targetLanguage,
      });
      

      const translatedText = response.data.data.translations[0].translatedText;
      onTranslated(translatedText);
    } catch (error) {
      console.error('Error translating text:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (inputText) {
      translateText(inputText);
    }
  }, [inputText]);

  return (
    <div>
      {isLoading && <p>Translating...</p>}
    </div>
  );
};

Translator.propTypes = {
  inputText: PropTypes.string.isRequired,
  onTranslated: PropTypes.func.isRequired,
  sourceLanguage: PropTypes.string,
  targetLanguage: PropTypes.string,
};

export default Translator;
