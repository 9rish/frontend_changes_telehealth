import React, { useEffect, useState } from "react";
import "./family_management.css";
import { getFamilyMembers, sendFamilyInvite } from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function FamilyManagement() {
  const [family, setFamily] = useState([]);
  const [email, setEmail] = useState("");
  // Initialize relationship with a default/first option
  const [relationship, setRelationship] = useState("spouse"); 
  const navigate = useNavigate();

  // Define the list of allowed relationships
  const relationshipOptions = ['spouse', 'sibling', 'parent', 'child', 'other'];

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
    // Validate email and ensure relationship is selected (should be true since 'spouse' is default)
    if (!email || !relationship) { 
      alert("Please fill in all fields");
      return;
    }
    try {
      const token = sessionStorage.getItem("token");
      const data = await sendFamilyInvite(token, email, relationship);
      alert(data.msg || "Invitation sent!");
      setEmail("");
      setRelationship(relationshipOptions[0]); // Reset to the first option after success
      loadFamily();
    } catch (err) {
      console.error(err);
      // Enhanced error message if the API provides it
      const errorMessage = err.message || "Failed to send invitation";
      alert(errorMessage); 
    }
  };

  return (
    <div className="family-management">
      <h2>Family Management</h2>
      {/* --- Your Family Members Section --- */}
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

      {/* --- Send Invitation Section with Dropdown --- */}
      <div className="section">
        <h3>Send Invitation</h3>
        <form onSubmit={handleInvite}>
          <label htmlFor="invite-email">Email of family member:</label>
          <input
            id="invite-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <label htmlFor="relationship-select">Relationship:</label>
          <select
            id="relationship-select"
            value={relationship}
            onChange={(e) => setRelationship(e.target.value)}
            required
          >
            {/* Map through the predefined relationship options */}
            {relationshipOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt.charAt(0).toUpperCase() + opt.slice(1)} {/* Capitalize first letter for display */}
              </option>
            ))}
          </select>

          <button type="submit">Send Invitation</button>
        </form>
      </div>
    </div>
  );
}