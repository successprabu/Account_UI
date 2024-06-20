import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom";
import Registration from "./components/screen/Registration";
import Home from "./components/screen/Home";
import Rootlayout from "./components/common/Rootlayout";
import Login from "./components/screen/login/Login";
import AboutUs from "./components/screen/AboutUs";
import MailUs from "./components/screen/MailUs";
import CallUs from "./components/screen/CallUs";
import ContactUsLayout from "./components/screen/ContactUsLayout";
import PageNotFound from "./components/screen/PageNotFound";
import ClientList from "./components/screen/list/ClientList";
import Dashboard from "./components/screen/Dashboard";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Rootlayout />}>
      <Route index element={<Home />} />
      <Route path="purchase" element={<Registration />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="purchase:id" element={<Registration />} />
      <Route path="about" element={<AboutUs />} />
      <Route path="contactus" element={<ContactUsLayout />}>
        <Route path="mail-us" element={<MailUs />} /> {/* Nested Route */}
        <Route path="call-us" element={<CallUs />} /> {/* Nested Route */}
      </Route>
      <Route path="client-list" element={<ClientList />} />
      <Route path="login" element={<Login />} />
      <Route path="*" element={<PageNotFound />} />
    </Route>
  )
);

function App() {
  return (
    <>
      <RouterProvider router={router} />      
      <ToastContainer />
    </>
  );
}

export default App;
