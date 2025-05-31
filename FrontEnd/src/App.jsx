//App.jsx
import { Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import About from "./Pages/About";
import Login from "./Pages/Login";
import Chate from "./chate/Chate";
import Friend from "./chate/friend";
import Logout from "./Pages/Logout";
import Signup from "./Pages/Signup";
import Rating from "./public/Rating";
import Contact from "./Pages/Contact";
import HomePage from "./fHome/HomePage";
import VideoCall from "./chate/VideoCall";
import Deposit from "./UserPanal/Deposit";
import AddUser from "./AdminPanal/AddUser";
import Tabesex from "./AdminPanal/Tabesex";
import ReportList from "./public/ReportPage";
import ReportPage from "./public/ReportPage";
import PieChart from "./ManagerPage/PieChart";
import UserList from "./ManagerPage/UserList";
import Feedback from "./ManagerPage/Feedback";
import Dashboard from "./AdminPanal/Dashboard";
import LawyerDetail from "./public/LawyerDetail";
import UpdateProfile from "./public/UpdateProfile";
import ChangePassword from "./UserPanal/ChengePass";
import LawyerPortal from "./components/LawyerPortal";
import UserDashboard from "./UserPanal/UserDashboard";
import BookAppointment from "./Pages/BookAppointment";
import PaymentButton from "./components/PaymentButton";
import LawyerSideBar from "./LawyerPanal/LawyerSideBar";
import ForgotPassword from "./Pages/UserForgotPassword";
import UserManagement from "./AdminPanal/UserManagement";
import LawyerSignup from "./LawyerPanal/LawyerLoginPage";
import ManagerSideBar from "./ManagerPage/ManagerSideBar";
import UserAppointment from "./UserPanal/UserAppointment";
import AskQuestionPage from "./components/AskQuestionPage";
import ManageDocuments from "./ManagerPage/ManageDocuments";
import LawyerDashboard from "./LawyerPanal/LawyerDashboard";
import AdminMessageList from "./AdminPanal/AdminMessageList";
import A_ChangePassword from "./AdminPanal/A_ChangePassword";
import UserDocumentsView from "./UserPanal/UserDocumentsView";
import ManagerDashboard from "./ManagerPage/ManagerDashboard";
import LawyerSignupPage from "./LawyerPanal/LawyerSignupPage";
import LawyerManagement from "./ManagerPage/LawyerManagement";
import LegalArticleForm from "./ManagerPage/LegalArticleForm";
import LawyerAppointment from "./LawyerPanal/LawyerAppointment";
import AppointmentDetail from "./ManagerPage/AppointmentDetail";
import UpdateLawyerProfile from "./LawyerPanal/UpdateLawyerProfile";
import LegalDocumentUpload from "./LawyerPanal/LegalDocumentUpload";
import AppointmentDashboard from "./LawyerPanal/AppointmentDashboard";
import LawyerUnapprovedList from "./ManagerPage/LawyerUnapprovedList";
import ApprovedLawyersToggle from "./AdminPanal/ApprovedLawyersToggle";
import AppointmentManagement from "./ManagerPage/AppointmentManagement";
import LawyerActiveApprovedList from "./public/LawyerActiveApprovedList";
import ManagerAppointmentDetail from "./ManagerPage/ManagerAppointmentDetail";
import PaymentHistoryManagement from "./ManagerPage/PaymentHistoryManagement";
import FethAiSupporte from "./Pages/FethAiSupporte";
import HelpAndLegalGuide from "./components/HelpAndLegalGuide";

function VideoCallWrapper() {
  const location = useLocation();
  const { receiverId, callerId } = location.state || {};
  return <VideoCall receiverId={receiverId} callerId={callerId} />;
}

function App() {
  return (
    <>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/chate" element={<Chate />} />
          <Route path="/FethAiSupporte" element={<FethAiSupporte />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/rating/:id" element={<Rating />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/friend" element={<Friend />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/chat/:id" element={<Chate />} />
          <Route path="/HelpAndLegalGuide" element={<HelpAndLegalGuide />} />
          <Route path="/AddUser" element={<AddUser />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/Deposit" element={<Deposit />} />
          <Route path="/Tabesex" element={<Tabesex />} />
          <Route path="/Userlist" element={<UserList />} />
          <Route path="/Feedback" element={<Feedback />} />
          <Route path="/Piechart" element={<PieChart />} />
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/ReportList" element={<ReportList />} />
          <Route path="/report/:id" element={<ReportPage />} />
          <Route path="/lawyers/:id/rate" element={<Rating />} />
          <Route path="/lawyer/:id" element={<LawyerDetail />} />
          <Route path="/LawyerSignup" element={<LawyerSignup />} />
          <Route path="/LawyerPortal" element={<LawyerPortal />} />
          <Route path="/VideoCall" element={<VideoCallWrapper />} />
          <Route path="/UpdateProfile" element={<UpdateProfile />} />
          <Route path="/LawyerSideBar" element={<LawyerSideBar />} />
          <Route path="/UserDashboard" element={<UserDashboard />} />
          <Route path="/PaymentButton" element={<PaymentButton />} />
          <Route path="/UserManagement" element={<UserManagement />} />
          <Route path="/ChangePassword" element={<ChangePassword />} />
          <Route path="/ForgotPassword" element={<ForgotPassword />} />
          <Route path="/ManagerSideBar" element={<ManagerSideBar />} />
          <Route path="/ManageDocuments" element={<ManageDocuments />} />
          <Route path="/BookAppointment" element={<BookAppointment />} />
          <Route path="/LawyerDashboard" element={<LawyerDashboard />} />
          <Route path="/AskQuestionPage" element={<AskQuestionPage />} />
          <Route path="/UserAppointment" element={<UserAppointment />} />
          <Route path="/AdminMessageList" element={<AdminMessageList />} />
          <Route path="/LegalArticleForm" element={<LegalArticleForm />} />
          <Route path="/ManagerDashboard" element={<ManagerDashboard />} />
          <Route path="/LawyerSignupPage" element={<LawyerSignupPage />} />
          <Route path="/A_ChangePassword" element={<A_ChangePassword />} />
          <Route path="/LawyerManagement" element={<LawyerManagement />} />
          <Route path="/UserDocumentsView" element={<UserDocumentsView />} />
          <Route path="/LawyerAppointment" element={<LawyerAppointment />} />
          <Route
            path="/LegalDocumentUpload"
            element={<LegalDocumentUpload />}
          />
          <Route
            path="/UpdateLawyerProfile"
            element={<UpdateLawyerProfile />}
          />
          <Route
            path="/LawyerUnapprovedList"
            element={<LawyerUnapprovedList />}
          />
          <Route
            path="/AppointmentDashboard"
            element={<AppointmentDashboard />}
          />
          <Route
            path="/AppointmentManagement"
            element={<AppointmentManagement />}
          />
          <Route
            path="/ApprovedLawyersToggle"
            element={<ApprovedLawyersToggle />}
          />
          <Route
            path="/appointments/:appointmentId"
            element={<AppointmentDetail />}
          />
          <Route
            path="/LawyerActiveApprovedList"
            element={<LawyerActiveApprovedList />}
          />
          <Route
            path="/PaymentHistoryManagement"
            element={<PaymentHistoryManagement />}
          />
          <Route
            path="/manager/appointments/:appointmentId"
            element={<ManagerAppointmentDetail />}
          />
        </Routes>
        <ToastContainer />
      </AuthProvider>
      {/* Conditionally render Nave if NOT on Lawyer Dashboard */}
      {/*location.pathname !== "/lawyerdashbord" && <Nave />*/}
    </>
    //const location = useLocation();  Get the current route path
  );
}

export default App;
