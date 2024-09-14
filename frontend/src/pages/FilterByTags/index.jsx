
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './index'
const FilterByTags = () => {
  const [entries, setEntries] = useState([]);
  const [tags, setTags] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (tags) {
      axios.get(`http://localhost:5006/diary/entries/tags/${tags}`, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(response => setEntries(response.data.entries))
        .catch(error => console.error(error));
    } else {
      setEntries([]); 
    }
  }, [tags, token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleDelete = (entryId) => {
    axios.delete(`http://localhost:5006/diary/delete-entry/${entryId}`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(() => setEntries(entries.filter(entry => entry.entry_id !== entryId)))
      .catch(error => console.error(error));
  };

  return (
    <div className="filter-by-tags-container">
      <nav className="filter-by-tags-navbar">
        <button className="nav-button" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
        <button className="nav-button logout-button" onClick={handleLogout}>Logout</button>
      </nav>
      <main className="filter-by-tags-main">
        <h1>Filter by Tags</h1>
        <div className="filter-group">
          <label htmlFor="tags">Tags</label>
          <input
            type="text"
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
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
              <tr key={entry.entry_id}>
                <td>{entry.date}</td>
                <td>{entry.title}</td>
                <td>{entry.mood}</td>
                <td>{entry.tags.join(', ')}</td>
                <td>{entry.content}</td>
                <td>
                  <button onClick={() => handleDelete(entry.entry_id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default FilterByTags;
