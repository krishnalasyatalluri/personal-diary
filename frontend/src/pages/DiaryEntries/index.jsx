import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './index'

const DiaryPage = () => {
  const [entries, setEntries] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [mood, setMood] = useState('');

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const response = await axios.get('http://localhost:5006/diary/entries/tags', {
          params: { tag: [] }, 
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setEntries(response.data.entries);
      } catch (error) {
        console.error('Error fetching entries:', error.response.data);
      }
    };

    fetchEntries();
  }, []);

  const handleAddEntry = async () => {
    try {
      await axios.post('http://localhost:5006/diary/new-entry', {
        title,
        content,
        tags: tags.split(','),
        mood
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTitle('');
      setContent('');
      setTags('');
      setMood('');
      // Refetch entries
    } catch (error) {
      console.error('Error adding entry:', error.response.data);
    }
  };

  return (
    <div>
      <h2>Diary Entries</h2>
      <input type="text" value={title} placeholder="Title" onChange={(e) => setTitle(e.target.value)} />
      <textarea value={content} placeholder="Content" onChange={(e) => setContent(e.target.value)} />
      <input type="text" value={tags} placeholder="Tags (comma-separated)" onChange={(e) => setTags(e.target.value)} />
      <input type="text" value={mood} placeholder="Mood" onChange={(e) => setMood(e.target.value)} />
      <button onClick={handleAddEntry}>Add Entry</button>
      
      <ul>
        {entries.map(entry => (
          <li key={entry.entry_id}>
            <Link to={`/entries/${entry.entry_id}`}>{entry.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DiaryPage;
