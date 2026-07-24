import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <h2>🎓 EduPath AI</h2>
      </div>

      <div className="navbar-right">
        <button className="notification-btn">🔔</button>

        <span className="username">Mangesh</span>

        <button className="logout-btn">Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;
