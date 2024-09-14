import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import './index'
const DiaryEntryForm = () => {
  const [form, setForm] = useState({ title: '', mood: '', tags: '', content: '', date: '' });
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const { entryId } = useParams();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (entryId) {
      axios.get(`http://localhost:5006/diary/entries/${entryId}`, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(response => {
          setForm(response.data.entry);
          setIsEditing(true);
        })
        .catch(error => console.error(error));
    }
  }, [entryId, token]);

  const handleSubmit = () => {
    const url = isEditing ? `http://localhost:5006/diary/update-entry/${entryId}` : 'http://localhost:5006/diary/add-entry';
    const method = isEditing ? 'put' : 'post';

    axios[method](url, form, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(() => navigate('/entries-list'))
      .catch(error => console.error(error));
  };

  return (
    <div>
      <h2>{isEditing ? 'Edit' : 'Add'} Diary Entry</h2>
      <input
        type="text"
        placeholder="Title"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />
      <input
        type="text"
        placeholder="Mood"
        value={form.mood}
        onChange={(e) => setForm({ ...form, mood: e.target.value })}
      />
      <input
        type="text"
        placeholder="Tags (comma separated)"
        value={form.tags}
        onChange={(e) => setForm({ ...form, tags: e.target.value })}
      />
      <textarea
        placeholder="Content"
        value={form.content}
        onChange={(e) => setForm({ ...form, content: e.target.value })}
      />
      <input
        type="date"
        placeholder="Date"
        value={form.date}
        onChange={(e) => setForm({ ...form, date: e.target.value })}
      />
      <button onClick={handleSubmit}>{isEditing ? 'Update' : 'Add'} Entry</button>
    </div>
  );
};

export default DiaryEntryForm;
