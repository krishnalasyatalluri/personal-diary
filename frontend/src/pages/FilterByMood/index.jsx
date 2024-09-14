import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './index'; 

function FilterByMood() {
  const [entries, setEntries] = useState([]);
  const [mood, setMood] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token'); 

  useEffect(() => {
    if (mood && token) {
      setLoading(true);
      setError(null);

      const fetchEntries = async () => {
        try {
          const response = await axios.get(`http://localhost:5006/diary/entries/mood/${mood}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          setEntries(response.data.entries);
        } catch (error) {
          console.error(error);
          setError(error.response?.data?.error || "Failed to fetch entries. Please try again.");
        } finally {
          setLoading(false);
        }
      };

      fetchEntries();
    } else {
      setEntries([]); 
    }
  }, [mood, token]);

  const handleLogout = () => {
    localStorage.removeItem('token'); 
    navigate('/login');
  };

  const handleDelete = (entryId) => {
    axios.delete(`http://localhost:5006/diary/delete-entry/${entryId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(() => {
        setEntries(entries.filter(entry => entry.entry_id !== entryId));
      })
      .catch(error => {
        console.error(error);
        setError("Failed to delete entry. Please try again.");
      });
  };

  return (
    <div className="filter-by-mood-container">
      <aside className="sidebar">
        <h2>Filters</h2>
        <div className="filter-group">
          <label htmlFor="mood-select">Select Mood:</label>
          <select
            id="mood-select"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
          >
            <option value="">Select Mood</option>
            <option value="Happy">Happy</option>
            <option value="Sad">Sad</option>
            <option value="Neutral">Neutral</option>
          </select>
        </div>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
        <button onClick={() => navigate('/dashboard')} style={{backgroundColor:'blue',marginTop:'10px',color:'white',height:'40px',borderRadius:'5px'}}>Back to Dashboard</button>
      </aside>
      <main className="content-area">
        {loading && <p>Loading...</p>}
        {error && <p className="error-message">{error}</p>}
        {entries.length === 0 && !loading && !error && <p>No entries found for the selected mood.</p>}

        {!loading && !error && entries.length > 0 && (
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
                  <td>{Array.isArray(entry.tags) ? entry.tags.join(', ') : 'No tags'}</td>
                  <td>{entry.content}</td>
                  <td>
                    <button className="delete-button" onClick={() => handleDelete(entry.entry_id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}

export default FilterByMood;
