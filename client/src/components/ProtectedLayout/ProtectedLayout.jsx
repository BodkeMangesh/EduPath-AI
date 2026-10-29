import { useState } from "react";
import { Outlet } from "react-router-dom";

import Navbar from "../Navbar/Navbar";
import Sidebar from "../Sidebar/Sidebar";

function ProtectedLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="app-layout">
      <Navbar
        sidebarOpen={sidebarOpen}
        onSidebarToggle={toggleSidebar}
        onSidebarClose={closeSidebar}
      />

      <Sidebar sidebarOpen={sidebarOpen} onSidebarClose={closeSidebar} />

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}

export default ProtectedLayout;
