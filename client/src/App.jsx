import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import ProtectedLayout from "./components/ProtectedLayout/ProtectedLayout";

import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import ResetPassword from "./pages/ResetPassword/ResetPassword";
import Register from "./pages/Register/Register";
import Onboarding from "./pages/Onboarding/Onboarding";

import CareerExplorer from "./pages/CareerSxplorer/CareerExplorer";
import CareerSelection from "./pages/CareerSelection/CareerSelection";

import TermsAndConditions from "./pages/TermsAndConditions/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy/PrivacyPolicy";

import Dashboard from "./pages/Dashboard/Dashboard";
import Profile from "./pages/Profile/Profile";
import EditProfile from "./pages/Profile/EditProfile";
import Learning from "./pages/LearningPath/Learning";
import Progress from "./pages/Progress/Progress";
import CareerDiscovery from "./pages/CareerDiscovery/CareerDiscovery";
import Chat from "./pages/Chat/Chat";

import Settings from "./pages/Settings/Settings";
import Roadmap from "./pages/Roadmap/Roadmap";
import SkillAssessment from "./pages/SkillAssessment/SkillAssesment";
import Resources from "./pages/Resources/Resources";
import LearningSession from "./pages/LearningSession/LearningSession";
import Placement from "./pages/Placement/Placement";
import ResumeAnalyzer from "./pages/ResumeAnalyzer/ResumeAnalyzer";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================= PUBLIC ROUTES ================= */}

        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token?" element={<ResetPassword />} />
        <Route path="/onboarding" element={<Onboarding />} />

        <Route path="/career-explorer" element={<CareerExplorer />} />
        <Route path="/career-selection" element={<CareerSelection />} />

        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />

        {/* ================= PROTECTED ROUTES ================= */}

        <Route
          element={
            <ProtectedRoute>
              <ProtectedLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<EditProfile />} />

          <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/learning" element={<Learning />} />
          <Route path="/placement" element={<Placement />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/settings" element={<Settings />} />

          <Route path="/career-discovery" element={<CareerDiscovery />} />
          <Route path="/skill-assessment" element={<SkillAssessment />} />
        </Route>

        {/* Protected chat route */}

        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />

        <Route
          path="/learning-session"
          element={
            <ProtectedRoute>
              <LearningSession />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
