import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import CreatableSelect from 'react-select/creatable';
import { v4 as uuidv4 } from 'uuid';
import '../style/home.css';

const topicOptions = [
  { label: 'Artificial Intelligence', value: 'Artificial Intelligence' },
  { label: 'Web Development', value: 'Web Development' },
  { label: 'Data Science', value: 'Data Science' },
  { label: 'Cybersecurity', value: 'Cybersecurity' },
  { label: 'Cloud Computing', value: 'Cloud Computing' },
  { label: 'Machine Learning', value: 'Machine Learning' },
  { label: 'Biology', value: 'Biology' },
  { label: 'Astronomy', value: 'Astronomy' },
  { label: 'Mathematics', value: 'Mathematics' },
  { label: 'General Knowledge', value: 'General Knowledge' },
];

const Home = () => {
  const [topic, setTopic] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // Ref to the CreatableSelect container for applying shake class
  const selectWrapperRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleStart = () => {
    if (!topic || !topic.value.trim()) {
      // Add shake class to the dropdown wrapper
      if (selectWrapperRef.current) {
        selectWrapperRef.current.classList.add('shake');

        // Remove the class after animation ends so it can shake again later
        setTimeout(() => {
          selectWrapperRef.current.classList.remove('shake');
        }, 500); // same duration as animation
      }
      return;
    }

    navigate('/quiz', {
      state: { 
        topic: topic.value
      }
    });
  };

  const handleLoginRedirect = () => {
    navigate('/signin');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  const handleTopicChange = (selectedOption) => {
    setTopic(selectedOption);
  };

  return (
    <div className="home-container">
      <header className="top-bar">
        <h2 className="logo">🧠 IntelliQuiz</h2>

        {isLoggedIn ? (
          <div className="profile-menu">
            <button className="profile-btn" onClick={handleProfile}>
              Profile
            </button>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <button className="signin-button" onClick={handleLoginRedirect}>
            Sign In
          </button>
        )}
      </header>

      <main className="home-content">
        <div className="home-left">
          <h1 className="home-heading">🎯 Select a Quiz Topic</h1>
          <p className="home-tagline">Choose a topic or enter your own to get started.</p>

          {/* Wrap CreatableSelect in a div with ref */}
          <div className="dropdown-wrapper" ref={selectWrapperRef}>
            <CreatableSelect
              options={topicOptions}
              value={topic}
              onChange={handleTopicChange}
              placeholder="Search or enter a topic..."
              classNamePrefix="react-select"
              isClearable
              isSearchable
              formatCreateLabel={(inputValue) => `Use custom topic: "${inputValue}"`}
            />
          </div>

          <button className="generate-button" onClick={handleStart}>
            Generate Quiz
          </button>

          <div className="suggested-tags">
            <h4>💡 Suggested Topics:</h4>
            <div className="tag-list">
              {topicOptions.slice(0, 5).map((t) => (
                <span
                  key={t.value}
                  className="tag"
                  onClick={() => setTopic(t)}
                >
                  {t.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="home-right">
          <img
            src="https://img.freepik.com/free-vector/quiz-time-neon-sign_1262-19629.jpg"
            alt="Quiz"
            className="quiz-image"
          />
        </div>
      </main>
    </div>
  );
};

export default Home;
