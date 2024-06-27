import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { LanguageProvider } from "./language/LanguageContext";
import Router from "./Router"; 

function App() {
  return (
    <LanguageProvider>
      <Router />
      <ToastContainer />
    </LanguageProvider>
  );
}

export default App;
