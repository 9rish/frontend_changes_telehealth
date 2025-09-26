import React, { useState } from "react";
import { sendFamilyInvite } from "../../services/api";
import './family.css';

export default function SendFamilyInvite() {
    const [email, setEmail] = useState("");
    const [relationship, setRelationship] = useState("");
    const token = sessionStorage.getItem("token");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await sendFamilyInvite(token, email, relationship);
            alert(res.message || "Invitation sent!");
            setEmail("");
            setRelationship("");
        } catch (err) {
            console.error(err);
            alert("Failed to send invitation");
        }
    };

    return (
        <div className="family-container">
            <h2>Invite Family Members</h2>
            <form onSubmit={handleSubmit} className="invite-form">
                <label>Email:</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />

                <label>Relationship:</label>
                <input type="text" value={relationship} onChange={e => setRelationship(e.target.value)} required />

                <button type="submit">Send Invitation</button>
            </form>
        </div>
    );
}
