import React, { useState } from 'react';
import axios from 'axios';
import './index.css';

const FilterByMoodPopup = ({ onClose, onFilter }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [mood, setMood] = useState('');


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
          'http://localhost:5006/diary/entries',
          { start_date: startDate, end_date: endDate, mood: mood },
          { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      onFilter(response.data.entries);
      onClose();
    } catch (error) {
      console.error('Error filtering entries:', error.response ? error.response.data : error.message);
    }
};



  return (
    <>
      <div className="popup-overlay" onClick={onClose}></div>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <h2>Filter Entries by Mood</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Start Date:
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="modal-input"
            />
          </label>
          <label>
            End Date:
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="modal-input"
            />
          </label>
          <label>
            Mood:
            <select
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="modal-select"
            >
              <option value="">All</option>
              <option value="Sad">Sad</option>
              <option value="Happy">Happy</option>
              <option value="Neutral">Neutral</option>
            </select>
          </label>
          <button type="submit" className="modal-button">Apply Filters</button>
          <button type="button" onClick={onClose} className="modal-button modal-close-button">Close</button>
        </form>
      </div>
    </>
  );
};

export default FilterByMoodPopup;
