"use client";

import React, { useState, useEffect } from "react";
import "./calendar.css";
import Navbar from "@/components/navbar";
import axios from "axios";
const CalendarPage = () => {
    const userId=sessionStorage.getItem('userid')
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [schedulePopup, setSchedulePopup] = useState(false);
    const [friendsList, setFriendsList] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [invitePopup, setInvitePopup] = useState(false);
    const [selectedParty, setSelectedParty] = useState(null);
    const [formData, setFormData] = useState({
        party_name: "",
        date: "",
        time: "",
        capacity: "",
        host:userId,
        type: ""
    });
    const [partySchedule, setPartySchedule] = useState({
        January: { created: [], invited: [] },
        February: { created: [], invited: [] },
        March: { created: [], invited: [] },
        April: { created: [], invited: [] },
        May: { created: [], invited: [] },
        June: { created: [], invited: [] },
        July: { created: [], invited: [] },
        August: { created: [], invited: [] },
        September: { created: [], invited: [] },
        October: { created: [], invited: [] },
        November: { created: [], invited: [] },
        December: { created: [], invited: [] },
    });
    

    const months = [
        { name: "January", number: 1 },
        { name: "February", number: 2 },
        { name: "March", number: 3 },
        { name: "April", number: 4 },
        { name: "May", number: 5 },
        { name: "June", number: 6 },
        { name: "July", number: 7 },
        { name: "August", number: 8 },
        { name: "September", number: 9 },
        { name: "October", number: 10 },
        { name: "November", number: 11 },
        { name: "December", number: 12 },
    ];

    const sendInvite = async (friendUsername) => {
        console.log("In sendInvite");

        // Find the friend's ID using the username
        const friend = allUsers.find((user) => user.username === friendUsername);
        if (!friend) {
            console.error("Friend not found!");
            return;
        }

        const friendId = friend.id; // Get the friend's ID
        const party_name = selectedParty; // Get the selected party name

        // Find the party ID from the party name
        const party = partySchedule[selectedMonth]?.created.find(
            (party) => party.party_name === party_name
        );

        if (!party) {
            console.error("Party not found!");
            return;
        }

        const partyId = party.id; // Get the party ID

        // Get the corresponding month number
        const monthData = months.find((month) => month.name === selectedMonth);
        if (!monthData) {
            console.error("Invalid month selected!");
            return;
        }
        const monthNumber = monthData.number;

        try {
            // Check if the friend is already invited
            const checkResponse = await fetch(
                `http://127.0.0.1:8000/calender/user/${friendId}/parties/invited/${monthNumber}/`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const checkData = await checkResponse.json();
            if (checkResponse.ok) {
                const alreadyInvited = checkData.some(
                    (invitation) => invitation.party_id === partyId
                );

                if (alreadyInvited) {
                    alert("This friend is already invited to this party.");
                    return;
                }
            } else {
                console.error("Error checking invitation:", checkData.message);
                alert("Failed to check if the friend is already invited.");
                return;
            }

            // Send the invitation
            const response = await fetch("http://localhost:8000/calender/invite-friend/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ party_id: partyId, user_id: friendId }),
            });

            const data = await response.json();
            if (response.ok) {
                alert(data.message); // Notify success
            } else {
                alert(data.message || "Error inviting friend");
            }
        } catch (error) {
            console.error("Error sending invite:", error);
        }
    };

    // Inside the CalendarPage component

    const cancelParty = async (partyId) => {
        try {
            const response = await fetch(`http://localhost:8000/calender/api/cancel-party/${partyId}/`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            });
    
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Error canceling party");
            }
    
            alert(data.message || "Party canceled successfully!");
    
            // Update the party list for the current month
            if (selectedMonth) {
                const monthData = months.find((m) => m.name === selectedMonth);
                if (monthData) {
                    await fetchDataForMonth(userId, monthData.number); // Replace `1` with the logged-in user ID
                }
            }
        } catch (error) {
            console.error("Error canceling party:", error.message);
        }
    };
    

    const renderCreatedParties = (parties) => {
        if (!parties || parties.length === 0) {
            return <p>No created parties scheduled</p>;
        }

        return parties.map((party, index) => (
            <div className="party-card created-party" key={index}>
                <h5>{party.party_name}</h5>
                <p>Capacity: {party.capacity}</p>
                <p>Date: {party.date}</p>
                <p>Time: {party.time}</p>
                <button onClick={() => cancelParty(party.id)} className="cancel-btn">
                    Cancel Party
                </button>

                <button onClick={() => openInvitePopup(party.party_name)} className="invite-btn">
                    Invite
                </button>
            </div>
        ));
    };


    // Fetch parties for the selected month
    const fetchDataForMonth = async (userId, monthNumber) => {
        try {
            console.log(userId);
            console.log(monthNumber);
            const createdResponse = await axios.get(
                `http://localhost:8000/calender/user/${userId}/parties/scheduled/${monthNumber}/`
            );
            const invitedResponse = await axios.get(
                `http://localhost:8000/calender/user/${userId}/parties/invited/${monthNumber}/`
            );

            const createdParties = createdResponse.data;
            const invitedParties = invitedResponse.data;
            
            console.log(createdParties);
            console.log("2:");
            console.log(invitedParties);
            setPartySchedule((prevState) => ({
                ...prevState,
                [months.find((m) => m.number === monthNumber).name]: {
                    created: createdParties,
                    invited: invitedParties,
                },
            }));
        } catch (error) {
            console.error("Error fetching data for month:", monthNumber, error);
        }
    };

    useEffect(() => {
        months.forEach((month) => {
            fetchDataForMonth(userId, month.number);
        });
        const fetchData = async () => {
            try {
                const usersResponse = await axios.get("http://localhost:8000/core/users/");
                setAllUsers(usersResponse.data);
                // Fetch friends of the user
                const friendsResponse = await axios.get(
                    ` http://localhost:8000/core/friends/${userId}/`
                );
                console.log(friendsResponse)
                const friends = friendsResponse.data.map((friend) => {
                    // Fetch friend details from the friend ID
                    const friendDetails = usersResponse.data.find(
                        (user) => user.username === friend.user_b
                    );
                    return friendDetails?.username || "Unknown";
                });
                setFriendsList(friends);
                console.log(friends)
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    const openPopup = (month) => {
        setSelectedMonth(month);
        setShowPopup(true);
        const monthData = months.find((m) => m.name === month);
        if (monthData) {
            fetchDataForMonth(userId, monthData.number);
        }
    };

    const openInvitePopup = (party_name) => {
        setSelectedParty(party_name);
        setInvitePopup(true);
    };

    const closeInvitePopup = () => {
        setSelectedParty(null);
        setInvitePopup(false);
    };

    const closePopup = () => {
        setSelectedMonth(null);
        setShowPopup(false);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };


   
    // const submitForm = async () => {
    //     try {
    //         // Log the form data to ensure it has the correct values
    //         console.log('Submitting form with data:', formData);

    //         await axios.post("http://localhost:8000/api/schedule_party", formData);

    //         alert("Party scheduled successfully!");
    //         setSchedulePopup(false);
    //         setFormData({ party_name: "", date: "", time: "", capacity: "",host:userId,type:"" });
    //         console.log("values set")
    //         // fetchPartyData(); // Refresh data
    //     } catch (error) {
    //         console.error("Error scheduling party:", error);
    //         alert("Failed to schedule the party.");
    //     }
    // };


    const submitForm = async () => {
        try {
            // Check if a party hosted by the user exists at the same time and date
            const monthName = new Date(formData.date).toLocaleString("default", { month: "long" });
            const userCreatedParties = partySchedule[monthName]?.created || [];
    
            const conflict = userCreatedParties.some(
                (party) => party.date === formData.date && party.time === formData.time
            );
    
            if (conflict) {
                alert("You already have a party scheduled at the same time and date!");
                return; // Prevent further execution if conflict exists
            }
    
            // Log the form data to ensure it has the correct values
            console.log("Submitting form with data:", formData);
    
            await axios.post("http://localhost:8000/calender/schedule_party", formData);
    
            alert("Party scheduled successfully!");
            setSchedulePopup(false);
            setFormData({ party_name: "", date: "", time: "", capacity: "", host: 1, type: "" });
    
            // Refresh data for the selected month
            const monthData = months.find((m) => m.name === monthName);
            if (monthData) {
                await fetchDataForMonth(1, monthData.number); // Replace `1` with the logged-in user ID
            }
        } catch (error) {
            console.error("Error scheduling party:", error);
            alert("Failed to schedule the party.");
        }
    };
    

    const renderInvitedParties = (parties) => {
        console.log(parties);
        if (!parties || parties.length === 0) {
            return <p>No invited parties scheduled</p>;
        }
        // console.log(party);
        return parties.map((party, index) => (
            <div className="party-card invited-party" key={index}>
                <h5>{party.party_details.party_name}</h5>
                <p>Host: {party.party_details.host}</p>
                <p>Date: {party.party_details.date}</p>
                <p>Time: {party.party_details.time}</p>
                <p>Type:{party.party_details.type}</p>
            </div>
        ));
    };

    return (
        <div>
            <Navbar />
            <button className="schedule-party-btn" onClick={() => setSchedulePopup(true)}>
                Schedule Party
            </button>
            <div className="calendar-container">
                <h2 className="header">Party Calendar</h2>
                <div className="months-grid">
                    {Object.keys(partySchedule).map((month) => (
                        <button key={month} className="month-cell" onClick={() => openPopup(month)}>
                            {month}
                        </button>
                    ))}
                </div>

                {showPopup && selectedMonth && (
                    <div className="popup-overlay" onClick={closePopup}>
                        <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                            <h3>{selectedMonth} Parties</h3>
                            <div className="party-section">
                                <h4>Created Parties</h4>
                                {renderCreatedParties(partySchedule[selectedMonth]?.created || [])}
                            </div>
                            <div className="party-section">
                                <h4>Invited Parties</h4>
                                {renderInvitedParties(partySchedule[selectedMonth]?.invited || [])}
                            </div>
                            <button onClick={closePopup} className="close-btn">
                                Close
                            </button>
                        </div>
                    </div>
                )}

                {schedulePopup && (
                    <div className="popup-overlay" onClick={() => setSchedulePopup(false)}>
                        <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                            <h3>Schedule a Party</h3>
                            <form className="schedule-form" method='POST' onSubmit={(e) => e.preventDefault()}>
                                <label>
                                    Party Name:
                                    <input
                                        type="text"
                                        name="party_name"
                                        value={formData.party_name}
                                        onChange={handleFormChange}
                                    />
                                </label>
                                <label>
                                    Date:
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleFormChange}
                                    />
                                </label>
                                <label>
                                    Time:
                                    <input
                                        type="time"
                                        name="time"
                                        value={formData.time}
                                        onChange={handleFormChange}
                                    />
                                </label>
                                <label>
                                    Capacity:
                                    <input
                                        type="number"
                                        name="capacity"
                                        value={formData.capacity}
                                        onChange={handleFormChange}
                                    />
                                </label>
                                <label>
                                    Type:
                                    <div>
                                        <label>
                                            <input
                                                type="radio"
                                                name="type"
                                                value="1"
                                                checked={formData.type === "1"}
                                                onChange={handleFormChange}
                                            />
                                            Private
                                        </label>
                                        <label>
                                            <input
                                                type="radio"
                                                name="type"
                                                value="2"
                                                checked={formData.type === "2"}
                                                onChange={handleFormChange}
                                            />
                                            Public
                                        </label>
                                    </div>
                                </label>
                                <button className='submit-btn' type="button" onClick={submitForm}>
                                    Schedule
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {invitePopup && selectedParty && (
                    <div className="popup-overlay" onClick={closeInvitePopup}>
                        <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                            <h3>Invite Friends to {selectedParty}</h3>
                            <ul className="friend-list">
                                {friendsList.map((friend, index) => (
                                    <li key={index} className="friend-item">
                                        {friend}
                                        <button onClick={() => sendInvite(friend)} className="send-invite-btn">
                                            Send
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <button onClick={closeInvitePopup} className="close-btn">
                                Close
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default CalendarPage;