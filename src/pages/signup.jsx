import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../style/signin.css';
import '../style/signup.css';
import { FaEnvelope, FaLock, FaUser, FaCheck, FaTimes } from 'react-icons/fa';

const SignupPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });
  const navigate = useNavigate();

  // ✅ Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/');
    }
  }, [navigate]);

  const validatePassword = (password) => {
    const validations = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    setPasswordStrength(validations);

    const isValid = Object.values(validations).every(Boolean);
    if (!isValid) {
      setPasswordError('Password does not meet requirements');
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    if (name === 'password') {
      validatePassword(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      alert('Please fill in all fields.');
      return;
    }

    if (!validatePassword(form.password)) {
      return;
    }

    try {
      await axios.post('https://intelliquiz-backend-production.up.railway.app:5000/api/auth/register', form);
      alert('Account created successfully! Please log in.');
      navigate('/signin');
    } catch (error) {
      console.error('Signup error:', error.response?.data || error.message);
      alert(error.response?.data?.message || 'An error occurred during signup.');
    }
  };

  const PasswordRequirement = ({ met, text }) => (
    <div className="password-requirement">
      {met ? <FaCheck className="requirement-icon valid" /> : <FaTimes className="requirement-icon invalid" />}
      <span className={met ? 'valid' : 'invalid'}>{text}</span>
    </div>
  );

  return (
    <div className="auth-wrapper">
      <div className="auth-left">
        <h1>🧠 IntelliQuiz</h1>
        <p>Join us and start your quiz journey today!</p>
        <img
          src="https://img.freepik.com/free-vector/sign-up-concept-illustration_114360-7865.jpg"
          alt="Signup Illustration"
        />
      </div>

      <div className="auth-right">
        <div className="form-box">
          <h2>Sign Up</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-box">
              <FaUser />
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
              />
            </div>
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

            <div className="password-requirements">
              <PasswordRequirement met={passwordStrength.length} text="At least 8 characters" />
              <PasswordRequirement met={passwordStrength.uppercase} text="At least one uppercase letter" />
              <PasswordRequirement met={passwordStrength.lowercase} text="At least one lowercase letter" />
              <PasswordRequirement met={passwordStrength.number} text="At least one number" />
              <PasswordRequirement met={passwordStrength.special} text="At least one special character" />
            </div>

            {passwordError && <div className="error-message">{passwordError}</div>}

            <button 
              type="submit" 
              className="submit-btn"
              disabled={!!passwordError}
            >
              Create Account
            </button>
          </form>
          <p className="signup-link">
            Already have an account? <Link to="/signin">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
