import React, { useState } from 'react';
import axios from 'axios';

const NewEntryPopup = ({ onClose, onAddEntry }) => {
  const [title, setTitle] = useState('');
  const [mood, setMood] = useState(''); // Default to an empty string
  const [tags, setTags] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState('');
  const token = localStorage.getItem('token');

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEntry = {
      title,
      mood,
      tags: tags.split(',').map(tag => tag.trim()),
      content,
      date,
    };

    axios.post('http://localhost:5006/diary/new-entry', newEntry, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => {
      onAddEntry(response.data.entry);
      onClose();
    })
    .catch(error => {
      console.error(error);
      alert("Failed to add entry. Please try again.");
    });
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Add New Entry</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="mood">Mood</label>
            <select
              id="mood"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              required
            >
              <option value="">Select Mood</option>
              <option value="Happy">Happy</option>
              <option value="Sad">Sad</option>
              <option value="Neutral">Neutral</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="tags">Tags (comma-separated)</label>
            <input
              type="text"
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="content">Content</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          
          </div>
          <div className="form-buttons">
            <button type="submit">Add Entry</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewEntryPopup;
