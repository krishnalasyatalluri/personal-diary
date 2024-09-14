import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DiaryEntriesList = () => {
  const [entries, setEntries] = useState([]);
  const [filter, setFilter] = useState('');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5006/diary/entries', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(response => setEntries(response.data.entries))
      .catch(error => console.error(error));
  }, [token]);

  const handleEdit = (entryId) => {
    navigate(`/edit-entry/${entryId}`);
  };

  const handleDelete = (entryId) => {
    axios.delete(`http://localhost:5006/diary/delete-entry/${entryId}`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(() => setEntries(entries.filter(entry => entry.entry_id !== entryId)))
      .catch(error => console.error(error));
  };

  return (
    <div>
      <input 
        type="text" 
        placeholder="Search entries" 
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <table>
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
          {entries.filter(entry => entry.title.includes(filter) || entry.mood.includes(filter) || entry.tags.join(', ').includes(filter))
            .map(entry => (
              <tr key={entry.entry_id}>
                <td>{entry.date}</td>
                <td>{entry.title}</td>
                <td>{entry.mood}</td>
                <td>{entry.tags.join(', ')}</td>
                <td>{entry.content}</td>
                <td>
                  <button onClick={() => handleEdit(entry.entry_id)}>Edit</button>
                  <button onClick={() => handleDelete(entry.entry_id)}>Delete</button>
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
};

export default DiaryEntriesList;
