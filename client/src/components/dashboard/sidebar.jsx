import "./Sidebar.css";

function Sidebar() {
  return (
    <aside className="sidebar">
      <ul className="sidebar-menu">
        <li>🏠 Dashboard</li>
        <li>📚 Learning Path</li>
        <li>📝 Assessment</li>
        <li>🤖 AI Mentor</li>
        <li>📈 Progress</li>
        <li>👤 Profile</li>
        <li>⚙️ Settings</li>
      </ul>
    </aside>
  );
}

export default Sidebar;
