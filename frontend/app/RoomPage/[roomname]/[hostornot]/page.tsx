'use client';
import { useState, useEffect, useRef } from 'react';
import { FiSend, FiMic, FiUsers, FiVideo } from 'react-icons/fi';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios'; 
import { enterVoiceRoom, leaveVoiceRoom } from './voiceChat';
import ParticipantsPopup from './participants';
import "./roomPage.css";









interface Message {
  sender: string;
  text: string;
}
const RoomPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [isParticipantsVisible, setIsParticipantsVisible] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [linkInput, setLinkInput] = useState('');
  const { roomname, hostornot } = useParams();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isHost, setIsHost] = useState(hostornot === 'h'); // Determine host or not
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  
  const [showEmojis, setShowEmojis] = useState(false);
  const emojiList = ['😀', '😂', '❤️', '👍', '😢', '😮', '🎉'];
  //const participants = ["Alice", "Bob", "Charlie", "David"];



  const API_URL = 'http://localhost:8000/';
  const WS_URL = 'ws://localhost:8000/ws/';

  const roomName = roomname; // Assumes URL is /RoomPage/<roomName>/<username>
  const username = sessionStorage.getItem("username"); // Extract username



  const wsRef = useRef<WebSocket | null>(null); // Explicitly typing as WebSocket | null

  useEffect(() => {
      const wsUrl = `${WS_URL}roomChat/${roomName}/`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws; // Store WebSocket instance in ref

      ws.onopen = async () => {
        console.log('WebSocket connected');
        const roomName = roomname; // Replace with your dynamic room name logic
  
        if (typeof roomName === "string") {
          if (!isParticipantsVisible) {
            await getParticipants(roomName); // Pass only if roomName is a string
          }
        } else {
          console.error("Invalid room name");
        }
      };
      
      

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        // If the server sends historical messages (on initial connection)
        if (data.messages) {
        // Set the initial messages state with the retrieved messages
          setMessages(data.messages);
        }
        // Update messages when a new message is received
        if (data.text) {
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: data.sender, text: data.text, roomname: data.roomname },
          ]);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      // Cleanup WebSocket connection when component unmounts
      return () => {
        if (wsRef.current) {
          wsRef.current.close(); // No TypeScript error now
        }
      };
  },[roomName, username]); 


  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);


  const sendEmoji = (emoji: string): void => {
      const message = {
        sender: username, // The sender's username
        text: emoji, // The message text
        roomname: roomName, // The chat room
      };
  
      // Send the message via WebSocket
      if(wsRef.current){
        wsRef.current.send(JSON.stringify(message));
      }
  
      // Clear input after sending
      //setMessageInput('');
  };
  
  const sendMessage = async () => {
    if (messageInput.trim() && wsRef.current) {
      const message = {
        sender: username, // The sender's username
        text: messageInput, // The message text
        roomname: roomName, // The chat room
      };
  
      // Send the message via WebSocket
      wsRef.current.send(JSON.stringify(message));
  
      // Clear input after sending
      setMessageInput('');
    }
  };
  






  // Set up WebSocket connection
  useEffect(() => {
    if (!roomname) {
      console.error('Room name is missing!');
      return;
    }
    const socket = new WebSocket(`${WS_URL}room/${roomname}/`);
  
    const handleOpen = () => {
      console.log('WebSocket connected');
    };
  
    const handleError = (error: Event) => {
      console.error('WebSocket error:', error);
    };
  
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.event === 'upload') {
          const videoUrl = data.upload_data.video_url;
          setVideoUrl(videoUrl);
        } else if (data.event === 'sync') {
          console.log(data);
          const videoUrl = data.sync_data.video_url;
          const videoTimestamp = data.sync_data.timestamp;
          const state=data.sync_data.state;
          requestAnimationFrame(()=>{
            if(videoRef.current){
              console.log(videoRef.current.src);
              console.log(videoUrl);
              if(videoRef.current.src != videoUrl){
                console.log("Vid");
                videoRef.current.src=videoUrl;
              }
              if(videoRef.current.currentTime!= videoTimestamp){
                console.log("Ts");
                videoRef.current.currentTime = videoTimestamp;
              }
              if(state === "playing"){
                
                //videoRef.current.muted=true;
                videoRef.current.oncanplaythrough = () => {
                  if(videoRef.current){
                    console.log("play");
                    videoRef.current.play().catch((error) => {
                    console.error('Error playing video:', error);
                    });
                  }
                  }
              }
              else {
                console.log("pause");
                videoRef.current.pause();
                videoRef.current.oncanplaythrough = null;
              }
            }
          })
        }
        else if(data.event==='newuser'){
          console.log("Yo");
          console.log(videoRef.current);
          var statenow="";
          if(videoRef.current && isHost){
            if(videoRef.current.paused){
                statenow="paused";
            }
            else{
              statenow="playing";
            }
            var time=videoRef.current.currentTime;
           
            socket.send(
              JSON.stringify({
                event: 'sync',
                sync_data: {
                  video_url: videoRef.current.src,
                  timestamp: time,
                  state: statenow, // State to indicate playback
                },
              })
            );
          }
          
        }
        else if(data.event === "leave"){
          window.location.href="http://localhost:3000/Rate";
        }
      } catch (error) {
        console.error('Error handling message data:', error);
      }
    };
  
    const handleClose = (event: CloseEvent) => {
      console.log('WebSocket disconnected:', event);
    };
  
    socket.addEventListener('open', handleOpen);
    socket.addEventListener('error', handleError);
    socket.addEventListener('message', handleMessage);
    socket.addEventListener('close', handleClose);
  
    setWs(socket);
    if (videoRef.current) {
      const videoElement = videoRef.current;
  
      // Event handler for play
      const handlePlay = () => {
        console.log(isHost);
        console.log(ws);
        console.log(socket);
        if (socket && isHost) {
          console.log("Helloe2!")
          socket.send(
            JSON.stringify({
              event: 'sync',
              sync_data: {
                video_url: videoElement.src,
                timestamp: videoElement.currentTime,
                state: 'playing', // State to indicate playback
              },
            })
          );
        }
      };
  
      // Event handler for pause
      const handlePause = () => {
        if (socket && isHost ) {
          console.log('Video is paused');
          socket.send(
            JSON.stringify({
              event: 'sync',
              sync_data: {
                video_url: videoElement.src,
                timestamp: videoElement.currentTime,
                state: 'paused', // State to indicate paused
              },
            })
          );
        }
      };

  
      // Attach event listeners
      videoElement.addEventListener('play', handlePlay);
      videoElement.addEventListener('pause', handlePause);
  
      // Cleanup event listeners on unmount
      return () => {
        videoElement.removeEventListener('play', handlePlay);
        videoElement.removeEventListener('pause', handlePause);
      };
    }
    // Cleanup on component unmount or dependency change
    return () => {
      socket.removeEventListener('open', handleOpen);
      socket.removeEventListener('error', handleError);
      socket.removeEventListener('message', handleMessage);
      socket.removeEventListener('close', handleClose);
      socket.close();
    };
  }, [roomname]);
   // You may need to ensure `roomname` is available
  

  // Handle video URL submission
  const handleLinkSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await fetch(`${API_URL}Room/get-video-stream/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: linkInput }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch video URL');
      }

      const data = await response.json();
      const vidElement=videoRef.current;
      if(vidElement){
        vidElement.autoplay=false;
      }
      if (data.stream_url) {
        setVideoUrl(data.stream_url);

      

        
        // Notify other users about the new stream
        if (ws) {
          ws.send(
            JSON.stringify({
              event: 'upload',
              upload_data: { video_url: data.stream_url },
            })
          );
        }
      } else {
        alert('Error: Invalid video/audio stream.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to load the video.');
    }
  };

  // Send message to the room
  // const sendMessage = () => {
  //   if (messageInput.trim() && ws) {
  //     ws.send(
  //       JSON.stringify({
  //         event: 'message',
  //         message_data: { sender: 'You', text: messageInput },
  //       })
  //     );

  //     setMessages((prevMessages) => [
  //       ...prevMessages,
  //       { sender: 'You', text: messageInput },
  //     ]);
  //     setMessageInput('');
  //   }
  // };
  


  const getParticipants = async (roomName: string): Promise<void> => {
    try {
      const response = await axios.get(`${API_URL}Room/get-participants/`, {
        params: { room_name: roomName },
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response.data.participants);
      // Update participants state
      setParticipants(response.data.participants);
    } catch (error: any) {
      if (error.response) {
        // Server responded with a status other than 200 range
        console.error("Error fetching participants:", error.response.data);
      } else if (error.request) {
        // Request was made but no response received
        console.error("No response received:", error.request);
      } else {
        // Other errors
        console.error("Error:", error.message);
      }
    }
  };
  

  const toggleParticipants = async () => {
    // Ensure roomName is a valid string
    const roomName = roomname; // Replace with your dynamic room name logic
  
    if (typeof roomName === "string") {
      if (!isParticipantsVisible) {
        await getParticipants(roomName); // Pass only if roomName is a string
      }
      setIsParticipantsVisible((prev) => !prev);
    } else {
      console.error("Invalid room name");
    }
  };
  

  const openLinkModal = () => {
    setIsLinkModalOpen(true);
  };


  const leaveRoom = async (roomName: string, userName: string): Promise<void> => {
    try {
      const response = await axios.get(`${API_URL}Room/leave-room/`, {
        params: {
          room_name: roomName,
          user_name: userName,
        },
      });
      
      if (response.status === 200) {
        console.log(response.data.message);
        alert(response.data.message); // Show success message
        // Optionally navigate to another page or update state
      } else {
        console.error('Unexpected response:', response);
      }
      if (ws && isHost) {
        ws.send(
          JSON.stringify({
            event: 'leave',
            upload_data: "",
          })
        );
      }
      window.location.href="http://localhost:3000/Rate";
    } catch (error: any) {
      if (error.response) {
        console.error('API Error:', error.response.data.error);
        alert(`Error: ${error.response.data.error}`); // Show error message
      } else {
        console.error('Unexpected Error:', error);
        alert('An unexpected error occurred while leaving the room.');
      }
    }
    
  };
  
  const handleCopyRoomLink = () => {
    if (typeof roomName === "string") {
      let currentUrl = window.location.href;
  
      // Check if the URL ends with 'h' after the last '/'
      if (currentUrl.endsWith('/h')) {
        currentUrl = currentUrl.slice(0, -1) + 'nh'; // Replace 'h' with 'nh'
      }
  
      navigator.clipboard
        .writeText(currentUrl)
        .then(() => alert("Room link copied to clipboard!"))
        .catch(() => alert("Failed to copy room link."));
    } else {
      alert("Invalid room name. Cannot copy.");
    }
  };
  
  
  



  return (
    <div
      className="flex flex-col h-screen text-white"
      style={{
        background: 'linear-gradient(to right, rgb(32, 32, 32), rgb(90, 82, 82), rgb(39, 38, 38))',
        fontFamily: "'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif",
      }}
    >
      {/* Main content */}
      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Video Section */}
        <div className="flex-1 flex items-center justify-center p-4 bg-[#171717]">
          <video
            ref={videoRef}
            controls
            className="w-full h-full rounded-3xl"
            style={{ maxWidth: '100%', maxHeight: '100%' }}
            src={videoUrl ? videoUrl : undefined}
          >
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Chat Section */}
        <div className="w-full lg:w-1/4 p-4 flex flex-col">
        <div>
        <div className="flex gap-4 mt-2 pb-5">
          <button
            onClick={() => {
              console.log("Joining voice chat...");
              // Add functionality to join voice chat here
              enterVoiceRoom(roomName);
            }}
            className="flex-1 p-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
          >
            Join Voice Chat
          </button>
          <button
            onClick={() => {
              console.log("Leaving voice chat...");
              // Add functionality to leave voice chat here
              leaveVoiceRoom();
            }}
            className="flex-1 p-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
          >
            Leave Voice Chat
          </button>
        </div>
      </div>

          {/* Room Chat */}
          
          <div
            className="flex-1 overflow-y-auto border border-gray-600 rounded-lg p-2 bg-black"
            style={{ maxHeight: '400px' }}
          >
            {messages.map((message, index) => (
              <div key={index} className="p-2">
                <span className="font-bold">{message.sender}: </span>
                <span>{message.text}</span>
              </div>
            ))}
            <div ref={messagesEndRef}></div>
          </div>

          {/* Emoji Picker */}
          {showEmojis && (
            <div className="flex flex-wrap bg-[#272626] p-2 rounded-lg mt-2">
              {emojiList.map((emoji) => (
                <button
                  key={emoji}
                  className="text-2xl p-1 cursor-pointer hover:opacity-80"
                  onClick={() => sendEmoji(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Message Input */}
          <div className="flex items-center p-2 rounded-lg mt-4 bg-[#272626]">
            <input
              type="text"
              placeholder="Type a message"
              className="flex-1 p-2 rounded-lg mr-2 bg-[#272626] text-white focus:outline-none"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') sendMessage();
              }}
            />
            <button
              onClick={sendMessage}
              className="p-2 rounded-full bg-[#171717] text-white"
            >
              <FiSend />
            </button>
            <button
              onClick={() => setShowEmojis((prev) => !prev)}
              className="p-2 ml-2 rounded-full bg-[#272626] text-white"
            >
              😊
            </button>
          </div>

          {/* Recording Indicator */}
          {isRecording && (
            <div className="text-center text-pink-600 mt-2">Recording...</div>
          )}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="flex justify-around items-center gap-4 p-4">
      <button
          onClick={() => {
            if (typeof roomName === 'string' && typeof username === 'string') {
              leaveRoom(roomName, username);
            } else {
              console.error('roomName or username is not a string');
            }
          }}
          className="p-2 rounded-lg w-1/4 text-white bg-[#171717]"
        >
          Leave Room
        </button>
          <button onClick={toggleParticipants} className="p-2 rounded-lg w-1/4 text-white bg-[#171717]" >Participants ({participants.length}) </button>
          <ParticipantsPopup
            isVisible={isParticipantsVisible}
            participants={participants}
            onClose={toggleParticipants}
          />
    
       
          
      
        {isHost && (
          <button
            onClick={openLinkModal}
            className="p-2 rounded-lg w-1/4 text-white flex items-center justify-center bg-[#171717]"
          >
            <FiVideo className="mr-2" />
            Share Video Link
          </button>
          
          
        )}
         <button
              onClick={handleCopyRoomLink}
              className="p-2 rounded-lg w-1/4 text-white flex items-center justify-center bg-[#171717]"
            >
              Copy Stream Link
            </button>
      </div>

      {/* Modal for Link Submission */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-6 rounded-lg w-96">
            <h2 className="text-2xl mb-4">Enter Video Link</h2>
            <form onSubmit={handleLinkSubmit}>
              <input
                type="text"
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                className="w-full p-2 mb-4 rounded-md bg-gray-700 text-white"
                placeholder="Paste video/audio URL here"
              />
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setIsLinkModalOpen(false)}
                  className="bg-red-600 p-2 rounded-md"
                >
                  Cancel
                </button>
                <button type="submit" className="bg-blue-600 p-2 rounded-md">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default RoomPage;
