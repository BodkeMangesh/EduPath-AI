import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { saveStudySession } from "../../services/dashboardService";
import "./PomodoroTimer.css";

function PomodoroTimer({ dashboard, refreshDashboard }) {
  const STUDY_TIME = 25 * 60;

  const [timeLeft, setTimeLeft] = useState(STUDY_TIME);
  const [isRunning, setIsRunning] = useState(false);

  // Save completed study session
  const handleSessionComplete = async () => {
    try {
      await saveStudySession({
        duration: 25,
        topic: dashboard?.nextMilestone || "General Study",
        careerId: dashboard?.career || "full-stack",
      });

      toast.success("Study Session Saved!");

      if (refreshDashboard) {
        refreshDashboard();
      }
    } catch (error) {
      console.error(error);
      toast.error("Unable to save study session.");
    }
  };

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsRunning(false);

          // Save session after completion
          handleSessionComplete();

          return STUDY_TIME;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning]);

  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  return (
    <div className="pomodoro-card">
      <h3>⏱ Pomodoro Timer</h3>

      <h1 className="pomodoro-time">{formatTime()}</h1>

      <div className="pomodoro-controls">
        <button
          className="pomodoro-btn"
          onClick={() => setIsRunning(true)}
          disabled={isRunning}
        >
          ▶ Start
        </button>

        <button className="pomodoro-btn" onClick={() => setIsRunning(false)}>
          ⏸ Pause
        </button>

        <button
          className="pomodoro-btn"
          onClick={() => {
            setIsRunning(false);
            setTimeLeft(STUDY_TIME);
          }}
        >
          🔄 Reset
        </button>
      </div>
    </div>
  );
}

export default PomodoroTimer;
