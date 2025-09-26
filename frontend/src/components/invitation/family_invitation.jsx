import React, { useEffect, useState } from "react";
import { getPendingInvites, respondInvite } from "../../services/api";
import './family.css';

export default function FamilyInvitations() {
    const [invites, setInvites] = useState([]);
    const token = sessionStorage.getItem("token");

    const loadInvites = async () => {
        try {
            const data = await getPendingInvites(token);
            setInvites(data);
        } catch (err) {
            console.error(err);
            alert("Failed to load invitations");
        }
    };

    const handleResponse = async (inviteToken, action) => {
        try {
            const res = await respondInvite(token, inviteToken, action);
            alert(res.message);
            loadInvites();
        } catch (err) {
            console.error(err);
            alert("Failed to respond");
        }
    };

    useEffect(() => {
        if (!token) return;
        loadInvites();
    }, [token]);

    return (
        <div className="family-container">
            <h2>Pending Invitations</h2>
            {invites.length === 0 && <p>No pending invitations</p>}
            {invites.map((invite, idx) => (
                <div key={idx} className="invite-card">
                    <p><b>{invite.inviter_name}</b> invited you as <i>{invite.relationship_type}</i></p>
                    <button onClick={() => handleResponse(invite.token, 'accept')}>Accept</button>
                    <button onClick={() => handleResponse(invite.token, 'reject')}>Reject</button>
                </div>
            ))}
        </div>
    );
}
