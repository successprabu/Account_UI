
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Rootlayout from "./components/common/Rootlayout";
import Home from "./components/screen/Home";
import Registration from "./components/screen/Registration";
import Dashboard from "./components/screen/Dashboard";
import AboutUs from "./components/screen/AboutUs";
import MailUs from "./components/screen/MailUs";
import CallUs from "./components/screen/CallUs";
import ContactUsLayout from "./components/screen/ContactUsLayout";
import PageNotFound from "./components/screen/PageNotFound";
import ClientList from "./components/screen/list/ClientList";
import Login from "./components/screen/login/Login";

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Rootlayout />}>
          <Route index element={<Home />} />
          <Route path="purchase" element={<Registration />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="purchase:id" element={<Registration />} />
          <Route path="about" element={<AboutUs />} />
          <Route path="contactus" element={<ContactUsLayout />}>
            <Route path="mail-us" element={<MailUs />} />
            <Route path="call-us" element={<CallUs />} />
          </Route>
          <Route path="client-list" element={<ClientList />} />
          <Route path="login" element={<Login />} />
          <Route path="*" element={<PageNotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
