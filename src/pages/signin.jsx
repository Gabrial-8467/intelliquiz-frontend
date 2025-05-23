import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../style/signin.css';
import { FaEnvelope, FaLock } from 'react-icons/fa';

const SigninPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  // ✅ Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/'); // or '/dashboard' if that's your homepage
    }
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      alert('Please fill in all fields.');
      return;
    }

    try {
      const response = await axios.post('https://intelliquiz-backend-production.up.railway.app/:5000/api/auth/login', form);
      localStorage.setItem('token', response.data.token);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      alert(error.response?.data?.message || 'An error occurred during login.');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-left">
        <h1>🧠 IntelliQuiz</h1>
        <p>Challenge your mind with interactive quizzes on trending tech topics!</p>
        <img
          src="https://img.freepik.com/free-vector/mobile-login-concept-illustration_114360-135.jpg"
          alt="Quiz Illustration"
        />
      </div>

      <div className="auth-right">
        <div className="form-box">
          <h2>Sign In</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-box">
              <FaEnvelope />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
              />
            </div>
            <div className="input-box">
              <FaLock />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
              />
            </div>
            <button type="submit" className="submit-btn">Login</button>
          </form>
          <p className="signup-link">
            Don't have an account? <Link to="/signup">Sign up here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SigninPage;
