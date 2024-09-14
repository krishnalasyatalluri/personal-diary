import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/Register/index';
import Login from './pages/Login/index';
import Dashboard from './pages/Dashboard/index';
import FilterByDate from './pages/FilterByDate/index';
import FilterByMood from './pages/FilterByMood/index';
import DiaryEntryForm from './pages/DiaryEntryForm/index';
import DiaryEntriesList from './pages/DiaryEntriesList/index'; 
import NewEntryPage from './pages/NewEntryForm';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/filter-by-mood" element={<FilterByMood />} />
        <Route path="/filter-by-date" element={<FilterByDate />} />
        
        <Route path="/add-entry" element={<DiaryEntryForm />} />
        <Route path="/edit-entry/:entryId" element={<DiaryEntryForm />} />
        <Route path="/entries-list" element={<DiaryEntriesList />} />
        <Route path="/new-entry" element={<NewEntryPage onEntryAdded={(entry) => { /* handle entry addition */ }} />} />
      </Routes>
    </Router>
  );
}

export default App;
