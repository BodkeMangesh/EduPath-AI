import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import ProtectedLayout from "./components/ProtectedLayout/ProtectedLayout";

import Dashboard from "./pages/Dashboard/Dashboard";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Profile from "./pages/profile/Profile";
import EditProfile from "./pages/profile/EditProfile";
import Learning from "./pages/LearningPath/Learning";
import Progress from "./pages/Progress/Progress";
import CareerDiscovery from "./pages/CareerDiscovery/CareerDiscovery";
import Chat from "./pages/Chat/Chat";

import Settings from "./pages/Settings/Settings";
import Roadmap from "./pages/Roadmap/Roadmap";
import CareerExplorer from "./pages/CareerSxplorer/CareerExplorer";
import CareerSelection from "./pages/CareerSelection/CareerSelection";
import SkillAssessment from "./pages/SkillAssessment/SkillAssesment";
import Resources from "./pages/Resources/Resources";
import LearningSession from "./pages/LearningSession/LearningSession";
import Placement from "./pages/Placement/Placement";
import ResumeAnalyzer from "./pages/ResumeAnalyzer/ResumeAnalyzer";

import Home from "./pages/Home/Home";
import TermsAndConditions from "./pages/TermsAndConditions/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy/PrivacyPolicy";
import Onboarding from "./pages/Onboarding/Onboarding";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* =========================
            PUBLIC ROUTES
        ========================= */}

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />

        <Route path="/privacy-policy" element={<PrivacyPolicy />} />

        <Route path="/onboarding" element={<Onboarding />} />

        {/* =========================
            PROTECTED ROUTES
            ProtectedLayout contains:
            Navbar + Sidebar + Outlet
        ========================= */}

        <Route
          element={
            <ProtectedRoute>
              <ProtectedLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Profile */}
          <Route path="/profile" element={<Profile />} />

          {/* Edit Profile */}
          <Route path="/profile/edit" element={<EditProfile />} />

          {/* Resume */}
          <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />

          {/* Roadmap */}
          <Route path="/roadmap" element={<Roadmap />} />

          {/* Learning */}
          <Route path="/learning" element={<Learning />} />

          {/* Placement */}
          <Route path="/placement" element={<Placement />} />

          {/* Progress */}
          <Route path="/progress" element={<Progress />} />

          {/* Resources */}
          <Route path="/resources" element={<Resources />} />

          {/* Settings */}
          <Route path="/settings" element={<Settings />} />

          {/* =========================
              EXISTING INTERNAL ROUTES
              Not shown in Sidebar
          ========================= */}

          {/* Career Discovery */}
          <Route path="/career-discovery" element={<CareerDiscovery />} />

          {/* Skill Assessment */}
          <Route path="/skill-assessment" element={<SkillAssessment />} />

          {/* Career Explorer */}
          <Route path="/career-explorer" element={<CareerExplorer />} />

          {/* Career Selection */}
          <Route path="/career-selection" element={<CareerSelection />} />
        </Route>

        {/* =========================
            OTHER EXISTING ROUTES
        ========================= */}

        {/* Learning Session */}
        <Route path="/learning-session" element={<LearningSession />} />

        {/* Chat */}
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
