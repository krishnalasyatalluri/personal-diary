import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './index'; 

function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleRegister = () => {
    axios.post('http://localhost:5006/user/register', form)
      .then(() => navigate('/login'))
      .catch(error => console.error(error));
  };

  return (
    <div className="container">
      <h2 className="title">Register</h2>
      <div className="form-group">
        <input type="text" placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
      </div>
      <div className="form-group">
        <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </div>
      <div className="form-group">
        <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      </div>
      <button className="register-button" onClick={handleRegister} style={{marginBottom:'10px',width:'250px'}}>Register</button>
      <button className="login-button" onClick={() => navigate('/login')} style={{width:'250px'}}>Go to Login</button>
    </div>
  );
}

export default Register;
