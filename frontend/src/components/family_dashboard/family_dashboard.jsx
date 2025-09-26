import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFamilyMembers, getCurrentUser, logoutUser } from "../../services/api";
import "./family_dashboard.css";

export default function FamilyDashboard() {
    const [user, setUser] = useState({ name: "", email: "" });
    const [family, setFamily] = useState([]);
    const navigate = useNavigate();
    const token = sessionStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
      }
      
    async function loadData() {
      try {
        const currentUser = await getCurrentUser(token);
        setUser(currentUser);

        const familyMembers = await getFamilyMembers(token);
        setFamily(familyMembers);
      } catch (err) {
        console.error(err);
        alert("Failed to load data");
      }
      }  
      loadData();
      

    async function loadUser() {
      try {
        const data = await getCurrentUser(token);
        setUser(data);
      } catch (err) {
        console.error(err);
        alert("Failed to load user info");
      }
    }

    loadUser();
  }, [token, navigate]);

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <div className="dashboard-page">
      <header>
        <h2>{user.name}'s Family</h2>
      </header>
          <div className="container">
              <h2>Family Members</h2>
              {family.map((member, idx) => (
          <div className="member" key={idx}>
            <p>
              <b>{member.name}</b> is your <i>{member.relationship_type}</i>
            </p>
          </div>
        ))}
        <div className="card">
          <h3>Welcome, {user.name}</h3>
          <p>Email: {user.email}</p>
        </div>
        {family.length === 0 && <p>No family members found.</p>}

        <div className="card">
          <h3>Manage</h3>
          <button onClick={() => navigate("/invitation-response")}>Family Request Response</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </div>
  );
}
