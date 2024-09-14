import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './index.css'; 
const FilterByDate = () => {
  const [entries, setEntries] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (startDate && endDate && token) {
      setLoading(true);
      setError(null);

      axios.get(`http://localhost:5006/diary/entries/date/${startDate}/${endDate}?sort=${sortOrder}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(response => {
          setEntries(response.data.entries);
        })
        .catch(error => {
          console.error('API Error:', error);
          setError("Failed to fetch entries. Please try again.");
        })
        .finally(() => setLoading(false));
    } else {
      setEntries([]); 
    }
  }, [startDate, endDate, sortOrder, token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id'); 
    navigate('/login');
  };

  const handleDelete = (entryId) => {
    axios.delete(`http://localhost:5006/diary/delete-entry/${entryId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(() => setEntries(entries.filter(entry => entry.entry_id !== entryId)))
      .catch(error => {
        console.error('Delete Error:', error);
        setError("Failed to delete entry. Please try again.");
      });
  };

  const formatTags = (tags) => {
    return Array.isArray(tags) ? tags.join(', ') : 'No tags';
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="filter-by-date-wrapper">
      <aside className="sidebar">
        <h2>Filters</h2>
        <div className="filter-group">
          <label htmlFor="start-date">Start Date</label>
          <input
            type="date"
            id="start-date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label htmlFor="end-date">End Date</label>
          <input
            type="date"
            id="end-date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label htmlFor="sort-order">Sort by Date</label>
          <select
            id="sort-order"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
        <button className="logout-button" onClick={handleLogout} style={{marginBottom:'10px'}}>Logout</button>
        <button onClick={handleBack}style={{backgroundColor:'blue',color:'white',height:'40px',borderRadius:'5px'}}>Back to Dashboard</button>
      </aside>
      <main className="content-area">
        {loading && <p>Loading...</p>}
        {error && <p className="error-message">{error}</p>}
        {!loading && !error && (
          <>
            <table className="entries-table" style={{border:'1px solid ', width:'750px',marginTop: '10px'}}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Title</th>
                  <th>Mood</th>
                  <th>Tags</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(entry => (
                  <tr key={entry.entry_id}>
                    <td>{entry.date}</td>
                    <td>{entry.title}</td>
                    <td>{entry.mood}</td>
                    <td>{formatTags(entry.tags)}</td>
                    <td>
                      <button onClick={() => handleDelete(entry.entry_id)} className='del-btn'>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
          </>
        )}
      </main>
    </div>
  );
};

export default FilterByDate;
