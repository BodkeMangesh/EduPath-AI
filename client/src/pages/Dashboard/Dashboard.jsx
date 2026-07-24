import { useEffect, useState } from "react";
import { getDashboard } from "../../services/dashboardService";

import "../../pages/Dashboard/Dashboard.css";
import Navbar from "../../components/dashboard/Navbar";
import Sidebar from "../../components/dashboard/Sidebar";
import WelcomeCard from "../../components/dashboard/WelcomeCard";
import ProgressCard from "../../components/dashboard/ProgressCard";
import TodayTaskCard from "../../components/dashboard/TodayTaskCard";
import ReadinessCard from "../../components/dashboard/ReadinessCard";
import MentorCard from "../../components/dashboard/MentorCard";
import DailyPlanCard from "../../components/dashboard/DailyPlanCard";
import ResourcesCard from "../../components/dashboard/ResourcesCard";
import Footer from "../../components/dashboard/Footer";

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

    try {
      const data = await getDashboard("full-stack");
      console.log("Dashboard Data:", data);
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
      <Navbar />

      <div className="dashboard-container">
        <Sidebar />

        <div className="dashboard-content">
          <WelcomeCard dashboard={dashboard} />

          <div className="dashboard-grid">
            <ProgressCard dashboard={dashboard} refreshDashboard={loadDashboard}/>
            <TodayTaskCard />

            <ReadinessCard />
            <MentorCard />

            <DailyPlanCard />
            <ResourcesCard />
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
