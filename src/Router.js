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
import User from "./components/screen/User";
import FunctionWithList from "./components/screen/FunctionWithList";
import ServicePage from "./components/screen/Services";
import Unauthorized from "./components/common/UnauthorizedAccess";
import ProtectedRoute from "./components/common/ProtectedRoute";
import RoleBasedDashboard from "./components/screen/RoleBasedDashboard";
import ContactUs from "./components/screen/ContactUs";
import Expenses from "./components/screen/Expenses";
import ExpensesList from "./components/screen/list/ExpensesList";
import TranslationDemo from "./components/common/TranslationDemo";
import ReportComponent from "./components/screen/reports/ReportComponent";
import OtherReceipt from "./components/screen/OtherReceipt";
import OthersList from "./components/screen/list/OthersList";
import IncomeReport from "./components/screen/reports/IncomeReport";
import ExpensesReport from "./components/screen/reports/ExpensesReport";
import OthersReport from "./components/screen/reports/OthersReport";
import RegionalSummaryReport from "./components/screen/reports/RegionalSummaryReport";
import OverallSummaryReport from "./components/screen/reports/OverallSummaryReport";
import Handover from "./components/screen/Handover";
import MahalRegistration from "./components/screen/MahalRegistration";
import MahalBooking from "./components/screen/MahalBooking";
import MahalBookingList from "./components/screen/MahalBookingList";

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route path="purchase/:id" element={<Registration />} />
        <Route path="purchase" element={<Registration />} />
        <Route path="mahal-reg" element={<MahalRegistration />} />
        <Route path="contactus" element={<ContactUs />} />
        <Route path="try-translation" element={<TranslationDemo />} />
        <Route index element={<Home />} />
        <Route path="unauthorized" element={<Unauthorized />} />
        <Route path="about" element={<AboutUs />} />
        <Route path="report" element={<ReportComponent />} />
        <Route path="*" element={<PageNotFound />} />

        <Route path="/" element={<Rootlayout />}>
          <Route path="dashboard" element={<RoleBasedDashboard/>} />
          <Route
            path="client-list"
            element={
              <ProtectedRoute allowedRoles={["SU"]}>
                <ClientList />
              </ProtectedRoute>
            }
          />
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
            path="addExpenses"
            element={
              <ProtectedRoute allowedRoles={["SU", "AU", "NU"]}>
                <Expenses />
              </ProtectedRoute>
            }
          />
          <Route
            path="expenses-list"
            element={
              <ProtectedRoute allowedRoles={["SU", "AU", "NU"]}>
                <ExpensesList />
              </ProtectedRoute>
            }
          />
          <Route
            path="others"
            element={
              <ProtectedRoute allowedRoles={["SU", "AU", "NU"]}>
                <OtherReceipt />
              </ProtectedRoute>
            }
          />
          <Route
            path="others-list"
            element={
              <ProtectedRoute allowedRoles={["SU", "AU", "NU"]}>
                <OthersList />
              </ProtectedRoute>
            }
          />
          <Route
            path="function"
            element={
              <ProtectedRoute allowedRoles={["SU", "AU"]}>
                <FunctionWithList />
              </ProtectedRoute>
            }
          />
          <Route
            path="user"
            element={
              <ProtectedRoute allowedRoles={["SU", "AU"]}>
                <User />
              </ProtectedRoute>
            }
          />
          <Route
            path="income-report"
            element={
              <ProtectedRoute allowedRoles={["SU", "AU", "NU"]}>
                <IncomeReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="expenses-report"
            element={
              <ProtectedRoute allowedRoles={["SU", "AU", "NU"]}>
                <ExpensesReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="others-report"
            element={
              <ProtectedRoute allowedRoles={["SU", "AU", "NU"]}>
                <OthersReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="regional-report"
            element={
              <ProtectedRoute allowedRoles={["SU", "AU", "NU"]}>
                <RegionalSummaryReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="summary-report"
            element={
              <ProtectedRoute allowedRoles={["SU", "AU", "NU"]}>
                <OverallSummaryReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="handover"
            element={
              <ProtectedRoute allowedRoles={["SU", "AU", "NU"]}>
                <Handover />
              </ProtectedRoute>
            }
          />
           <Route
            path="mahal-booking"
            element={
              <ProtectedRoute allowedRoles={["MU"]}>
                <MahalBooking />
              </ProtectedRoute>
            }
          />
             <Route
            path="mahal-booking-list"
            element={
              <ProtectedRoute allowedRoles={["MU"]}>
                <MahalBookingList />
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
