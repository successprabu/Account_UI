import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Rootlayout from "./components/common/Rootlayout";
import Home from "./components/screen/Home";
import Registration from "./components/screen/Registration";
import AboutUs from "./components/screen/AboutUs";
import PageNotFound from "./components/screen/PageNotFound";
import ClientList from "./components/screen/list/ClientList";
import Login from "./components/screen/login/Login";
import Transaction from "./components/screen/Transaction";
import TransactionList from "./components/screen/list/TransactionList";
import TransactionWoHistory from "./components/screen/TransactionWoHistory";
import User from "./components/screen/User";
import FunctionWithList from "./components/screen/FunctionWithList";
import ServicePage from "./components/screen/Services";
import Unauthorized from "./components/common/UnauthorizedAccess";
import ProtectedRoute from "./components/common/ProtectedRoute";
import RoleBasedDashboard from "./components/screen/RoleBasedDashboard ";
import ContactUs from "./components/screen/ContactUs";

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Rootlayout />}>        
          <Route index element={<Home />} />
          <Route path="purchase" element={<Registration />} />
          <Route path="contactus" element={<ContactUs />} />
          <Route
            path="dashboard"
            element={<RoleBasedDashboard/> }
          />
          <Route path="purchase:id" element={<Registration />} />
          <Route path="about" element={<AboutUs />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route
            path="client-list"
            element={
              <ProtectedRoute allowedRoles={["SU"]}>
                <ClientList />
              </ProtectedRoute>
            }
          />

          <Route path="login" element={<Login />} />
          <Route
            path="transaction"
            element={
              <ProtectedRoute allowedRoles={["SU", "AU", "NU"]}>
                <Transaction />
              </ProtectedRoute>
            }
          />
          <Route
            path="transaction-list"
            element={
              <ProtectedRoute allowedRoles={["SU", "AU", "NU"]}>
                <TransactionList />
              </ProtectedRoute>
            }
          />
          <Route
            path="transaction-wo-history"
            element={
              <ProtectedRoute allowedRoles={["SU", "AU", "NU"]}>
                <TransactionWoHistory />
              </ProtectedRoute>
            }
          />
          <Route path="function"  
            element={
              <ProtectedRoute allowedRoles={["SU", "AU"]}>
                <FunctionWithList />
              </ProtectedRoute>
            }
          />
          <Route path="user" 
             element={
              <ProtectedRoute allowedRoles={["SU", "AU"]}>
                <User/>
              </ProtectedRoute>
            }
          />
          <Route path="services" element={<ServicePage />} />
          <Route path="*" element={<PageNotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
