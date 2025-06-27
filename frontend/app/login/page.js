"use client";

import React, { useState } from "react";
import Image from "next/image";
import axios from "axios"; // Import axios for making API calls
import styles from "./login.css";
import pic1 from "../images/Synchora.jpg";
import { useRouter } from 'next/navigation';


const Page = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const redirectToSignup = () => {
    router.push('/Signup'); 
  };
  // Function to handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (username.trim() === "") {
      setErrorMessage("Please enter your username.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    try {
      // API call to login endpoint
      const response = await axios.post("http://127.0.0.1:8000/login/login/", {
        username,
        password,
      });

      if (response.status === 200) {
        setSuccessMessage("Login successful!");
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
    }
    
    } catch (error) {
      if (error.response) {
        // Server responded with an error
        setErrorMessage(error.response.data.error || "Login failed.");
      } else {
        // No response from server
        setErrorMessage("Unable to connect to the server.");
      }
    }
  };

  return (
    <div>
      {/* Flex container for logo and heading */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: "60px", 
        }}
      >
        <Image
          src={pic1}
          alt="Synchora logo"
          width={100}
          height={100}
          className="rounded-circle ml-2"
        />
        <h1 style={{ marginLeft: "10px", color: "white" }}>SYNCORA</h1>
      </div>

      <div
        className="login-container"
        style={{
          position: "absolute",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          border: "2px solid #cf1368",
          justifyContent: "center",
          width: "400px", 
          padding: "30px", 
          backgroundColor: "black", 
          borderRadius: "10px", 
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "30px", color: "darkgrey" }}>Login</h2>
        <form onSubmit={handleSubmit} className="rounded-form">
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}

          <div style={{ marginBottom: "15px", display: "flex", justifyContent: "center" }}>
            <input
              type="text"
              className="input-field"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ backgroundColor: "black", padding: "10px", width: "80%" }}
            />
          </div>

          <div style={{ marginBottom: "15px", display: "flex", justifyContent: "center" }}>
            <input
              type="password"
              className="input-field"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ backgroundColor: "black", padding: "10px", width: "80%" }}
            />
          </div>

          <button onClick={handleSubmit} type="submit" className="login-btn" style={{ padding: "10px 15px", fontSize: "16px" }}>
            Login
          </button>
          <button onClick={redirectToSignup} type="submit" className="login-btn" style={{ padding: "10px 15px", fontSize: "16px" }}>
            Signup
          </button>
        </form>
      </div>
    </div>
  );
};

export default Page;
