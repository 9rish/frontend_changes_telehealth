import React, { useEffect, useState } from "react";
import './patient_dashboard.css';
import { getUser, getVitals } from '../../services/api'; // your api.js methods
import { useNavigate } from "react-router-dom";

export default function PatientDashboard() {
  const [user, setUser] = useState(null);
  const [vitals, setVitals] = useState([]);
  const [showVitalsModal, setShowVitalsModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    async function loadUser() {
      try {
        const data = await getUser(token);
        setUser(data);
        sessionStorage.setItem("user_id", data.id);
      } catch (err) {
        sessionStorage.clear();
        alert("Please login again");
        navigate("/login");
      }
    }

    loadUser();
  }, [navigate]);

  const handleViewVitals = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const data = await getVitals(token);
      setVitals(data);
      setShowVitalsModal(true);
    } catch (err) {
      alert("Error fetching vitals");
      console.error(err);
    }
  };

  const logout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="patient-dashboard">
      <header>
        <h2>Patient Dashboard</h2>
      </header>

      <div className="container">
        <div className="card">
          <h3>Welcome, {user.name}</h3>
          <p>Email: {user.email}</p>
        </div>

        <div className="card">
          <h3>Manage</h3>
          <button onClick={() => navigate("/family_management")}>
            Family Management
          </button>
          <button onClick={() => navigate("/create_appointment")}>
            Create Appointment
          </button>
        </div>

        <div className="card">
          <h3>Chat</h3>
          <button onClick={() => navigate("/chat")}>View My Chats</button>
        </div>

        <div className="card">
          <h3>Vitals</h3>
          <button onClick={handleViewVitals}>View My Vitals</button>
        </div>

        <div className="card">
          <button onClick={logout}>Logout</button>
        </div>
      </div>

      {/* Vitals Modal */}
      {showVitalsModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowVitalsModal(false)}>
              &times;
            </span>
            <h2>My Vitals</h2>
            {vitals.length === 0 ? (
              <p>No vitals found.</p>
            ) : (
              vitals.map((v, i) => (
                <div key={i} className="vital-card">
                  <p><strong>Date:</strong> {v.date || "N/A"}</p>
                  <p><strong>BP:</strong> {v.bp}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
