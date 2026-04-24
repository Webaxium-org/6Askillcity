import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import AdmissionRegistration from "./pages/AdmissionRegistration";
import StudentRegistration from "./pages/StudentRegistration";
import Login from "./pages/Auth/Login";
import ScrollToTop from "./components/global/ScrollToTop";
import { ThemeProvider } from "./components/global/ThemeProvider";
import Dashboard from "./pages/Dashboards/Dashboard";
import NotFound from "./pages/Errors/NotFound";
import ServerError from "./pages/Errors/ServerError";
import AddStudent from "./pages/Students/AddStudent";
import ApplicationsPage from "./pages/Students/ApplicationsPage";
import ApplicationDetailPage from "./pages/Students/ApplicationDetailPage";
import EligibilityQueuePage from "./pages/Students/EligibilityQueuePage";
import UniversityManagement from "./pages/UniversityManagement/UniversityManagement";
import PartnerList from "./pages/PartnerManagement/PartnerList";
import PartnerProfile from "./pages/PartnerManagement/PartnerProfile";
import PublicRoute from "./routes/PublicRoute";
import ProtectedRoute from "./routes/ProtectedRoute";
import { SocketProvider } from "./context/SocketContext";
import TicketsPage from "./pages/Tickets/TicketsPage";
import AlertManager from "./components/global/AlertManager";

function App() {
  return (
    <ThemeProvider>
      <SocketProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* 🔓 Public-only — logged-in users are redirected to /dashboard */}
            <Route element={<PublicRoute />}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register-admission-point" element={<AdmissionRegistration />} />
            </Route>

            {/* 🔐 Protected — any authenticated user */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/register-student" element={<StudentRegistration />} />
              <Route path="/dashboard/tickets" element={<TicketsPage />} />

              {/* Partner: Application lifecycle */}
              <Route path="/dashboard/student/add" element={<AddStudent />} />
              <Route path="/dashboard/applications" element={<ApplicationsPage />} />
              <Route path="/dashboard/applications/:id" element={<ApplicationDetailPage />} />

              {/* Admin: Eligibility review queue */}
              <Route path="/dashboard/eligibility-queue" element={<EligibilityQueuePage />} />
              <Route path="/dashboard/university-management" element={<UniversityManagement />} />
              <Route path="/dashboard/partner-management" element={<PartnerList />} />
              <Route path="/dashboard/partner-management/:id" element={<PartnerProfile />} />
            </Route>

            {/* Error Pages */}
            <Route path="/server-error" element={<ServerError />} />
            <Route path="/unauthorized" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <AlertManager />
        </BrowserRouter>
      </SocketProvider>
    </ThemeProvider>
  );
}

export default App;
