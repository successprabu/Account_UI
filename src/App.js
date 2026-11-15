import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import "react-toastify/dist/ReactToastify.css";
import "./design/design.css";
import "./design/legacy.css";
import { ToastContainer } from "react-toastify";
import { LanguageProvider } from "./language/LanguageContext";
import { ThemeProvider } from './ThemeProvider';
import { ThemeMui } from './mui/ThemeMui';
import Router from "./Router"; 

function App() {
  return (
    <ThemeProvider>
      <ThemeMui>
        <LanguageProvider>
          <Router />
          <ToastContainer />
        </LanguageProvider>
      </ThemeMui>
    </ThemeProvider>
  );
}

export default App;
