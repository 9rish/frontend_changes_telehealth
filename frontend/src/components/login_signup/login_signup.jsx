import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import './login_signup.css';
import { login, registerPatient, getCurrentUser, registerDoctor, registerFamily } from '../../services/api';
import emailIcon from '../assets/email.png';
import passwordIcon from '../assets/password.png';
import certificate from '../assets/certificate.png';
import userIcon from '../assets/user.png';
import DOB from '../assets/date-of-birth.png';

const LoginSignup = () => {
    const [action, setAction] = useState("Login");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [dob, setDob] = useState(""); // Only for SignUp
    const [role, setRole] = useState(""); // New role state
    const [errorMsg, setErrorMsg] = useState("");
    const navigate = useNavigate();
    const [medicalLicense, setMedicalLicense] = useState("");

    const handleLogin = async () => {
        setErrorMsg("");
        try {
            const data = await login(email, password);

            sessionStorage.setItem("token", data.access_token);
            sessionStorage.setItem("role", data.role);
            sessionStorage.setItem("user_id", data.user_id);

            const user = await getCurrentUser(data.access_token);
            sessionStorage.setItem("user_name", user.name);
            sessionStorage.setItem("user_email", user.email);

            // Redirect based on role
            if (data.role === "doctor") navigate("/doctor-dashboard");
            else if (data.role === "patient") navigate("/");
            else if (data.role === "family") navigate("/family-dashboard");
            else navigate("/login"); // fallback
        } catch (err) {
            console.error(err);
            setErrorMsg(err.message);
        }
    };

    const handleSignUp = async () => {
    setErrorMsg("");

    if (!name || !email || !password || !dob || !role) {
        setErrorMsg("All fields are required");
        return;
    }

    // NEW: Doctor-specific validation
    if (role === "doctor" && !medicalLicense) {
        setErrorMsg("Doctor registration requires a medical license number.");
        return;
    }

    try {
        let payload = {
            name,
            email,
            password,
            date_of_birth: dob // Correctly snake_case for backend
        };

        if (role === "patient") {
            await registerPatient(payload);
        } else if (role === "doctor") {
            // NEW: Add the required field to the payload
            payload = {
                ...payload,
                medical_license: medicalLicense // Must match the backend schema field name
            };
            await registerDoctor(payload);
        } else if (role === "family") {
            await registerFamily(payload);
        }

        alert("SignUp successful! Please login.");
        setAction("Login");
    } catch (err) {
        console.error(err);
        // IMPROVED error handling (assuming api.js uses Axios or returns a standard Error object)
        const errorDetail = err.response?.data?.detail?.[0]?.msg || err.message || JSON.stringify(err);
        setErrorMsg(`Registration failed: ${errorDetail}`);
    }
};


    const handleSubmit = () => {
        if (action === "Login") handleLogin();
        else handleSignUp();
    };

    return (
        <div className='container'>
            <div className="header">
                <div className="text">{action}</div>
                <div className="underline"></div>
            </div>

            <div className="inputs">
                {action === "SignUp" && (
                    <>
                        <div className="input">
                            <img src={userIcon} alt="" />
                            <input 
                                type="text" 
                                placeholder='Name' 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                            />
                        </div>
                        <div className="input">
                            <img src={DOB} alt="" />
                            <input 
                                type="date" 
                                value={dob} 
                                onChange={(e) => setDob(e.target.value)} 
                            />
                        </div>
                        <div className="input">
                            <select value={role} onChange={(e) => setRole(e.target.value)}>
                                <option value="">Select Role</option>
                                <option value="patient">Patient</option>
                                <option value="doctor">Doctor</option>
                                <option value="family">Family</option>
                            </select>
                        </div>
                        {role === "doctor" && (
                            <div className="input">
                                <img src={certificate} alt="" /> {/* Use an appropriate icon */}
                                <input 
                                    type="text" 
                                    placeholder='Medical License Number' 
                                    value={medicalLicense} 
                                    onChange={(e) => setMedicalLicense(e.target.value)} 
                                />
                            </div>
                        )}
                    </>
                )}

                <div className="input">
                    <img src={emailIcon} alt="" />
                    <input 
                        type="email" 
                        placeholder='Email id' 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                    />
                </div>

                <div className="input">
                    <img src={passwordIcon} alt="" />
                    <input 
                        type="password" 
                        placeholder='Password' 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                    />
                </div>
            </div>

            {action === "Login" && (
                <div className="forgot-password">
                    Lost Password? <span>Click Here</span>
                </div>
            )}

            {errorMsg && <p className="error">{errorMsg}</p>}

            <div className="switch-action">
                {action === "Login" ? (
                    <p>
                        Don't have an account? <span onClick={() => setAction("SignUp")}>SignUp</span>
                    </p>
                ) : (
                    <p>
                        Already have an account? <span onClick={() => setAction("Login")}>Login</span>
                    </p>
                )}
            </div>

            <div className="submit-container">
                <div className="submit" onClick={handleSubmit}>
                    {action}
                </div>
            </div>
        </div>
    );
};

export default LoginSignup;
