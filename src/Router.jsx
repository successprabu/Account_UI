import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Rootlayout from "./components/common/Rootlayout";
import Home from "./components/screen/Home";
import PageLoader from "./components/common/PageLoader";
import SupportChat from "./components/public/SupportChat";
// import Registration from "./components/screen/Registration";
// import AboutUs from "./components/screen/AboutUs";
// import PageNotFound from "./components/screen/PageNotFound";
// import ClientList from "./components/screen/list/ClientList";
//import Login from "./components/screen/login/Login";
// import Transaction from "./components/screen/Transaction";
// import TransactionList from "./components/screen/list/TransactionList";
// import User from "./components/screen/User";
// import FunctionWithList from "./components/screen/FunctionWithList";
// import ServicePage from "./components/screen/Services";
// import Unauthorized from "./components/common/UnauthorizedAccess";
// import ProtectedRoute from "./components/common/ProtectedRoute";
// import RoleBasedDashboard from "./components/screen/RoleBasedDashboard";
// import ContactUs from "./components/screen/ContactUs";
// import Expenses from "./components/screen/Expenses";
// import ExpensesList from "./components/screen/list/ExpensesList";
// import TranslationDemo from "./components/common/TranslationDemo";
// import OtherReceipt from "./components/screen/OtherReceipt";
// import OthersList from "./components/screen/list/OthersList";
// import IncomeReport from "./components/screen/reports/IncomeReport";
// import ExpensesReport from "./components/screen/reports/ExpensesReport";
// import OthersReport from "./components/screen/reports/OthersReport";
// import RegionalSummaryReport from "./components/screen/reports/RegionalSummaryReport";
// import OverallSummaryReport from "./components/screen/reports/OverallSummaryReport";
// import Handover from "./components/screen/Handover";
// import MahalRegistration from "./components/screen/MahalRegistration";
// import AddMoitechCustomer from "./components/screen/AddMoitechCustomer";

// Pages are loaded on demand so the first visit only downloads what it shows.
const Login = lazy(() => import("./components/screen/login/Login"));
const Registration = lazy(() =>
  import("./components/screen/Registration")
);
const MahalRegistration = lazy(() =>
  import("./components/screen/MahalRegistration")
);
const ContactUs = lazy(() => import("./components/screen/ContactUs"));
const InProgress = lazy(() => import("./components/screen/InProgress"));
const TranslationDemo = lazy(() =>
  import("./components/common/TranslationDemo")
);
const Unauthorized = lazy(() =>
  import("./components/common/UnauthorizedAccess")
);
const AboutUs = lazy(() => import("./components/screen/AboutUs"));
const PageNotFound = lazy(() =>
  import("./components/screen/PageNotFound")
);
const ClientList = lazy(() =>
  import("./components/screen/list/ClientList")
);
const Transaction = lazy(() =>
  import("./components/screen/Transaction")
);
const TransactionList = lazy(() =>
  import("./components/screen/list/TransactionList")
);
const User = lazy(() => import("./components/screen/User"));
const FunctionWithList = lazy(() =>
  import("./components/screen/FunctionWithList")
);
const ServicePage = lazy(() =>
  import("./components/screen/Services")
);
 const ProtectedRoute = lazy(() =>
  import("./components/common/ProtectedRoute")
);
const RoleBasedDashboard = lazy(() =>
  import("./components/screen/RoleBasedDashboard")
);
const Expenses = lazy(() => import("./components/screen/Expenses"));
const ExpensesList = lazy(() =>
  import("./components/screen/list/ExpensesList")
);
const OtherReceipt = lazy(() =>
  import("./components/screen/OtherReceipt")
);
const OthersList = lazy(() =>
  import("./components/screen/list/OthersList")
);
const IncomeReport = lazy(() =>
  import("./components/screen/reports/IncomeReport")
);
const ExpensesReport = lazy(() =>
  import("./components/screen/reports/ExpensesReport")
);
const OthersReport = lazy(() =>
  import("./components/screen/reports/OthersReport")
);
const RegionalSummaryReport = lazy(() =>
  import("./components/screen/reports/RegionalSummaryReport")
);
const OverallSummaryReport = lazy(() =>
  import("./components/screen/reports/OverallSummaryReport")
);
const Handover = lazy(() => import("./components/screen/Handover"));
const History = lazy(() => import("./components/screen/History"));
const MoiGiven = lazy(() => import("./components/screen/MoiGiven"));
const MahalBookings = lazy(() =>
  import("./components/screen/mahal/MahalBookings")
);
const MyMahals = lazy(() => import("./components/screen/mahal/MyMahals"));
const MahalExpenses = lazy(() => import("./components/screen/mahal/MahalExpenses"));
const MahalStaff = lazy(() => import("./components/screen/mahal/MahalStaff"));
const FindMahal = lazy(() => import("./components/screen/mahal/FindMahal"));
const MahalDetails = lazy(() => import("./components/screen/mahal/MahalDetails"));
const MahalBookingStatus = lazy(() => import("./components/screen/mahal/BookingStatus"));
const AddMoitechCustomer = lazy(() =>
  import("./components/screen/AddMoitechCustomer")
);
 const Pricing = lazy(() =>
  import("./components/screen/PricingPage")
);
const ThemeSettings = lazy(() => import("./components/screen/ThemeSettingsPage"));


