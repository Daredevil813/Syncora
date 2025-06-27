"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import "./friend.css";
import Navbar from "@/components/navbar";

const Page = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [friendsList, setFriendsList] = useState([]); // Initially empty, fetched from backend
  const [allUsers, setAllUsers] = useState([]); // All users fetched from backend
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  var USER_ID = sessionStorage.getItem("userid"); // Replace with the actual logged-in user ID

  // Fetch all users and the user's friends from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all users
        const usersResponse = await axios.get("http://localhost:8000/core/users/");
        setAllUsers(usersResponse.data);

        // Fetch friends of the user
        const friendsResponse = await axios.get(
          `http://localhost:8000/core/friends/${USER_ID}/`
        );
        console.log(friendsResponse);
        const friends = friendsResponse.data.map((friend) => {
          
          // Fetch friend details from the friend ID
          const friendDetails = usersResponse.data.find(
            (user) =>{
              if(friend.user_a === sessionStorage.getItem("username")) 
              {
                return user.username === friend.user_b;
              }
              else{
                return user.username === friend.user_a;
              }
            }
          );
          return friendDetails?.username || "Unknown";
        });
        console.log(friends);
        setFriendsList(friends);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [USER_ID]);

  // Handle search functionality
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    const results = allUsers.filter((user) =>
      user.username.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setSearchResults(results);
  };

  // Add friend function
  const addFriend = async (friendUsername) => {
    const user1 = sessionStorage.getItem("username");
  
    if (friendsList.includes(friendUsername)) {
      alert("This user is already your friend!");
      return;
    }
    if (friendUsername === user1) {
      alert("You cannot friend yourself sillyy!");
      return;
    }
  
    const friend = allUsers.find((user) => user.username === friendUsername);
  
    if (!friend) {
      console.error("Friend not found!");
      return;
    }
  
    const friendId = friend.id;
    const userId = USER_ID;
  
    try {
      const response = await fetch("http://127.0.0.1:8000/core/add-friend/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: userId, friend_id: friendId }),
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log(data.message);
        setFriendsList((prev) => [...prev, friendUsername]);
        alert("Friend added")
      } else {
        const error = await response.json();
       // console.error(error.message || "Error adding friend");
      }
    } catch (error) {
      console.error("Error adding friend:", error);
    }
  };
  

  // Remove a friend
  const removeFriend = async (friendUsername) => {
    console.log(friendUsername);
    // Find the friendId using the username
    const friend = allUsers.find((user) => user.username === friendUsername);
    console.log(friend);
    if (!friend) {
      console.error("Friend not found!");
      return;
    }

    const friendId = friend.id; // Now you have the correct friendId

    const userId = USER_ID; // Replace with logged-in user's ID

    try {
      const response = await fetch("http://127.0.0.1:8000/core/remove-friend/", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: userId, friend_id: friendId }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log(data.message);
        setFriendsList((prev) => prev.filter((friend) => friend !== friendUsername)); // Update UI
      } else {
        console.error(data.error || data.message);
      }
    } catch (error) {
      console.error("Error removing friend:", error);
    }
  };

  // Show popup for selected user
  const handleUserClick = (user) => {
    setSelectedUser(user);
    setShowPopup(true);
  };

  // Close popup
  const closePopup = () => {
    setSelectedUser(null);
    setShowPopup(false);
  };

  return (
    <div>
      <Navbar />
      <div className="friends-container">
        <div className="search-and-list">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search for users..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>

          {searchQuery && (
          <div className="search-results">
            <h3>Search Results</h3>
            <ul>
              {searchResults.map((user, index) => (
                <li
                  key={index}
                  className="search-result-item"
                  onClick={() => handleUserClick(user)}
                >
                  {user.username}
                </li>
              ))}
            </ul>
          </div>
        )}

          <div className="friends-list">
            <h3>Your Friends</h3>
            <ul>
              {friendsList.map((friend, index) => (
                <li key={index} className="friend-item">
                  {friend}
                  <button
                    onClick={() => removeFriend(friend)} // Pass the friend's username
                    className="remove-friend-btn"
                  >
                    Remove
                  </button>
                </li>
              ))}

            </ul>
          </div>
        </div>

        
        {showPopup && selectedUser && (
          <div className="popup-overlay" onClick={closePopup}>
            <div className="popup-content" onClick={(e) => e.stopPropagation()}>
              <h3>{selectedUser.username}</h3>
              <p>{selectedUser.email}</p>
              <button
                onClick={() => addFriend(selectedUser.username)} // Pass the friend's username
                className="add-friend-btn"
              >
                Add as Friend
              </button>

              <button onClick={closePopup} className="close-btn">
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
