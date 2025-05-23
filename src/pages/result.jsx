import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { saveQuizResult, getUserQuizResults } from '../services/quizAPI';
import { Button } from '../components/Button';
import LOADER from '../components/Loader';
import { FaExclamationTriangle } from 'react-icons/fa';
import '../style/result.css';

const ResultPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { score, total, topic, userAnswers } = location.state || {};

  const [previousResults, setPreviousResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(true);
  const [error, setError] = useState(null);
  const [resultSaved, setResultSaved] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to view results.');
      return;
    }

    const saveAndFetchResults = async () => {
      try {
        setLoadingResults(true);
        setError(null);

        if (score !== undefined && total) {
          // Save current result
          const resultData = {
            score,
            totalQuestions: total,
            topic,
            answers: userAnswers || {}
          };

          await saveQuizResult(resultData);
          setResultSaved(true);
        }

        // Fetch previous results
        const results = await getUserQuizResults();
        setPreviousResults(results || []);
      } catch (err) {
        console.error('Error handling results:', err);
        setError(err.message || 'Failed to save or fetch results');
      } finally {
        setLoadingResults(false);
      }
    };

    saveAndFetchResults();
  }, [score, total, topic, userAnswers]);

  if (error) {
    return (
      <div className="result-error">
        <FaExclamationTriangle className="error-icon" />
        <p>{error}</p>
        <Button onClick={() => navigate('/')}>Back to Home</Button>
      </div>
    );
  }

  if (score === undefined || !total) {
    return (
      <div className="result-error">
        <p>Invalid result data. Please try the quiz again.</p>
        <Button onClick={() => navigate('/')}>Back to Home</Button>
      </div>
    );
  }

  const percentage = ((score / total) * 100).toFixed(1);
  let message = '';
  let emoji = '';

  if (percentage >= 90) {
    message = '🏆 Excellent! You aced it!';
    emoji = '🌟';
  } else if (percentage >= 70) {
    message = '👏 Great job!';
    emoji = '💪';
  } else if (percentage >= 50) {
    message = '🙂 Good try! Keep practicing!';
    emoji = '📘';
  } else {
    message = "😅 Don't worry! Try again!";
    emoji = '💡';
  }

  if (loadingResults) {
    return (
      <div className="result-container">
        <LOADER />
      </div>
    );
  }

  return (
    <div className="result-container">
      <h2 className="result-title">{emoji} Quiz Result</h2>
      <p className="result-topic">Topic: <strong>{topic}</strong></p>

      <div className="result-score-box">
        <p className="result-score">{score} / {total}</p>
        <p className="result-percentage">{percentage}%</p>
        <p className="result-feedback">{message}</p>
        {resultSaved && (
          <p className="result-saved">✓ Result saved to your profile</p>
        )}
      </div>

      <div className="result-buttons">
        <Button onClick={() => navigate('/')}>🏠 Home</Button>
        <Button onClick={() => navigate(`/quiz/test/${topic}`)}>🔁 Retry</Button>
      </div>

      {previousResults.length > 0 && (
        <div className="result-history">
          <h3>Your Previous Scores</h3>
          <table>
            <thead>
              <tr>
                <th>Topic</th>
                <th>Score</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {previousResults.map((res, idx) => (
                <tr key={idx}>
                  <td>{res.topic || 'Unknown'}</td>
                  <td>{res.score} / {res.totalQuestions}</td>
                  <td>{new Date(res.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ResultPage;
