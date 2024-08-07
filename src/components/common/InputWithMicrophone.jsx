import React, { useState, useRef } from "react";
import { FormControl, InputGroup, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone, faMicrophoneSlash } from "@fortawesome/free-solid-svg-icons";
import i18n from "../../language/i18n";

const InputWithMicrophone = ({ name, value,type, onChange, placeholder, error }) => {
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  const startRecording = () => {
    setIsRecording(true);
    recognitionRef.current = new window.webkitSpeechRecognition();
    
    // Set language based on the current i18n language
    const language = i18n.language === 'ta' ? 'ta-IN' : 'en-US';
    recognitionRef.current.lang = language;
    
    recognitionRef.current.onresult = (event) => {
      onChange({ target: { name, value: event.results[0][0].transcript } });
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




  return (
    <InputGroup>
      <FormControl
       type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      <Button variant={isRecording ? "danger" : "outline-primary"} onClick={toggleRecording}>
        <FontAwesomeIcon icon={isRecording ? faMicrophoneSlash : faMicrophone} />
      </Button>
      {error && <div className="text-danger">{error}</div>}
    </InputGroup>
  );
};

export default InputWithMicrophone;
