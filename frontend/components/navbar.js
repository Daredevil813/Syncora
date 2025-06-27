"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import pic1 from '@/app/images/Synchora.jpg';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const router = useRouter();
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [bio, setBio] = useState("This is your bio...");

  const redirectToHome = () => {
    router.push('/home'); 
  };
  const redirectToCalender = () => {
    router.push('/Calender'); 
  };

  const redirectToFriends = () => {
    router.push('/Friend'); 
  };

  const redirectToChatbox = () =>{
    router.push('/ChatPage')
  }

  const redirectToLogin = ()=>{
    router.push('/login')
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('userid')
  }

  const redirectToPlaylist = ()=>{
    router.push('/playlist')
  }
  const toggleProfilePopup = () => {
    setShowProfilePopup(!showProfilePopup);
  };

  const handleSaveBio = () => {
    // Implement any save functionality here (e.g., send to backend)
    setShowProfilePopup(false);
    alert("Bio saved!");
  };

  return (
    <div>
      <div className="Navbar">
        <div className="row">
          <div className="col1">
            <Image src={pic1} alt="Synchora logo" width={60} className="rounded-circle ml-2" />
          </div>
          <div className="a">
            <div className="header">S Y N C O R A</div>
          </div>
          <div className="b">
            <span className='c'>
              <button className='d' onClick={redirectToHome}>
                <i className="bi bi-house"></i> Home
              </button>
            </span>
            <span className='c'>
              <button onClick={toggleProfilePopup}>
                <i className="bi bi-person"></i> Profile
              </button>
            </span>
            <span className='c'>
              <button onClick={redirectToChatbox}>
                <i className="bi bi-envelope"></i> ChatBox
              </button>
            </span>
            <span className='c' onClick={redirectToLogin}>
              <button>
                <i className="bi bi-box-arrow-right"></i> Logout
              </button>
            </span>
            
            <span className='dropdown'>
              <button className='c' id='menu-trigger'>
                Menu<i className="bi bi-arrow-down"></i>
              </button>
              {/* </span> */}
              <ul className='invisibleMenu'>
                <li className='menu-option'>
                  <button onClick={redirectToFriends}>
                    <i className="bi bi-people"></i> Friends
                  </button>
                </li>
                <li className='menu-option'>
                  <button onClick={redirectToCalender}>
                    <i className="bi bi-calendar"></i> Calendar
                  </button>
                </li>
                <li className='menu-option' onClick={redirectToPlaylist}>
                  <button>
                    <i className="bi bi-music-note-list"></i> Playlists
                  </button>
                </li>
              </ul>
            </span>
          </div>
        </div>
      </div>

      {showProfilePopup && (
        <div className="profile-popup">
          <div className="profile-popup-content">
            <h2>Profile</h2>
            <p><strong>Name:</strong> {sessionStorage.getItem("username")}</p>
            <div className="bio-section">
              Bio:
              <textarea 
                value={bio} 
                onChange={(e) => setBio(e.target.value)}
                className="bio-textarea"
              />
            </div>
            <button onClick={handleSaveBio} className="save-button">Save</button>
            <button onClick={toggleProfilePopup} className="close-button">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
