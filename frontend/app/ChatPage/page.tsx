'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { FiSend, FiMic, FiPause, FiPlay, FiSquare } from 'react-icons/fi';
import axios from 'axios';
import Navbar from "@/components/navbar";

interface Message {
  sender: string;
  receiver: string;
  message: string;
  timestamp: string;
  audio_file?: string; // Optional field for audio URL
}

const WS_URL = 'ws://127.0.0.1:8000/ws/chat/';
const API_URL = 'http://127.0.0.1:8000/api/';
const media_URL = 'http://127.0.0.1:8000';

const ChatPage: React.FC = () => {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [friends, setFriends] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [issend,setIsSend]=useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const params = useParams();
  const username = sessionStorage.getItem("username") || "";

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (audioBlob && issend) {
      // audioBlob has been set, now you can send it
      console.log("Audio blob is ready:", audioBlob);
      handleSendMessage();
      setIsSend(false);
    }
  }, [audioBlob]); // Trigger this effect when audioBlob changes
  // Establish WebSocket connection when activeChat changes
  useEffect(() => {
    if (activeChat) {
      const sortedUsers = [username, activeChat].sort();
      const ws = new WebSocket(`${WS_URL}${sortedUsers[0]}_${sortedUsers[1]}/`);

      ws.onopen = async () => {
        console.log('WebSocket connected');

        try {
          const response = await axios.get(`${API_URL}chat/messages/${sortedUsers[0]}/${sortedUsers[1]}/`);
          console.log(response.data);
          setMessages(response.data);
        } catch (error) {
          console.error('Error fetching previous messages:', error);
        }
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (!data.audio_file ) {
          setMessages((prev) => [
            ...prev,
            {
              sender: data.sender,
              receiver: data.receiver,
              message: data.message,
              timestamp: data.timestamp,
            },
          ]);
        }
        else{
          setMessages((prev) => [
            ...prev,
            {
              sender: data.sender,
              receiver: data.receiver,
              audio_file: data.audio_file,
              timestamp: data.timestamp,
              message:'',
            },
          ]);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = async () => {
        console.log('WebSocket closed');
      };

      setSocket(ws);

      return () => {
        ws.close();
      };
    }
  }, [activeChat, username]);

  // Fetch friends list
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await fetch(`${API_URL}friends/${username}/`);
        const data = await response.json();
        setFriends(data);
      } catch (error) {
        console.error('Error fetching friends list:', error);
      }
    };
    fetchFriends();
  }, [username]);

  // Scroll to the latest message when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  const handleSendMessage = async () => {
    if(!isRecording){
      setAudioBlob(null);
    }
    console.log("Here");
    if (isRecording) {
      setIsSend(true);
      handleStopRecording(); // Stop recording if active
      
    }
  
    console.log(audioBlob);
    console.log(activeChat);
  
    if (audioBlob && activeChat && !newMessage) {
      // Handle sending voice message
      const formData = new FormData();
      formData.append('sender', username);
      formData.append('receiver', activeChat);
      formData.append('audio_file', audioBlob, 'voice_message.wav');
      formData.append('timestamp', new Date().toISOString());
  
      try {
        const response = await axios.post(`${API_URL}create-voice-message/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        console.log('Voice message sent:', response.data);
  
        // Create the message object for the voice message
        const newVoiceMessage = {
          sender: username,
          receiver: activeChat,
          message: '', // No text for voice messages
          timestamp: new Date().toISOString(),
          audio_file: response.data.audio_file, // The URL of the uploaded audio file
        };
        socket?.send(JSON.stringify(newVoiceMessage))
  
        setAudioBlob(null); // Clear the audio after sending
      } catch (error) {
        console.error('Error sending voice message:', error);
      }
    } else if (newMessage.trim() && activeChat) {
      // Handle sending text message
      const message = {
        sender: username,
        receiver: activeChat,
        message: newMessage,
        timestamp: new Date().toISOString(),
        audio_file: '',
      };
  
      // Add the text message to the list of messages
      socket?.send(JSON.stringify(message));
  
      try {
        const response = await axios.post(`${API_URL}newmessage/`, message);
        console.log('Messages saved:', response.data);
  
      } catch (error) {
        console.error('Error saving message:', error);
      }
  
      setNewMessage(''); // Clear the new message after sending
    }
  };
  

  const handleStartRecording = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          const mediaRecorder = new MediaRecorder(stream);
          const audioChunks: Blob[] = [];

          mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
          };

          mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            console.log("Created!");
            setAudioBlob(audioBlob);
            setIsRecording(false);
          };

          mediaRecorder.start();
          mediaRecorderRef.current = mediaRecorder;
          setIsRecording(true);
        })
        .catch((error) => console.error('Error accessing microphone:', error));
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop(); 
      console.log("Stopped");
      setAudioBlob(null);// Stop the recording
    }
  };
  
  
  const handlePlayAudio = (audioPath: string) => {
    const audioUrl = `${media_URL}${audioPath}`; // Combine base URL with the audio path
  
    if (audioPlayer && audioPlayer.src === audioUrl) {
      // If the same audio is already playing, resume it
      if (audioPlayer.paused) {
        audioPlayer.play();
      }
    } else {
      // If it's a new audio file, create a new audio player
      if (audioPlayer) {
        audioPlayer.pause(); // Pause the previous audio if any
      }
      const newPlayer = new Audio(audioUrl);
      newPlayer.onended = () => {
        // Reset player state when the audio finishes
        setAudioPlayer(null); // Optionally reset the audio player state
      };
      setAudioPlayer(newPlayer); // Store the new player
      newPlayer.play(); // Start playing the new audio
    }
  };
  
  
  // Function to stop the audio
  const handleStopAudio = () => {
    if (audioPlayer) {
      audioPlayer.pause(); // Pause the audio
      audioPlayer.currentTime = 0; // Reset to the start of the audio
      setAudioPlayer(null); // Reset the audio player state
    }
  };
  

  const toggleRecording = () => {
    if (isRecording) {
      handleStopRecording();
      setAudioBlob(null); // Stop recording
    } else {
      handleStartRecording(); // Start recording
    }
  };

  const filteredFriends = friends.filter((friend) =>
    friend.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMessages = messages;

  return (
    <div>
      <Navbar/>
      <div className="flex h-screen text-white" style={{ background: 'linear-gradient(to right, rgb(32, 32, 32), rgb(90, 82, 82), rgb(39, 38, 38))' }}>
        {/* Friends List */}
        <div className="w-1/4 p-4 overflow-y-auto rounded-3xl" style={{ backgroundColor: '#171717' }}>
          <h2 className="text-xl font-bold mb-4">Friends</h2>
          <input
            type="text"
            placeholder="Search Friends"
            className="w-full p-2 rounded-full mb-4"
            style={{ backgroundColor: '#272626', border: 'none', color: 'white' }}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <ul className="space-y-2">
            {filteredFriends.map((friend, index) => (
              <li
                key={index}
                className={`p-2 cursor-pointer rounded-full ${activeChat === friend ? 'border-2 border-pink-500 bg-[#272626]' : 'bg-[#272626]'}`}
                onClick={() => setActiveChat(friend)}
              >
                {friend}
              </li>
            ))}
          </ul>
        </div>

        {/* Chat Section */}
        <div className="w-3/4 p-4 flex flex-col">
          {activeChat ? (
            <div className="flex flex-col h-full">
              <div className="p-4 text-white flex items-center justify-between shadow-md rounded-full mb-2" style={{ backgroundColor: '#171717' }}>
                <h2 className="text-lg font-semibold">{activeChat}</h2>
              </div>
              <div className="flex-1 overflow-y-auto mb-4 mt-2">
                <div className="space-y-4 px-4">
                {filteredMessages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.sender === username ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-sm md:max-w-md p-3 text-sm md:text-base rounded-lg shadow-lg ${
                      message.sender === username
                        ? 'bg-gradient-to-r from-gray-700 to-black text-white'
                        : 'bg-gradient-to-r from-gray-700 to-black text-white'
                    }`}
                    style={{
                      wordBreak: 'break-word', // Breaks long text for better layout
                    }}
                  >
                      {message.audio_file ? (
                        
                        <div className="flex items-center space-x-4">
                          {/* Audio Control Buttons */}
                          {!audioPlayer || audioPlayer.src !== `${media_URL}${message.audio_file}` ? (
                            <button
                              onClick={() => handlePlayAudio(message.audio_file!)}
                              className="text-white bg-green-500 p-2 rounded-full hover:bg-green-400"
                            >
                              <FiPlay size={20} />
                            </button>
                          ) : (
                            <button  className="text-white bg-red-500 p-2 rounded-full hover:bg-red-400">
                              <FiPlay size={20} />
                            </button>
                          )}

                          {/* Stop Button */}
                          {audioPlayer && audioPlayer.src === `${media_URL}${message.audio_file}` && (
                            <button onClick={handleStopAudio} className="text-white bg-gray-600 p-2 rounded-full hover:bg-gray-500">
                              <FiSquare size={20} />
                            </button>
                          )}

                          {/* Voice Message Label */}
                          <span className="text-sm text-gray-300">
                            Voice Message - {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      ) : (
                        // Display text message for standard chat messages
                        <span>{message.message}</span>
                      )}
                    </div>
                  </div>
                ))}

                  <div ref={messagesEndRef}></div>
                </div>
              </div>

              {/* Message Input Section */}
              <div className="flex items-center">
                <textarea
                  placeholder="Type your message..."
                  className="w-full p-2 rounded-full bg-[#272626] text-white" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  style={{ textAlign: 'center' }}
                  disabled={isRecording}
                />
                <div className="flex space-x-4 items-center ml-2">
                  <button onClick={toggleRecording} className="p-2 rounded-full bg-[#272626] text-white">
                    {isRecording ? <FiPause size={24} /> : <FiMic size={24} />}
                  </button>
                  <button onClick={handleSendMessage} className="p-2 rounded-full bg-[#272626] text-white">
                    <FiSend size={24} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-white">Select a chat to start messaging</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
