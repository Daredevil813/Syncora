import React from "react";
import "./roomPage.css";

const ParticipantsPopup: React.FC<{
    isVisible: boolean;
    participants: string[];
    onClose: () => void;
  }> = ({ isVisible, participants, onClose }) => {
    if (!isVisible) return null;
  
    return (
      <div className="modal-overlay">
        <div className="modal-box">
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
          <h3 className="text-lg font-bold mb-4">Participants</h3>
          <ul>
            {participants.map((participant, index) => (
              <li key={index} className="p-2 border-b">
                {participant}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

export default ParticipantsPopup;
