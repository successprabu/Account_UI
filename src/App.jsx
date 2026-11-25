import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import "react-toastify/dist/ReactToastify.css";
import "./design/design.css";
import "./design/legacy.css";
import "./design/print.css";
import { ToastContainer } from "react-toastify";
import { LanguageProvider } from "./language/LanguageContext";
import { ThemeProvider } from './ThemeProvider';
import { ThemeMui } from './mui/ThemeMui';
import Router from "./Router"; 
import axios from "axios";
import { watchSession } from "./utils/session";
import { capturePartnerRef } from "./utils/partnerRef";

// An expired login signs out and goes to the login page (any API call that gets 401).
watchSession(axios);
// A partner's signup link (?ref=CODE) is remembered for registration.
capturePartnerRef();

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