const Enquiries = lazy(() => import("./components/screen/enquiries/Enquiries"));
const RegisterClient = lazy(() => import("./components/screen/admin/RegisterClient"));
const DownloadApp = lazy(() => import("./components/screen/DownloadApp"));
const ForgotPassword = lazy(() => import("./components/screen/login/ForgotPassword"));
const UserGuides = lazy(() => import("./components/screen/UserGuide"));
const UserGuidePage = lazy(() => import("./components/screen/UserGuide").then((m) => ({ default: m.UserGuidePage })));
const DesignSystem = lazy(() => import("./components/screen/DesignSystem"));
const Resume = lazy(() => import("./components/screen/AntonyResume/Resume"));

const Router = () => {
  return (
    <BrowserRouter>
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="purchase/:id" element={<Registration />} />
        <Route path="purchase" element={<Registration />} />
        <Route path="mahal-reg" element={<MahalRegistration />} />
        <Route path="download-app" element={<DownloadApp />} />
        <Route path="user-guide" element={<UserGuides />} />
        <Route path="user-guide/:id" element={<UserGuidePage />} />
        <Route path="mahals" element={<FindMahal />} />
        <Route path="mahals/status" element={<MahalBookingStatus />} />
        <Route path="mahals/:id" element={<MahalDetails />} />
        <Route path="contactus" element={<ContactUs />} />
        <Route path="inprogress" element={<InProgress />} />
        <Route path="services/purchase" element={<Registration />} />
        <Route path="services/mahal-reg" element={<MahalRegistration />} />
        <Route path="services/inprogress" element={<InProgress />} />
        <Route path="services/contactus" element={<ContactUs />} />
        <Route path="try-translation" element={<TranslationDemo />} />
        <Route index element={<Home />} />
        <Route path="unauthorized" element={<Unauthorized />} />
        <Route path="about" element={<AboutUs />} />
        <Route path="design-system" element={<DesignSystem />} />
        <Route path="*" element={<PageNotFound />} />

        <Route path="/" element={<Rootlayout />}>
          <Route path="dashboard" element={<RoleBasedDashboard />} />
          <Route
            path="client-list"
            element={
              <ProtectedRoute allowedRoles={["SU"]}>
                <ClientList />
              </ProtectedRoute>
            }
          />
          <Route
            path="register-client"
            element={
              <ProtectedRoute allowedRoles={["SU"]}>
                <RegisterClient />
              </ProtectedRoute>
            }
          />
          <Route
            path="enquiries"
            element={
              <ProtectedRoute allowedRoles={["SU"]}>
                <Enquiries />
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
            path="moi-given"
            element={
              <ProtectedRoute allowedRoles={["SU", "AU"]}>
                <MoiGiven />
              </ProtectedRoute>
            }
          />
          <Route
            path="history"
            element={
              <ProtectedRoute allowedRoles={["SU", "AU"]}>
                <History />
              </ProtectedRoute>
            }
          />
          <Route
            path="mahal-bookings"
            element={
              <ProtectedRoute allowedRoles={["SU","MU","MS"]}>
                <MahalBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="my-mahals"
            element={
              <ProtectedRoute allowedRoles={["SU","MU"]}>
                <MyMahals />
              </ProtectedRoute>
            }
          />
          {/* Old addresses of the mahal screens */}
          <Route
            path="mahal-expenses"
            element={
              <ProtectedRoute allowedRoles={["SU","MU","MS"]}>
                <MahalExpenses />
              </ProtectedRoute>
            }
          />
          <Route
            path="mahal-staff"
            element={
              <ProtectedRoute allowedRoles={["MU"]}>
                <MahalStaff />
              </ProtectedRoute>
            }
          />
          <Route path="add-new-mahal" element={<Navigate to="/my-mahals?new=1" replace />} />
          <Route path="mahal-booking" element={<Navigate to="/mahal-bookings?new=1" replace />} />
          <Route path="mahal-booking-list" element={<Navigate to="/mahal-bookings" replace />} />
          <Route
            path="add-moitech-customer"
            element={
              <ProtectedRoute allowedRoles={["SU","MU"]}>
                <AddMoitechCustomer />
              </ProtectedRoute>
            }
          />
          <Route path="services" element={<ServicePage />} />
          <Route path="pricing" element={<Pricing/>} />
          <Route path="settings" element={<ThemeSettings/>} />
          <Route path="antony-resume" element={<Resume />} />
          <Route path="*" element={<PageNotFound />} />
        </Route>
      </Routes>
      </Suspense>
      <SupportChat />
    </BrowserRouter>
  );
};

export default Router;
