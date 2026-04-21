import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import AdmissionRegistration from "./pages/AdmissionRegistration";
import StudentRegistration from "./pages/StudentRegistration";
import Login from "./pages/Auth/Login";
import ScrollToTop from "./components/global/ScrollToTop";
import { ThemeProvider } from "./components/global/ThemeProvider";
import UserDashboard from "./pages/Dashboards/UserDashboard";
import PartnerDashboard from "./pages/Dashboards/PartnerDashboard";
import NotFound from "./pages/Errors/NotFound";
import ServerError from "./pages/Errors/ServerError";
import AddStudent from "./pages/Students/AddStudent";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/register-admission-point"
            element={<AdmissionRegistration />}
          />
          <Route
            path="/register-student"
            element={<StudentRegistration />}
          />
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/partner-dashboard" element={<PartnerDashboard />} />
          <Route
            path="/partner-dashboard/student/add"
            element={<AddStudent />}
          />

          {/* Error Pages */}
          <Route path="/server-error" element={<ServerError />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
