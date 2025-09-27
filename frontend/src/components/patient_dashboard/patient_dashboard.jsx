import React, { useEffect, useState } from "react";
import './patient_dashboard.css';
import { getUser, getVitals, getAllAppointments, getFamilyMembers } from '../../services/api';
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function PatientDashboard() {
  const [user, setUser] = useState(null);
  const [vitals, setVitals] = useState([]);
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    totalAppointments: 0,
    upcomingAppointments: 0,
    familyMembers: 0,
    vitalsRecords: 0
  });
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

    async function loadDashboardData() {
      try {
        const token = sessionStorage.getItem("token");
        
        // Load vitals for charts
        const vitalsData = await getVitals(token);
        setVitals(vitalsData);

        // Load appointments data
        const appointmentsData = await getAllAppointments();
        
        // Load family members data
        const familyData = await getFamilyMembers(token);
        
        // Calculate upcoming appointments (assuming appointments have a date field)
        const today = new Date();
        const upcomingCount = appointmentsData.filter(apt => {
          const aptDate = new Date(apt.date || apt.appointment_date || apt.scheduled_date);
          return aptDate >= today;
        }).length;

        setDashboardStats({
          totalAppointments: appointmentsData.length,
          upcomingAppointments: upcomingCount,
          familyMembers: familyData.length,
          vitalsRecords: vitalsData.length
        });
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        // Set default values if API calls fail
        setDashboardStats({
          totalAppointments: 0,
          upcomingAppointments: 0,
          familyMembers: 0,
          vitalsRecords: vitals.length
        });
      }
    }

    loadUser();
    loadDashboardData();
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

  // Prepare chart data from vitals
  const chartData = vitals.map((vital, index) => {
    let systolic = 0;
    let diastolic = 0;
    
    // Handle different BP data formats
    if (vital.bp && typeof vital.bp === 'string' && vital.bp.includes('/')) {
      const bpParts = vital.bp.split('/');
      systolic = parseInt(bpParts[0]) || 0;
      diastolic = parseInt(bpParts[1]) || 0;
    } else if (vital.bp && typeof vital.bp === 'number') {
      systolic = vital.bp;
    } else if (vital.systolic && vital.diastolic) {
      // If BP is stored as separate fields
      systolic = parseInt(vital.systolic) || 0;
      diastolic = parseInt(vital.diastolic) || 0;
    }

    return {
      date: vital.date || vital.created_at || `Day ${index + 1}`,
      systolic: systolic,
      diastolic: diastolic,
      bp: systolic
    };
  });

  if (!user) return <div className="loading">Loading...</div>;

  return (
    <div className="patient-dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <h2>TELEHEALTH</h2>
        </div>
        <nav className="nav-menu">
          <div className="nav-item active">
            <span className="nav-icon">📊</span>
            Dashboard
          </div>
          <div className="nav-item" onClick={() => navigate("/create_appointment")}>
            <span className="nav-icon">📅</span>
            Appointments
          </div>
          <div className="nav-item" onClick={() => navigate("/family_management")}>
            <span className="nav-icon">👥</span>
            Family
          </div>
          <div className="nav-item" onClick={() => navigate("/chat")}>
            <span className="nav-icon">💬</span>
            Chat
          </div>
          <div className="nav-item" onClick={handleViewVitals}>
            <span className="nav-icon">❤️</span>
            Vitals
          </div>
          <div className="nav-item" onClick={logout}>
            <span className="nav-icon">🚪</span>
            Logout
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-header">
          <h1>DASHBOARD</h1>
          <div className="header-right">
            <span className="user-info">Welcome, {user.name}</span>
            <div className="user-avatar">{user.name?.charAt(0)}</div>
          </div>
        </header>

        {/* Metrics Cards */}
        <div className="metrics-grid">
          <div className="metric-card appointments">
            <div className="metric-header">
              <h3>APPOINTMENTS</h3>
              <span className="metric-icon">📅</span>
            </div>
            <div className="metric-value">{dashboardStats.totalAppointments}</div>
          </div>

          <div className="metric-card family">
            <div className="metric-header">
              <h3>FAMILY MEMBERS</h3>
              <span className="metric-icon">👥</span>
            </div>
            <div className="metric-value">{dashboardStats.familyMembers}</div>
          </div>

          <div className="metric-card upcoming">
            <div className="metric-header">
              <h3>UPCOMING</h3>
              <span className="metric-icon">⏰</span>
            </div>
            <div className="metric-value">{dashboardStats.upcomingAppointments}</div>
          </div>

          <div className="metric-card vitals">
            <div className="metric-header">
              <h3>VITALS</h3>
              <span className="metric-icon">❤️</span>
            </div>
            <div className="metric-value">{dashboardStats.vitalsRecords}</div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-grid">
          <div className="chart-card">
            <h3>Blood Pressure Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    color: '#E5E7EB'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="systolic" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  name="Systolic"
                />
                <Line 
                  type="monotone" 
                  dataKey="diastolic" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Diastolic"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Vitals Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    color: '#E5E7EB'
                  }} 
                />
                <Bar dataKey="bp" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>

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