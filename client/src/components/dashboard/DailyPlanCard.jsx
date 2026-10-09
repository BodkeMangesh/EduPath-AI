import { useState } from "react";
import toast from "react-hot-toast";

import { completeTodayPlan } from "../../services/learningService";

import "./DailyPlanCard.css";

function DailyPlanCard({ dashboard, refreshDashboard }) {
  const [loading, setLoading] = useState(false);

  const plan = dashboard?.dailyPlan;

  const handleComplete = async () => {
    if (!dashboard?.career) {
      toast.error("Career information not found.");
      return;
    }

    try {
      setLoading(true);

      await completeTodayPlan(dashboard.career);

      toast.success("Today's learning plan completed!");

      await refreshDashboard();
    } catch (error) {
      console.error("Complete Today Plan Error:", error);

      toast.error(
        error.response?.data?.message || "Failed to complete today's plan.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-card daily-plan-card">
      <div className="daily-plan-header">
        <span>📅</span>

        <div>
          <h3>Today's Learning Plan</h3>
          <p>Your personalized plan for today</p>
        </div>
      </div>

      <div className="daily-plan-content">
        <ul className="plan-list">
          <li>
            <strong>🎯 Goal</strong>
            <span>{plan?.todayGoal || "Complete today's learning goal."}</span>
          </li>

          <li>
            <strong>⏰ Study Duration</strong>
            <span>{plan?.studyDuration || "Not specified"}</span>
          </li>

          <li>
            <strong>💻 Practice</strong>
            <span>{plan?.practiceTask || "Practice today's topic."}</span>
          </li>

          <li>
            <strong>🚀 Project</strong>
            <span>{plan?.projectTask || "Continue your project."}</span>
          </li>

          <li>
            <strong>📖 Revision</strong>
            <span>
              {plan?.revision || "Revise previously learned concepts."}
            </span>
          </li>

          <li>
            <strong>🔥 Motivation</strong>
            <span>
              {plan?.motivation || "Stay consistent and keep learning."}
            </span>
          </li>
        </ul>
      </div>

      <button className="plan-btn" onClick={handleComplete} disabled={loading}>
        {loading ? "Completing..." : "✓ Mark Today's Plan Complete"}
      </button>
    </div>
  );
}

export default DailyPlanCard;
