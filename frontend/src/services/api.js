const API_BASE_URL = "http://127.0.0.1:8000";
export { API_BASE_URL };
    
export const login = async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username: email, password: password }), 
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Invalid email or password");
    }
    return res.json();
};

// export const registerPatient = async (payload) => {
//     const res = await fetch(`${API_BASE_URL}/register_patient`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//     });
//     if (!res.ok) {
//         const err = await res.json().catch(() => ({}));
//         throw new Error(err.detail || "Registration failed");
//     }
//     return res.json();
// };
export const registerPatient = async (payload) => {
  const res = await fetch(`${API_BASE_URL}/register_patient`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || JSON.stringify(err));
  }
  return await res.json();
};

export const registerDoctor = async (payload) => {
  const res = await fetch(`${API_BASE_URL}/register_doctor`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || JSON.stringify(err));
  }
  return await res.json();
};

export const registerFamily = async (payload) => {
  const res = await fetch(`${API_BASE_URL}/register_family`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || JSON.stringify(err));
  }
  return await res.json();
};


async function fetchWithErrorHandling(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || `HTTP ${response.status}`);
  }
  return data;
}

// Get available slots for a doctor on a date
export async function getAvailableSlots(doctorId, appDate) {
  const url = `${API_BASE_URL}/available_appointment?doctor_id=${doctorId}&app_date=${appDate}`;
  return await fetchWithErrorHandling(url);
}

// Reserve a slot
export async function reserveSlot(userId, doctorId, appointmentDateTime) {
  const appointment = {
    doctor_id: doctorId,
    appointment_date: appointmentDateTime,
  };
  const url = `${API_BASE_URL}/reserve_slot?user_id=${userId}`;
  return await fetchWithErrorHandling(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(appointment),
  });
}

// Confirm a slot
export async function confirmSlot(userId, doctorId, appointmentDateTime) {
  const appointment = {
    doctor_id: doctorId,
    appointment_date: appointmentDateTime,
  };
  const url = `${API_BASE_URL}/confirm_slot?user_id=${userId}`;
  return await fetchWithErrorHandling(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(appointment),
  });
}

// Cancel a reservation
export async function cancelSlot(userId, doctorId, appointmentDateTime) {
  const url = `${API_BASE_URL}/cancel_slot?doctor_id=${doctorId}&slot_time=${encodeURIComponent(appointmentDateTime)}&user_id=${userId}`;
  return await fetchWithErrorHandling(url, { method: "POST" });
}

export async function getUser(token) {
  const res = await fetch(`${API_BASE_URL}/user/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Unauthorized");
  return await res.json();
}

export async function getVitals(token) {
  const res = await fetch(`${API_BASE_URL}/get_vital`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch vitals");
  return await res.json();
}

export async function createChatRoom(token, name, participant_ids) {
  const res = await fetch(`${API_BASE_URL}/chats/create`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ name, participant_ids }),
  });
  if (!res.ok) throw new Error("Failed to create chat room");
  return res.json();
}

export async function getMyChats(token) {
  const res = await fetch(`${API_BASE_URL}/chats/my`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch chats");
  return res.json();
}

export async function addVitals(token, patient_email, bp) {
  const res = await fetch(`${API_BASE_URL}/add_vital`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ patient_email, bp }),
  });
  if (!res.ok) throw new Error("Failed to add vitals");
  return res.json();
}

export async function getFamilyMembers(token) {
  const res = await fetch(`${API_BASE_URL}/family/get_all_family_members`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch family members");
  return res.json();
}

export async function sendInvitation(token, email, relationship_type) {
  const res = await fetch(`${API_BASE_URL}/family/send_invitation`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, relationship_type }),
  });
  if (!res.ok) throw new Error("Failed to send invitation");
  return res.json();
}

export async function getChatMessages(chatId, token) {
  const res = await fetch(`${API_BASE_URL}/chats/${chatId}/messages`, {
    headers: { Authorization: "Bearer " + token },
  });
  if (!res.ok) throw new Error("Failed to fetch chat messages");
  return res.json();
}

export async function getWsToken(token) {
  const res = await fetch(`${API_BASE_URL}/ws-token`, {
    method: "POST",
    headers: { Authorization: "Bearer " + token },
  });
  if (!res.ok) throw new Error("Failed to fetch websocket token");
  return res.json();
}


export async function getChatRooms(token) {
  const res = await fetch(`${API_BASE_URL}/chats/my`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to get chat rooms");
  return await res.json();
}

export async function getCurrentUser(token) {
  const res = await fetch(`${API_BASE_URL}/user/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch user info");
  return res.json();
}

// Logout (just clearing local/session storage)
export function logoutUser() {
  sessionStorage.clear();
  localStorage.clear();
}

export async function getPendingInvites(token) {
    const res = await fetch(`${API_BASE_URL}/family/family_invitation_for_current_user`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to fetch invitations");
    return res.json();
}

export async function respondInvite(token, inviteToken, action) {
    const res = await fetch(`${API_BASE_URL}/family/respond_invitation`, {
        method: "PUT",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ token: inviteToken, action })
    });
    if (!res.ok) throw new Error("Failed to respond to invitation");
    return res.json();
}

export async function sendFamilyInvite(token, email, relationship) {
    const res = await fetch(`${API_BASE_URL}/family/send_invitation`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ invitee_email: email, relationship_type: relationship })
    });
    if (!res.ok) throw new Error("Failed to send invitation");
    return res.json();
}

const handleResponse = async (res) => {
    if (!res.ok) {
        const errorBody = await res.json().catch(() => ({ detail: res.statusText }));
        const errorMessage = errorBody.detail 
            ? (Array.isArray(errorBody.detail) ? errorBody.detail[0].msg : errorBody.detail) 
            : `HTTP error ${res.status}`;
        throw new Error(errorMessage);
    }
    return res.json();
};

export const getUserMe = async (token) => {
    const res = await fetch(`${API_BASE_URL}/user/me`, {
        headers: { "Authorization": "Bearer " + token }
    });
    return handleResponse(res);
};

export const viewMyChats = async () => {
    const token = sessionStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/chats/my`, {
        headers: { "Authorization": "Bearer " + token }
    });
    return handleResponse(res);
};


export const addPatientVitals = async (patient_email, bp) => {
    const token = sessionStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/add_vital`, {
        method: "POST",
        headers: { 
            "Authorization": "Bearer " + token, 
            "Content-Type": "application/json" 
        },
        body: JSON.stringify({ patient_email, bp })
    });
    return handleResponse(res);
};
