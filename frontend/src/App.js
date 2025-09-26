import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginSignup from './components/login_signup/login_signup';
import PatientDashboard from "./components/patient_dashboard/patient_dashboard";
import DoctorDashboard from './components/doctor_dashboard/doctor_dashboard';
import FamilyManagement from './components/family_management/family_management';
import ChatRoom from './components/chat_room/chat_room';
import Chat from './components/chat/chat';
import FamilyDashboard from './components/family_dashboard/family_dashboard';
import FamilyInvitation from './components/invitation/family_invitation';
import SendFamilyInvite from './components/invitation/send_family_invite';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginSignup />} />
        <Route path="/" element={<PatientDashboard />} />
        <Route path="/family_management" element={<FamilyManagement />} />
        <Route path="/family_dashboard" element={<FamilyDashboard />} />
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/chat-room" element={<ChatRoom />} />
        <Route path="/family/invitations" element={<FamilyInvitation />} />
        <Route path="/family/send-invite" element={<SendFamilyInvite />} />
      </Routes>
    </Router>
  );
}

export default App;
