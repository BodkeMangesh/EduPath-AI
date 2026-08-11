import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:5000/api/v1/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        console.log("USER DATA:", data);

        setUser(data.data.user);
      } catch (err) {
        console.log(err);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (!user) return <h2>Loading...</h2>;

  return (
    <div style={{ padding: "30px" }}>
      <h1>Dashboard 🚀</h1>

      <div style={{ marginTop: "20px" }}>
        <p>
          <b>Email:</b> {user.email}
        </p>
        <p>
          <b>User ID:</b> {user._id}
        </p>
      </div>

      <button
        onClick={handleLogout}
        style={{
          marginTop: "20px",
          padding: "10px",
          background: "red",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </div>
  );
}

export default Dashboard;
