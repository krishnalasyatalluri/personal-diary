import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './dashboard.css';
import NewEntryPopup from '../NewEntryForm/index';
import EditEntryPopup from '../EditEntryPopup';
import FilterByMoodPopup from '../FilterByMoodPopup';

const Dashboard = () => {
  const [entries, setEntries] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchEntries();
  }, [token]);

  const fetchEntries = async () => {
    try {
      const response = await axios.get('http://localhost:5006/diary/entries', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEntries(response.data.entries);
    } catch (error) {
      console.error('Error fetching entries:', error);
    }
  };

  const handleDelete = async (entryId) => {
    try {
      await axios.delete(`http://localhost:5006/diary/delete-entry/${entryId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEntries(entries.filter(entry => entry._id !== entryId));
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
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

  const handleFilter = (filteredEntries) => {
    setEntries(filteredEntries);
  };

  return (
    <div className="dashboard-wrapper">
      <nav className="sidebar">
        <div className="sidebar-top">
          <button onClick={() => setShowPopup(true)} className="new-entry-button" style={{backgroundColor:'blue',color:'white',width:'160px',height:'35px',borderRadius:'5px',marginBottom:'40px',marginTop:'60px'}}>Add New Entry</button>
        </div>
      </nav>
      <main className="content-area">
        <div className="">
          <button onClick={() => setShowFilterPopup(true)} className='filter-button1' style={{backgroundColor:'blue',color:'white',width:'120px',height:'35px',borderRadius:'5px',marginRight:'400px',marginBottom:'40px'}}>Filters</button>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
        <table className="entries-table">
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
        {showFilterPopup && (
          <FilterByMoodPopup onClose={() => setShowFilterPopup(false)} onFilter={handleFilter} />
        )}
      </main>
    </div>
  );
};

export default Dashboard;
