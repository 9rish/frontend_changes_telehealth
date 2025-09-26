import React, { useEffect, useState } from "react";
import "./family_management.css";
import { getFamilyMembers, sendInvitation } from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function FamilyManagement() {
  const [family, setFamily] = useState([]);
  const [email, setEmail] = useState("");
  const [relationship, setRelationship] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    loadFamily();
  }, [navigate]);

  const loadFamily = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const data = await getFamilyMembers(token);
      setFamily(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load family members");
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email || !relationship) {
      alert("Please fill in all fields");
      return;
    }
    try {
      const token = sessionStorage.getItem("token");
      const data = await sendInvitation(token, email, relationship);
      alert(data.msg || "Invitation sent!");
      setEmail("");
      setRelationship("");
      loadFamily();
    } catch (err) {
      console.error(err);
      alert("Failed to send invitation");
    }
  };

  return (
    <div className="family-management">
      <h2>Family Management</h2>

      <div className="section">
        <h3>Your Family Members</h3>
        {family.length === 0 ? (
          <p>No family members yet.</p>
        ) : (
          family.map((member) => (
            <div className="card" key={member.id}>
              <b>{member.name}</b> — {member.relationship_type}
            </div>
          ))
        )}
      </div>

      <div className="section">
        <h3>Send Invitation</h3>
        <form onSubmit={handleInvite}>
          <label>Email of family member:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label>Relationship:</label>
          <input
            type="text"
            value={relationship}
            onChange={(e) => setRelationship(e.target.value)}
            required
          />
          <button type="submit">Send Invitation</button>
        </form>
      </div>
    </div>
  );
}
