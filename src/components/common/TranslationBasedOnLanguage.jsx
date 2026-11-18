// Passes the text through unchanged (the old Google Translate call was removed: it put an API key in the website).
import { useEffect } from 'react';
import PropTypes from 'prop-types';

const Translator = ({
  inputText,
  onTranslated,
  sourceLanguage = 'en',
  targetLanguage = 'ta'
}) => {

  useEffect(() => {
    // Directly return original text without translation
    if (inputText && onTranslated) {
      onTranslated(inputText);
    }
  }, [inputText, onTranslated]);

  return null; // No rendering
};

Translator.propTypes = {
  inputText: PropTypes.string.isRequired,
  onTranslated: PropTypes.func.isRequired,
  sourceLanguage: PropTypes.string,
  targetLanguage: PropTypes.string,
};

export default Translator;