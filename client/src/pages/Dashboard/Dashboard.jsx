import { useEffect, useState } from "react";
import { getDashboard } from "../../services/dashboardService";

import "../../pages/Dashboard/Dashboard.css";

import Sidebar from "../../components/dashboard/Sidebar";
import WelcomeCard from "../../components/dashboard/WelcomeCard";
import ProgressCard from "../../components/dashboard/ProgressCard";
import TodayTaskCard from "../../components/dashboard/TodayTaskCard";
import ReadinessCard from "../../components/dashboard/ReadinessCard";
import MentorCard from "../../components/dashboard/MentorCard";
import DailyPlanCard from "../../components/dashboard/DailyPlanCard";
import ResourcesCard from "../../components/dashboard/ResourcesCard";
import Footer from "../../components/dashboard/Footer";

import PomodoroTimer from "../../components/pomodoro/PomodoroTimer";

function Dashboard() {
  console.log("Dashboard component rendered");

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("useEffect running");
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    console.log("loadDashboard started");
    const token = localStorage.getItem("token");

    try {
      const data = await getDashboard("full-stack");
      console.log("Dashboard Data:", data);
      console.log(token);
      setDashboard(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <h2>Loading...</h2>;
  return (
    <>
      <div className="dashboard-container">
        <Sidebar />
        <div className="dashboard-content">
          <WelcomeCard dashboard={dashboard} />

          <div className="dashboard-grid">
            <PomodoroTimer
              dashboard={dashboard}
              refreshDashboard={loadDashboard}
            />
            <ProgressCard
              dashboard={dashboard}
              refreshDashboard={loadDashboard}
            />
            <TodayTaskCard dashboard={dashboard} />

            <ReadinessCard dashboard={dashboard} />
            <MentorCard dashboard={dashboard} />

            <DailyPlanCard
              dashboard={dashboard}
              refreshDashboard={loadDashboard}
            />
            <ResourcesCard dashboard={dashboard} />
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
