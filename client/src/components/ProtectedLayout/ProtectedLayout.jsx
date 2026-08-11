import { Outlet } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
function ProtectedLayout() {
  return (
    <div className="app-layout">
      <Navbar />

      {/* <Sidebar /> */}

      <main className="app-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default ProtectedLayout;
