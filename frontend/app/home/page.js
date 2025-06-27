"use client";

import axios from "axios";
import "./home.css";
import React, { useEffect, useState } from "react";
import Navbar from "@/components/navbar";
import Link from "next/link";

const HomePage = () => {
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false); // State for popup visibility
  const [PopupOpen, setPopupOpen] = useState(false);
  const [linkInput, setLinkInput] = useState(""); // State for link input
  const [TextInput, setTextInput] = useState("");  // Input field state
  const [selectedType, setSelectedType] = useState('');


  useEffect(() => {
    const storedUsername = sessionStorage.getItem("username");

    if (!storedUsername) {
      console.error("Username is missing");
    }

    // Fetch rooms using Axios
    axios
      .get(`http://localhost:8000/home/`) // Match your API endpoint
      .then((response) => {
        console.log("Fetched rooms:", response.data); // Log the fetched data
        setRooms(response.data); // Set rooms in state
        setError(null); // Clear any previous error
      })
      .catch((error) => {
        //console.error("Error fetching rooms:", error);
        //setError("Failed to fetch rooms. Please try again.");
      });
  }, []);

  useEffect(() => {
    console.log("Updated rooms:", rooms);
  }, [rooms]);

  const handlePopupSubmit = async () => {
    if (linkInput) {
      const storedUsername = sessionStorage.getItem("username");
  
      // Prepare data to be sent in the request body
      const roomdata = {
        username: storedUsername,
        link: linkInput,
      };
      console.log(roomdata);
  
      try {
        // Send the POST request using axios
        const response = await axios.post('http://localhost:8000/home/joinroom/', roomdata);
        
        if (response.status === 201) {
          window.location.href=linkInput 
        } else {
          //alert("Please enter a valid link.");
            alert(response.data.detail);
          
        }
      } catch (error) {
        console.error('Error during request:', error);
        alert('An error occurred while creating the room.');
      }
    }
  };
 
  const handlePopupSubmit3 = async () => {
    if (linkInput) {
      const storedUsername = sessionStorage.getItem("username");
  
      // Prepare data to be sent in the request body
      const roomdata = {
        username: storedUsername,
        link: linkInput,
      };
      console.log(roomdata);
  
      try {
        // Send the POST request using axios
        const response = await axios.post('http://localhost:8000/home/joinroom/', roomdata);
        
        if (response.status === 201) {
          window.location.href=linkInput 
        } else {
          //alert("Please enter a valid link.");
            alert(response.data.detail);
          
        }
      } catch (error) {
        console.error('Error during request:', error);
        alert('An error occurred while creating the room.');
      }
    }
  };
  
  // const handlePopupSubmit2 = () => {
  //   if (TextInput.trim()) { // Use TextInput directly
  //     const sanitizedInput = encodeURIComponent(TextInput.trim());
  //     const targetUrl = `http://localhost:3000/rooms/${sanitizedInput}`;
  //     window.location.href = targetUrl; // Redirect
  //   } else {
  //     alert("Please enter a valid room name.");
  //   }
  // };
  const handlePopupSubmit2 = async () => {
    if (TextInput.trim()) 
     { const storedUsername = sessionStorage.getItem("username");
      
      if (!selectedType) {
        alert("Please select a room type.");
        return;
      }

      // Map room type selection to numeric values
      const typeValue = selectedType === 'public' ? 2 : 1;

      try {
        // Prepare data to be sent in the request body
        const roomdata = {
          username: storedUsername,
          roomname: TextInput,
          capacity: 10, // Automatically set capacity to 0
          type: typeValue,
        };
        console.log(roomdata)

        // Send the POST request using axistos
        const response = await axios.post('http://localhost:8000/home/createroom/', roomdata);

        if (response.status === 201) {
          alert(response.data.detail || 'Room created successfully.');
          setPopupOpen(false); // Close the popup after successful submission


          // Optionally, redirect to the created room page
          const sanitizedInput = encodeURIComponent(TextInput.trim());
          const targetUrl = `http://localhost:3000/RoomPage/${sanitizedInput}/h/`;
          window.location.href = targetUrl;
        }
        else{
          alert(response.data.detail);
        }
      } catch (error) {
        //console.error('Error:', error);
        alert(response.data.detail);
      }
    } 
    else 
    {
      alert("Please enter a valid room name.");
    }
  };


  return (
    <div>
      <Navbar />
      {/* Button to open the popup */}
      <button className="open-popup-button" onClick={() => setIsPopupOpen(true)}>
        Open Link Popup
      </button>
      <button className="open-popup-button" onClick={() => setPopupOpen(true)}>
        create room
      </button>
      <div className="rooms-container">
        {error && <p className="error">{error}</p>}
        {rooms.length > 0 ? (
          rooms.map((room, index) => (
            // <button key={index} setLinkInput(`/RoomPage/${room.party_name}/nh`)}>
            //   <div className="room-button">
            //     <img
            //       src="/images/Synchora.png" // Default image if none is provided
            //       alt={room.title}
            //       className="room-image"
            //     />
            //     <h3 className="room-title">{room.party_name}</h3>
            //   </div>
            // </button>
            <button 
  key={index} 
  onClick={() => {
    setLinkInput(`http://localhost:3000/RoomPage/${room.party_name}/nh`);
    handlePopupSubmit3(); // Call handleSubmit3 at the end
  }}
>
  <div className="room-button">
    <img
      src="/images/Synchora.png" // Default image if none is provided
      alt={room.title}
      className="room-image"
    />
    <h3 className="room-title">{room.party_name}</h3>
  </div>
</button>

          ))
        ) : (
          <p className="loading">Loading rooms...</p>
        )}
      </div>

      

      {/* Popup Modal */}
      {isPopupOpen && (
        <div className="popup-modal">
          <div className="popup-content">
            <h2>Enter a Link</h2>
            <input
              type="text"
              value={linkInput}
              onChange={(e) => setLinkInput(e.target.value)}
              placeholder="Enter URL"
            />
            <div className="popup-actions">
              <button className="btns" onClick={handlePopupSubmit}>Submit</button>
              <button className="btns" onClick={() => setIsPopupOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {/* Popup Modal */}
  {PopupOpen && (
   <div className="popup-modal" role="dialog" aria-labelledby="popup-title">
    <div className="popup-content">
      <h2 id="popup-title">Enter Room Name</h2>
      <label htmlFor="room-name-input">Room Name:</label>
      <input
        id="room-name-input"
        type="text"
        value={TextInput}
        onChange={(e) => setTextInput(e.target.value)}
        placeholder="Enter room name"
      />
      <div className="room-type-selection">
          <p>Select Room Type:</p>
          <label>
            <input
              type="radio"
              name="room-type"
              value="public"
              onChange={(e) => setSelectedType(e.target.value)}
            />
            Public
          </label>
          <label>
            <input
              type="radio"
              name="room-type"
              value="private"
              onChange={(e) => setSelectedType(e.target.value)}
            />
            Private
          </label>
        </div>
      <div className="popup-actions">
        <button className="btns"  onClick={handlePopupSubmit2}>Submit</button>
        <button className="btns" onClick={() => setPopupOpen(false)}>Cancel</button>
      </div>
    </div>
  </div>
)}




    </div>
  );
};

export default HomePage;
