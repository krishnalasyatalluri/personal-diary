import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './dashboard.css'; 
import NewEntryPopup from '../NewEntryForm/index'; 
import EditEntryPopup from '../EditEntryPopup'; 

function Dashboard() {
  const [entries, setEntries] = useState([]);
  const [mood, setMood] = useState('');
  const [tags, setTags] = useState('');
  const [date, setDate] = useState('');
  const [showPopup, setShowPopup] = useState(false); 
  const [editingEntry, setEditingEntry] = useState(null); 
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    let url = 'http://localhost:5006/diary/entries';
    if (mood || tags || date) {
      url += `?mood=${mood}&tags=${tags}&date=${date}`;
    }

    axios.get(url, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(response => setEntries(response.data.entries))
      .catch(error => console.error(error));
  }, [token, mood, tags, date]);

  const handleDelete = (entryId) => {
    axios.delete(`http://localhost:5006/diary/delete-entry/${entryId}`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(() => setEntries(entries.filter(entry => entry._id !== entryId)))
      .catch(error => console.error('Error deleting entry:', error));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleAddEntry = (newEntry) => {
    setEntries([...entries, newEntry]);
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry); 
  };

  const handleUpdateEntry = (updatedEntry) => {
    setEntries(entries.map(entry => (entry._id === updatedEntry._id ? updatedEntry : entry)));
    setEditingEntry(null); 
  };

  return (
    <div className="dashboard-wrapper">
      <nav className="sidebar">
        <div className="sidebar-top">
          <button onClick={() => navigate('/filter-by-mood')} className='filter-button1' style={{marginTop:'115px'}}>Filter by Mood</button>
          <button onClick={() => navigate('/filter-by-date')} className='filter-button2'>Filter by Date</button>
        </div>
      </nav>
      <main className="content-area">
        <div className="actions-container">
          <button onClick={() => setShowPopup(true)} className="new-entry-button" style={{marginTop:'-80px',marginRight:'800px'}}>Add New Entry</button>
          <button onClick={handleLogout} className="logout-button" style={{marginTop:'-80px',marginRight:'5px'}}>Logout</button>
        </div>
        <table className="entries-table" style={{width:'1050px',marginBottom:'70px',marginRight:'35px'}}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Title</th>
              <th>Mood</th>
              <th>Tags</th>
              <th>Content</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(entry => (
              <tr key={entry._id}>
                <td>{entry.date}</td>
                <td>{entry.title}</td>
                <td>{entry.mood}</td>
                <td>{Array.isArray(entry.tags) ? entry.tags.join(', ') : entry.tags}</td>
                <td>{entry.content}</td>
                <td>
                  <button onClick={() => handleEdit(entry)} className="edit-button">Edit</button>
                  <button onClick={() => handleDelete(entry._id)} className="delete-button">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {showPopup && (
          <NewEntryPopup onClose={() => setShowPopup(false)} onAddEntry={handleAddEntry} />
        )}
        {editingEntry && (
          <EditEntryPopup
            entry={editingEntry}
            onClose={() => setEditingEntry(null)}
            onUpdateEntry={handleUpdateEntry}
          />
        )}
      </main>
    </div>
  );
}

export default Dashboard;
