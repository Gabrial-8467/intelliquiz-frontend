import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';
import { FaChartLine, FaTrophy, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaExclamationTriangle } from 'react-icons/fa';
import '../style/profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [quizHistory, setQuizHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    highestScore: 0,
    totalCorrect: 0,
    totalQuestions: 0
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('https://intelliquiz-backend-production.up.railway.app/api/user/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include',
          mode: 'cors'
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token');
            navigate('/signin');
            return;
          }
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch profile');
        }

        const data = await response.json();
        
        if (!data || !data.user) {
          throw new Error('Invalid profile data received');
        }

        setUser(data.user);
        setQuizHistory(data.quizHistory || []);
        
        // Calculate statistics
        if (data.quizHistory && data.quizHistory.length > 0) {
          const totalQuizzes = data.quizHistory.length;
          const totalCorrect = data.quizHistory.reduce((sum, quiz) => sum + quiz.score, 0);
          const totalQuestions = data.quizHistory.reduce((sum, quiz) => sum + quiz.totalQuestions, 0);
          const highestScore = Math.max(...data.quizHistory.map(quiz => (quiz.score / quiz.totalQuestions) * 100));
          
          setStats({
            totalQuizzes,
            averageScore: (totalCorrect / totalQuestions) * 100,
            highestScore,
            totalCorrect,
            totalQuestions
          });
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        setError(error.message || 'Failed to load profile data');
        if (error.message === 'Unauthorized') {
          localStorage.removeItem('token');
          navigate('/signin');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/signin');
  };

  const goToHome = () => {
    navigate('/');
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  const getPerformanceEmoji = (score, total) => {
    const percentage = (score / total) * 100;
    if (percentage >= 90) return '🏆';
    if (percentage >= 70) return '🎯';
    if (percentage >= 50) return '👍';
    return '💪';
  };

  if (loading) {
    return (
      <div className="loading">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <nav className="navbar">
          <div className="navbar-logo">🧠 IntelliQuiz</div>
          <div className="navbar-buttons">
            <button className="nav-btn" onClick={goToHome}>Home</button>
            <button className="nav-btn" onClick={handleLogout}>Logout</button>
          </div>
        </nav>
        <div className="profile-content">
          <div className="profile-card">
            <div className="error-message">
              <FaExclamationTriangle className="error-icon" />
              <p>{error}</p>
              <button className="retry-button" onClick={() => window.location.reload()}>
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <nav className="navbar">
        <div className="navbar-logo">🧠 IntelliQuiz</div>
        <div className="navbar-buttons">
          <button className="nav-btn" onClick={goToHome}>Home</button>
          <button className="nav-btn" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="profile-content">
        <div className="profile-card">
          <h2 className="welcome-text">
            Welcome{user?.name ? `, ${user.name}` : ''}!
          </h2>
          <p className="user-email">
            <strong>Email:</strong> {user?.email || 'N/A'}
          </p>

          <div className="stats-container">
            <div className="stat-card">
              <FaChartLine className="stat-icon" />
              <h3>Total Quizzes</h3>
              <p>{stats.totalQuizzes}</p>
            </div>
            <div className="stat-card">
              <FaTrophy className="stat-icon" />
              <h3>Average Score</h3>
              <p>{stats.averageScore.toFixed(1)}%</p>
            </div>
            <div className="stat-card">
              <FaCheckCircle className="stat-icon" />
              <h3>Highest Score</h3>
              <p>{stats.highestScore.toFixed(1)}%</p>
            </div>
          </div>

          <div className="quiz-history">
            <h3>📊 Quiz History</h3>
            {quizHistory.length > 0 ? (
              <div className="history-table-container">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Topic</th>
                      <th>Score</th>
                      <th>Percentage</th>
                      <th>Date</th>
                      <th>Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quizHistory.map((item, index) => (
                      <tr key={index}>
                        <td>{item.topic}</td>
                        <td>{item.score} / {item.totalQuestions}</td>
                        <td>{((item.score / item.totalQuestions) * 100).toFixed(1)}%</td>
                        <td>{formatDate(item.createdAt)}</td>
                        <td className="performance-cell">
                          {getPerformanceEmoji(item.score, item.totalQuestions)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="no-history">No quiz attempts yet. Start your first quiz!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
