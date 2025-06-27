"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import './sign.css';
import pic1 from "../images/Synchora.jpg";
import axios from 'axios';

const page = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const checkUsernameAvailability = async (username) => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/sign/signup/', {
        params: { username },
      });
      if (response.data.message) {
        return true; // Username is available
      }
    } catch (error) {
      setErrorMessage('Username already exists. Please choose a different username.');
      return false;
    }
  };

  const signup = async (username, email, password) => {
    try {
      const data = { username, email, password };
      const response = await axios.post('http://127.0.0.1:8000/sign/signup/', data);
      setSuccessMessage('Signup successful!');
      try {
          const r1 = await axios.get(`http://127.0.0.1:8000/login/getid/${username}/`);
          console.log("Response Data:", r1.data);
          sessionStorage.setItem("userid",r1.data.data)
      } catch (error) {
          console.error("An error occurred:", error.message);
          // You can handle specific error cases here
      }
      sessionStorage.setItem("username",username);
      window.location.href = "http://localhost:3000/home";
      
      setUsername('');
      setEmail('');
      setPassword('');
    } catch (error) {
      setErrorMessage('Signup failed. Please try again.');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!username) {
      setErrorMessage('Username is required.');
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    const isUsernameAvailable = await checkUsernameAvailability(username);
    if (!isUsernameAvailable) return;

    // Call the signup function if validation passes
    signup(username, email, password);
  };

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  return (
    <div>
      {/* Flex container for logo and heading */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20px' }}>
        <Image src={pic1} alt="Synchora logo" width={100} height={100} className="rounded-circle ml-2" />
        <h1 style={{ marginLeft: '10px', color: 'white' }}>SYNCORA</h1>
      </div>

      <div className="signup-container" style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', border: '2px solid #cf1368', justifyContent: 'center' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px', color: 'darkgrey' }}>Sign Up</h2>
        <form onSubmit={handleSubmit} className="rounded-form">
          {errorMessage && <div className="error-message" style={{ color: 'red', textAlign: 'center' }}>{errorMessage}</div>}
          {successMessage && <div className="success-message" style={{ color: 'green', textAlign: 'center' }}>{successMessage}</div>}

          <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'center' }}>
            <input
              type="text"
              className="input-field"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ backgroundColor: 'black', padding: '10px', width: '50%' }}
            />
          </div>

          <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'center' }}>
            <input
              type="email"
              className="input-field"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ backgroundColor: 'black', padding: '10px', width: '50%' }}
            />
          </div>

          <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'center' }}>
            <input
              type="password"
              className="input-field"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ backgroundColor: 'black', padding: '10px', width: '50%' }}
            />
          </div>

          <button type="submit" className="signup-btn" style={{ padding: '5px 8px', fontSize: '14px' }}>Sign Up</button>
        </form>
      </div>
    </div>
  );
};

export default page;
