import { BrowserRouter, Routes, Route } from "react-router-dom";

import AppRoutes from "./routes/AppRoutes";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import ProtectedLayout from "./components/ProtectedLayout/ProtectedLayout";

import Dashboard from "./pages/dashboard/Dashboard";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Profile from "./pages/profile/Profile";
import EditProfile from "./pages/profile/EditProfile";
import Learning from "./pages/LearningPath/Learning";
import Progress from "./pages/Progress/Progress";
import CareerDiscovery from "./pages/CareerDiscovery/CareerDiscovery";
import Chat from "./pages/Chat/Chat";
import SkillAssessment from "./pages/SkillAssessment/SkillAssesment";
import Navbar from "./components/Navbar/Navbar";
import Settings from "./pages/Settings/Settings";
import Roadmap from "./pages/Roadmap/Roadmap";
import Resources from "./pages/Resources/Resources";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* =========================
            PUBLIC ROUTES
        ========================= */}

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/settings" element={<Settings />} />

        {/* =========================
            PROTECTED ROUTES
            Navbar will appear here
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

          {/* Learning */}
          <Route path="/learning" element={<Learning />} />

          {/* Progress */}
          <Route path="/progress" element={<Progress />} />

          {/* Career Discovery */}
          <Route path="/career-discovery" element={<CareerDiscovery />} />

          {/* Settings  */}
          <Route path="/settings" element={<Settings />} />

          {/* Skill Assessment */}
          <Route path="/skill-assessment" element={<SkillAssessment />} />

          {/* Roadmap */}
          <Route path="/roadmap" element={<Roadmap />} />

          {/* Resources */}
          <Route path="/resources" element={<Resources />} />
        </Route>

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
