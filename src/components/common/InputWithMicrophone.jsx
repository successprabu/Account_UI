import React, { useState, useRef, useEffect } from "react";
import { FormControl, InputGroup, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone, faMicrophoneSlash } from "@fortawesome/free-solid-svg-icons";
import i18n from "../../language/i18n";
import Translator from "./TranslationBasedOnLanguage";

const InputWithMicrophone = ({ name, value, type, onChange, placeholder, error }) => {
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);
  const [fieldBeingTranslated, setFieldBeingTranslated] = useState(null);

  useEffect(() => {
    // Clean up on component unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startRecording = () => {
    setIsRecording(true);
    recognitionRef.current = new window.webkitSpeechRecognition();

    // Set language based on the current i18n language
    const language = i18n.language === 'ta' ? 'ta-IN' : 'en-US';
    recognitionRef.current.lang = language;

    recognitionRef.current.onresult = (event) => {
      onChange({ target: { name, value: event.results[0][0].transcript } });
    };
    recognitionRef.current.onerror = () => {
      stopRecording();
    };
    recognitionRef.current.start();
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ target: { name, value } });


    // Trigger translation if the user stops typing
    if (value.endsWith(" ")) {
      setFieldBeingTranslated(name);
    }
  };

  const handleTranslation = (translatedText) => {
    if (fieldBeingTranslated) {
      onChange({ target: { name: fieldBeingTranslated, value: translatedText } });
      setFieldBeingTranslated(null);
    }
  };

  return (
    <InputGroup>
      <FormControl
        type={type}
        name={name}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
      />
      {/* Translator Component */}
      <Translator
        inputText={value}
        onTranslated={handleTranslation}
        sourceLanguage="en"
        targetLanguage={i18n.language || "en"}
      />
      <Button variant={isRecording ? "danger" : "outline-primary"} onClick={toggleRecording}>
        <FontAwesomeIcon icon={isRecording ? faMicrophoneSlash : faMicrophone} />
      </Button>
      {error && <div className="text-danger">{error}</div>}
    </InputGroup>
  );
};

export default InputWithMicrophone;
