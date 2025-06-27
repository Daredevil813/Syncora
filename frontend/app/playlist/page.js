"use client";
import axios from "axios";
import "./playlist.css";
import React, { useEffect, useState } from "react";
import Navbar from "@/components/navbar";

const PlaylistPage = () => {
  const [playlists, setPlaylists] = useState([]);
  const [error, setError] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null); // Store the selected playlist
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility state
  const [playlistDetails, setPlaylistDetails] = useState([]); // Store playlist details for modal
  const [isAddPlaylistOpen, setIsAddPlaylistOpen] = useState(false); // Add Playlist modal state
  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false); // Add to Playlist modal state
  const [newPlaylistName, setNewPlaylistName] = useState(""); // New playlist name
  const [newPlaylistDetails, setNewPlaylistDetails] = useState({ playlist_name: "",link: "", name:"" }); // Add to Playlist form data
  const [username, setUsername] = useState("");


  useEffect(() => {
    const storedUsername = sessionStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
  }    
  }, []);

  useEffect(() => {
    if (username) {
      console.log("Fetching playlists for username:", username); // Debugging
      fetchPlaylists();
    }
  }, [username]);

  const fetchPlaylists = () => {
    console.log(username)
    axios
      .get(`http://localhost:8000/playlist/${username}/`)
      .then((response) => {
        setPlaylists(response.data); // Set playlists in state
        setError(null); // Clear any previous error
      })
      .catch((error) => {
        alert("Error fetching playlists: Failed to fetch playlists. Please try again.");
        //console.error("Error fetching playlists:", error);
      });
  };

  // Function to handle opening the modal and setting selected playlist
  const handlePlaylistClick = (playlist_name) => {
    // Fetch the playlist details for the selected playlist
    axios
      .get(`http://localhost:8000/playlist/${username}/${playlist_name}/`)
      .then((response) => {
        console.log("Playlist details response:", response.data);
        setPlaylistDetails(response.data); // Assuming the API returns an array of playlists
        setIsModalOpen(true); // Open the modal
      })
      .catch((error) => {
        //console.error("Error fetching playlist details:", error);
        alert("no data in playlist.");
      });
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setPlaylistDetails(null); // Reset selected playlist data when closing the modal
  };

  // Open Add Playlist modal
  const openAddPlaylistModal = () => {
    console.log('yo');
    setIsAddPlaylistOpen(true);
    console.log(isAddPlaylistOpen);
  };

  const openAddToPlaylistModal = () => {
    if (playlists.length === 0) {
      alert("Error: No playlists available. Please create a playlist first.");
      return; // Exit the function if no playlists exist
    }
    setNewPlaylistDetails({ ...newPlaylistDetails, playlist_name: playlists[0].playlist_name });
    setIsAddToPlaylistOpen(true);
  };
  

  // Close Add Playlist modal
  const closeAddPlaylistModal = () => {
    setIsAddPlaylistOpen(false);
    setNewPlaylistName("");
  };

  // Close Add to Playlist modal
  const closeAddToPlaylistModal = () => {
    setIsAddToPlaylistOpen(false);
    setNewPlaylistDetails({ playlistName: "", link: "" });
  };

  // // Submit new playlist
  // const submitNewPlaylist = () => {
  //   axios
  //     .post(`http://localhost:8000/playlist/`, { username, playlist_name: newPlaylistName })
  //     .then((response) => {
  //       setPlaylists([...playlists, response.data]); // Update playlists state
  //       closeAddPlaylistModal();
  //     })
  //     .catch((error) => {
  //       console.error("Error adding new playlist:", error);
  //       setError("Failed to add new playlist.");
  //     });
  // };

  const submitNewPlaylist = () => {
    const doesExist = playlists.some(
      (playlist) => playlist.playlist_name.toLowerCase() === newPlaylistName.toLowerCase()
    );
  
    if (doesExist) {
      alert(`Error: Playlist "${newPlaylistName}" already exists.`);
      return; // Exit the function
    }
  
    axios
      .post(`http://localhost:8000/playlist/`, { username, playlist_name: newPlaylistName })
      .then((response) => {
        setPlaylists([...playlists, response.data]); // Update playlists state
        console.log(playlists)
        closeAddPlaylistModal();
      })
      .catch(() => {
        alert("Error: Failed to add new playlist. Please try again.");
      });
  };
  

  

  // const submitAddToPlaylist = () => {
  //   const url = `http://localhost:8000/playlist/${username}/${encodeURIComponent(newPlaylistDetails.playlist_name)}/`;
  //   console.log(url); 

  //   axios
  //   .get(url)
  //   .then((response) => {
  //     const playlistItems = response.data; // Assuming the response contains an array of items
  //     const isNameDuplicate = playlistItems.some(
  //       (item) => item.name.toLowerCase() === newPlaylistDetails.name.toLowerCase()
  //     );

  //     if (isNameDuplicate) {
  //       alert(`Error: The name "${newPlaylistDetails.name}" already exists in the playlist.`);
  //       return;
  //     }
  //   axios
  //     .post(`http://localhost:8000/playlist/${username}/${encodeURIComponent(newPlaylistDetails.playlist_name)}/`, newPlaylistDetails)
  //     .then((response) => {
  //       console.log("Response from server:", response.data);
  //       console.log("Playlist added successfully:", response.data);
  //       console.log(newPlaylistDetails)
  //       closeAddToPlaylistModal(); // Close modal after successful submission
  //     })
  //     .catch((error) => {
  //       console.error("Error adding to playlist:", error);
  //       setError("Failed to add to playlist. Make sure the playlist name and link are correct.");
  //     });
  // };
  
  // const submitAddToPlaylist = () => {
  //   const url = `http://localhost:8000/playlist/${username}/${encodeURIComponent(newPlaylistDetails.playlist_name)}/`;
  //   console.log(url);
  
  //   // Fetch playlist data to check for duplicates
  //   axios
  //     .get(url)
  //     .then((response) => {
  //       const playlistItems = response.data; // Assuming the response contains an array of items
  //       const isNameDuplicate = playlistItems.some(
  //         (item) => item.name.toLowerCase() === newPlaylistDetails.name.toLowerCase()
  //       );
  
  //       if (isNameDuplicate) {
  //         alert(`Error: The name "${newPlaylistDetails.name}" already exists in the playlist.`);
  //         return; // Stop execution if duplicate is found
  //       }
  
  //       // Proceed to add the new item if no duplicate is found
  //       axios
  //         .post(url, newPlaylistDetails)
  //         .then((response) => {
  //           console.log("Response from server:", response.data);
  //           console.log("Playlist added successfully:", response.data);
  //           console.log(newPlaylistDetails);
  //           closeAddToPlaylistModal(); // Close modal after successful submission
  //         })
  //         .catch((error) => {
  //           //console.error("Error adding to playlist:", error);
  //           alert("Failed to add to playlist. Make sure the playlist name and link are correct.");
  //         });
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching playlist details:", error);
  //       alert("Error: Unable to fetch playlist data to check for duplicates.");
  //     });
  // };
  const submitAddToPlaylist = () => {
    const url = `http://localhost:8000/playlist/${username}/${encodeURIComponent(newPlaylistDetails.playlist_name)}/`;
    console.log(url);
  
    // Fetch playlist data to check for duplicates
    axios
      .get(url)
      .then((response) => {
        const playlistItems = response.data; // Assuming the response contains an array of items
  
        if (playlistItems.length === 0) {
          console.log("The playlist exists but has no data. Proceeding to add the new item.");
        } else {
          // Check for duplicates if data exists
          const isNameDuplicate = playlistItems.some(
            (item) => item.name.toLowerCase() === newPlaylistDetails.name.toLowerCase()
          );
  
          if (isNameDuplicate) {
            alert(`Error: The name "${newPlaylistDetails.name}" already exists in the playlist.`);
            return; // Stop execution if duplicate is found
          }
        }
  
        // Proceed to add the new item
        axios
          .post(url, newPlaylistDetails)
          .then((response) => {
            console.log("Response from server:", response.data);
            console.log("Playlist added successfully:", response.data);
            console.log(newPlaylistDetails);
            closeAddToPlaylistModal(); // Close modal after successful submission
          })
          .catch((error) => {
            alert("Failed to add to playlist. Make sure the playlist name and link are correct.");
          });
      })
      .catch((error) => {
        if (error.response && error.response.status === 404) {
          // Handle case where the playlist does not exist (404)
          console.log("The playlist data does not exist. Proceeding to create a new one.");
  
          // Proceed directly to POST, since the playlist is not found
          axios
            .post(url, newPlaylistDetails)
            .then((response) => {
              console.log("Response from server:", response.data);
              console.log("Playlist added successfully:", response.data);
              closeAddToPlaylistModal(); // Close modal after successful submission
            })
            .catch((error) => {
              alert("Failed to add to playlist. Make sure the playlist name and link are correct.");
            });
        } else {
          console.error("Error fetching playlist details:", error);
          alert("Error: Unable to fetch playlist data to check for duplicates.");
        }
      });
  };
  
  
  
  const removePlaylist = (playlist_name) => {
    if (window.confirm(`Are you sure you want to remove the playlist "${playlist_name}"?`)) {
      axios
        .delete(`http://localhost:8000/playlist/${username}/${encodeURIComponent(playlist_name)}/`)
        .then(() => {
          // Filter out the deleted playlist from the state
          setPlaylists(playlists.filter((playlist) => playlist.playlist_name !== playlist_name));
        })
        .catch((error) => {
          console.error("Error removing playlist:", error);
          alert("Failed to remove the playlist. Please try again.");
        });
    }
  };
  
  const removePlaylistdata = (playlistName, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}" from the playlist "${playlistName}"?`)) {
      // API URL to delete specific data
      const url = `http://localhost:8000/playlist/${username}/${encodeURIComponent(playlistName)}/${encodeURIComponent(name)}/`;
      axios
        .delete(url)
        .then(() => {
          alert(`"${name}" from playlist "${playlistName}" deleted successfully.`);
          // Optionally update the state to reflect changes in the UI
          setPlaylistDetails((prevDetails) =>
            prevDetails.filter((item) => item.name !== name)
          );
        })
        .catch((error) => {
          console.error("Error deleting playlist data:", error);
          alert("Failed to delete the data. Please try again.");
        });
    }
  };
  
  return (
    <div>
      <Navbar />
      <div className="playlist-container">
        <h1>Playlists</h1>
        <div className="actions">
          <button className="action-button" onClick={openAddPlaylistModal}>
            Add Playlist
          </button>
          <button className="action-button" onClick={openAddToPlaylistModal}>
            Add to Playlist
          </button>
        </div>
        {error ? (
          <p className="error-message">{error}</p>
        ) : playlists.length === 0 ? (
          <p>No playlists found for this user.</p>
        ) : (
          <table className="playlist-table">
            <tbody>
            {playlists.map((playlist) => (
            <tr key={playlist.id}>
            <td>
              <button
                className="playlist-button"
                onClick={() => handlePlaylistClick(playlist.playlist_name)} // Pass playlist name here
              >
                {playlist.playlist_name}
              </button>
              <button
                className="remove-button"
                onClick={() => removePlaylist(playlist.playlist_name)} // Call the remove handler
              >
                Remove
              </button>
            </td>
          </tr>
        ))}
            </tbody>
          </table>
        )}
      </div>
      {isModalOpen && playlistDetails && (
        <div className="modal playlist-modal">
          <div className="modal-content">
            <span className="close-button" onClick={closeModal}>
              &times;
            </span>
            <h2>Playlist Details</h2>
            <div className="modal-table-wrapper">
            <table className="modal-table">
              <thead>
                <tr>
                  <th>Link</th>
                  <th>Playlist Name</th>
                </tr>
              </thead>
              <tbody>
                {playlistDetails.map((playlist, index) => (
                  <tr key={index}>
                    <td
      onClick={() => navigator.clipboard.writeText(playlist.link)} // Copy to clipboard on click
      style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }} // Styling to indicate interactivity
      title="Click to copy"
    >

                    {playlist.link}
                      
                    </td>
                    <td>{playlist.name}
                    <button
                className="remove-button"
                onClick={() => removePlaylistdata(playlist.playlist_name,playlist.name)} // Call the remove handler
              >
                Remove
              </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      )}
     {isAddPlaylistOpen && (
  <div className="modal add-playlist-modal">
    <div className="modal-content">
      <span className="close-button" onClick={closeAddPlaylistModal}>
        &times;
      </span>
      <h2>Add Playlist</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitNewPlaylist(); // Function to handle the addition of the new playlist
        }}
      >
        <div className="form-group">
          <label htmlFor="playlist-name">Playlist Name:</label>
          <input
            type="text"
            id="playlist-name"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            placeholder="Enter playlist name"
            required
          />
        </div>
        <button  type="submit" className="submit-button">
          Add Playlist
        </button>
      </form>
    </div>
  </div>
)}
    {isAddToPlaylistOpen && (
  <div className="modal add-to-playlist-modal">
    <div className="modal-content">
      <span className="close-button" onClick={closeAddToPlaylistModal}>
        &times;
      </span>
      <h2>Add to Playlist</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitAddToPlaylist();
        }}
      >
        {/* Dropdown for existing playlists */}
        <label>
          Select Playlist:
          <select
            value={newPlaylistDetails.selectedPlaylist}
            onChange={(e) =>
             { console.log("Selected playlist name:", e.target.value);
              setNewPlaylistDetails({ ...newPlaylistDetails, playlist_name: e.target.value })
            }}
          >
            <option value="" disabled>
              Choose a playlist
            </option>
            {playlists.map((playlist) => (
              <option key={playlist.id} value={playlist.playlist_name}>
                {playlist.playlist_name}
              </option>
            ))}
          </select>
        </label>

        {/* Input for link name */}
        <label>
          Link Name:
          <input
            type="text"
            value={newPlaylistDetails.name}
            onChange={(e) =>
              setNewPlaylistDetails({ ...newPlaylistDetails, name: e.target.value })
            }
            required
            style={{ color: 'black' }}
          />
        </label>

        {/* Input for link */}
        <label>
          Link:
          <input
            type="url"
            value={newPlaylistDetails.link}
            onChange={(e) =>
              setNewPlaylistDetails({ ...newPlaylistDetails, link: e.target.value })
            }
            required
            style={{ color: 'black' }}
          />
        </label>

        <button className="btns" type="submit">Add to Playlist</button>
      </form>
    </div>
  </div>
)}


   

    </div>
  );
};

export default PlaylistPage;
