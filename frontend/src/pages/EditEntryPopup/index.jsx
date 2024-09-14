import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css'; 

const EditEntryPopup = ({ entry, onClose, onUpdateEntry }) => {
  const [title, setTitle] = useState('');
  const [mood, setMood] = useState('');
  const [tags, setTags] = useState('');
  const [content, setContent] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (entry) {
      const tagsString = Array.isArray(entry.tags) ? entry.tags.join(', ') : entry.tags || '';
      setTitle(entry.title);
      setMood(entry.mood);
      setTags(tagsString);
      setContent(entry.content);
    }
  }, [entry]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedEntry = {
      title,
      mood,
      tags: tags.split(',').map(tag => tag.trim()),
      content
    };

    axios.put(`http://localhost:5006/diary/update-entry/${entry._id}`, updatedEntry, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => {
      onUpdateEntry(response.data.entry);
      onClose();
    })
    .catch(error => {
      console.error(error);
      alert("Failed to update entry. Please try again.");
    });
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Edit Entry</h2>
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
          <div className="form-buttons">
            <button type="submit">Save Changes</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEntryPopup;
