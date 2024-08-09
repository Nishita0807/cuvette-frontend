import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faPaperPlane, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import Main from "./images/main.png"; // Assuming you have an image file named 'main.png'
import { BrowserRouter as Router, Routes, Route, Link,Navigate } from 'react-router-dom';

function App() {
  const [groups, setGroups] = useState([]);
  const [notes, setNotes] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupColor, setNewGroupColor] = useState("#3B82F6");
  const [isSidebarHidden, setIsSidebarHidden] = useState(false); // Set initial state based on screen width

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsSidebarHidden(false); // Show sidebar on larger screens
      } else {
        setIsSidebarHidden(true); // Hide sidebar on smaller screens
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await axios.get('https://cuvette-backend-flax.vercel.app/groups'); // Replace with your backend URL
      setGroups(response.data);
    } catch (error) {
      console.error(error);
    }
  };
  function getInitials(name) {
    const words = name.split(' ');
    if (words.length === 1) {
      // Single word: take the first letter
      return words[0][0].toUpperCase();
    } else {
      // Multiple words: take the first letter of the first two words
      return (words[0][0] + words[1][0]).toUpperCase();
    }
  }

  const fetchNotes = async (groupId) => {
    try {
      const response = await axios.get(`https://cuvette-backend-flax.vercel.app/notes/${groupId}`);
      setNotes(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSendClick = async () => {
    if (inputValue.trim() === "") return;

    try {
      const response = await axios.post(`https://cuvette-backend-flax.vercel.app/notes/${selectedGroup._id}`, {
        text: inputValue
      });
      if (response.status === 201) {
        fetchNotes(selectedGroup._id); // Refresh notes
        setInputValue("");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleGroupNameChange = (e) => {
    setNewGroupName(e.target.value);
  };

  const handleColorChange = (color) => {
    setNewGroupColor(color);
  };

  const createNewGroup = async () => {
    if (newGroupName.trim() === "") return;

    try {
      const response = await axios.post('https://cuvette-backend-flax.vercel.app/groups', {
        groupName: newGroupName,
        groupColor: newGroupColor
      });
      if (response.status === 201) {
        fetchGroups(); // Refresh groups
        setNewGroupName("");
        setNewGroupColor("#3B82F6");
        closeModal();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleOutsideClick = (e) => {
    if (isModalOpen && e.target === document.getElementById('modal-container')) {
      closeModal();
    }
  };

  const handleGroupClick = async (group) => {
    setSelectedGroup(group);
    await fetchNotes(group._id);
    if (window.innerWidth <= 768) {
      setIsSidebarHidden(true);
    }
  };
  
  const handleBackButtonClick = () => {
    setSelectedGroup(null);
    if (window.innerWidth <= 768) {
      setIsSidebarHidden(false);
    }
  };
  
 

  return (
    <Router>
      <div className="app" onClick={handleOutsideClick}>
        <div className={`sidebar ${isSidebarHidden ? 'hidden' : ''}`}>
          <div className="sticky-header">
            <h2>Pocket Notes</h2>
          </div>
          <div className="notes-list">
            {groups.map(group => (
              <GroupItem
                key={group._id}
                color={group.groupColor}
                text={group.groupName}
                name=          {getInitials(group.groupName)}

                onClick={() => handleGroupClick(group)}
                active={selectedGroup?._id === group._id}
              />
            ))}
          </div>
          <div className="sticky-add-button">
            <button className="add-button" onClick={openModal}>+</button>
          </div>
        </div>
        <div className={`main-content ${isSidebarHidden ? 'hidden' : ''}`}>
          <Routes>
            <Route path="/" element={
              <div className="default-content">
                <img src={Main} alt="Main illustration" />
                <h1>Pocket Notes</h1>
                <p>Send and receive messages without keeping your phone online. <br />Use Pocket Notes on up to 4 linked devices and 1 mobile phone.</p>
                <div style={{ position: "fixed", bottom: "12px"}}>
                  <FontAwesomeIcon icon={faLock} /> end-to-end encrypted
                </div>
              </div>
            } />
               <Route path="/group/:groupId" element={
              selectedGroup ? (
                <NoteContent 
                  notes={notes}
                  selectedGroup={selectedGroup}
                  inputValue={inputValue}
                  handleInputChange={handleInputChange}
                  handleSendClick={handleSendClick}
                  handleBackButtonClick={handleBackButtonClick}
                />
              ) : (
                <Navigate to="/" replace />
              )
            } />
          </Routes>
        </div>
        {isModalOpen && (
          <div id="modal-container" className="modal">
            <div className="modal-content">
              <h2>Create New Group</h2>
              <div className='modal-group'>
                <span>Group name</span>
                <input
                  type="text"
                  placeholder="Enter group name"
                  value={newGroupName}
                  onChange={handleGroupNameChange}
                />
              </div>
              <div className="color-picker">
                <span>Choose color</span>
                <div className="colors">
                  <div
                    className="color-option"
                    style={{ backgroundColor: "#A78BFA" }}
                    onClick={() => handleColorChange("#A78BFA")}
                  />
                  <div
                    className="color-option"
                    style={{ backgroundColor: "#ff79f2" }}
                    onClick={() => handleColorChange("#ff79f2")}
                  />
                  <div
                    className="color-option"
                    style={{ backgroundColor: "#44e6fd" }}
                    onClick={() => handleColorChange("#44e6fd")}
                  />
                  <div
                    className="color-option"
                    style={{ backgroundColor: "#f29477" }}
                    onClick={() => handleColorChange("#f29477")}
                  />
                  <div
                    className="color-option"
                    style={{ backgroundColor: "#0248ff" }}
                    onClick={() => handleColorChange("#0248ff")}
                  />
                  <div
                    className="color-option"
                    style={{ backgroundColor: "#60A5FA" }}
                    onClick={() => handleColorChange("#60A5FA")}
                  />
                </div>
              </div>
              <button onClick={createNewGroup}>Create</button>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
}

function NoteContent({ notes, selectedGroup, inputValue, handleInputChange, handleSendClick, handleBackButtonClick }) {
  if (!selectedGroup) {
    return (
      <div className="note-content">
       
      </div>
    );
  }
  function getInitials(name) {
    const words = name.split(' ');
    if (words.length === 1) {
      // Single word: take the first letter
      return words[0][0].toUpperCase();
    } else {
      // Multiple words: take the first letter of the first two words
      return (words[0][0] + words[1][0]).toUpperCase();
    }
  }

  return (
    <div className="note-content">
      <div className="note-header">
        {window.innerWidth <= 768 && (
          <button className="back-button" onClick={handleBackButtonClick}>
            <FontAwesomeIcon icon={faArrowLeft} color='white' />
          </button>
        )}
        <div className="note-circle" style={{ backgroundColor: selectedGroup.groupColor }}>
          {getInitials(selectedGroup.groupName)}
        </div>
        <span>{selectedGroup.groupName}</span>
      </div>
      <div className="note-body">
        {notes && notes.length > 0 ? (
          notes.map((item, i) => (
            <div key={i} className="note-card">
              <p>{item.text}</p>
              <div className="note-footer">
                <span>{new Date(item.createdAt).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })} • {new Date(item.createdAt).toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
              </div>
            </div>
          ))
        ) : (
          <p>No content available</p>
        )}
      </div>
      <div className="note-input">
        <textarea
          placeholder="Enter your text here..."
          value={inputValue}
          onChange={handleInputChange}
        />
        <button onClick={handleSendClick} disabled={!inputValue}>
          <FontAwesomeIcon icon={faPaperPlane} />
        </button>
      </div>
    </div>
  );
}


function GroupItem({ color, text, name, onClick, active }) {
  return (
<Link 
  to={`/group/${active ? text.toLowerCase().replace(/\s/g, '') : text.toLowerCase().replace(/\s/g, '')}`} 
  style={{ textDecoration: 'none', color: 'black' }}
>      <div
        className={`note-item ${active ? 'active' : ''}`}
        onClick={onClick}
        style={active ? { backgroundColor: '#E5E7EB' } : {}}
      >
        <div
          className="circle"
          style={{
            backgroundColor: color,
            display: "flex",
            color: "white",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          {name}
        </div>
        <span style={{ fontWeight: "bold" }}>{text}</span>
      </div>
    </Link>
  );
}

export default App; 