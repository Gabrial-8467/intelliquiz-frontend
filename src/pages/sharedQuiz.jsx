import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuizByUUID, saveQuizResult } from '../services/quizAPI';
import LOADER from '../components/Loader';
import { FaArrowLeft, FaCheck, FaTimes, FaExclamationTriangle, FaShare, FaPlay, FaCopy } from 'react-icons/fa';
import '../style/quiz.css';
import '../style/sharedQuiz.css';

const SharedQuizPage = () => {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getQuizByUUID(uuid);
        console.log('Fetched quiz data:', data);
        if (!data || !data.questions || !Array.isArray(data.questions)) {
          throw new Error('Invalid quiz data received');
        }
        setQuizData(data);
        // Initialize selected answers
        const initialAnswers = {};
        data.questions.forEach((_, index) => {
          initialAnswers[index] = null;
        });
        setSelectedAnswers(initialAnswers);
      } catch (err) {
        console.error('Error fetching quiz:', err);
        setError(err.message || 'Failed to fetch shared quiz');
      } finally {
        setLoading(false);
      }
    };

    if (!uuid) {
      setError('Invalid quiz link. No UUID provided.');
      setLoading(false);
      return;
    }

    fetchQuiz();
  }, [uuid]);

  const handleAnswerSelect = (questionIndex, selectedOption) => {
    console.log('Selecting answer:', { questionIndex, selectedOption });
    if (!isQuizStarted || showResults) return;
    
    setSelectedAnswers(prev => {
      const newAnswers = { ...prev };
      newAnswers[questionIndex] = selectedOption;
      console.log('Updated answers:', newAnswers);
      return newAnswers;
    });
  };

  const calculateScore = async () => {
    let correctAnswers = 0;
    quizData.questions.forEach((question, index) => {
      console.log('Checking answer:', { 
        question: question.question,
        selected: selectedAnswers[index],
        correct: question.correct_answer 
      });
      if (selectedAnswers[index] === question.correct_answer) {
        correctAnswers++;
      }
    });
    setScore(correctAnswers);
    setShowResults(true);

    try {
      const token = localStorage.getItem('token');
      if (token) {
        const resultData = {
          score: correctAnswers,
          totalQuestions: quizData.questions.length,
          topic: quizData.topic,
          answers: selectedAnswers
        };
        await saveQuizResult(resultData);
      }
    } catch (err) {
      console.error('Failed to save result:', err);
    }
  };

  const startQuiz = () => {
    setIsQuizStarted(true);
    const initialAnswers = {};
    quizData.questions.forEach((_, index) => {
      initialAnswers[index] = null;
    });
    setSelectedAnswers(initialAnswers);
    setShowResults(false);
    setScore(0);
  };

  const isAnswerSelected = (questionIndex, option) => {
    return selectedAnswers[questionIndex] === option;
  };

  const isAnswerCorrect = (questionIndex, option) => {
    if (!showResults) return false;
    return option === quizData.questions[questionIndex].correct_answer;
  };

  const getOptionClassName = (questionIndex, option) => {
    let className = 'option-btn';
    if (isAnswerSelected(questionIndex, option)) {
      className += ' selected';
    }
    if (showResults) {
      if (isAnswerCorrect(questionIndex, option)) {
        className += ' correct';
      } else if (isAnswerSelected(questionIndex, option) && !isAnswerCorrect(questionIndex, option)) {
        className += ' incorrect';
      }
    }
    return className;
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/quiz/shared/${uuid}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setShowShareModal(true);
      setTimeout(() => {
        setShowShareModal(false);
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setShowShareModal(true);
        setTimeout(() => {
          setShowShareModal(false);
          setCopied(false);
        }, 2000);
      } catch (err) {
        console.error('Fallback clipboard copy failed:', err);
      }
      document.body.removeChild(textArea);
    }
  };

  if (loading) {
    return (
      <div className="quiz-page">
        <LOADER />
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-page error-container">
        <FaExclamationTriangle className="error-icon" />
        <h2>Error</h2>
        <p>{error}</p>
        <div className="error-actions">
          <button 
            className="back-button"
            onClick={() => navigate('/')}
          >
            <FaArrowLeft /> Back to Home
          </button>
          <button 
            className="retry-button"
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchQuiz();
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="quiz-page error-container">
        <h2>Quiz Not Found</h2>
        <p>The quiz you're looking for doesn't exist or has expired.</p>
        <button 
          className="back-button"
          onClick={() => navigate('/')}
        >
          <FaArrowLeft /> Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="quiz-page">
      <div className="quiz-header">
        <button 
          className="back-button"
          onClick={() => navigate('/')}
        >
          <FaArrowLeft /> Back
        </button>
        <h2 className="quiz-title">Shared Quiz: {quizData.topic}</h2>
        <button 
          className="share-button"
          onClick={handleShare}
        >
          {copied ? <FaCheck /> : <FaShare />} Share
        </button>
      </div>

      {showShareModal && (
        <div className="share-modal">
          <p>
            <FaCheck /> Quiz link copied to clipboard!
          </p>
        </div>
      )}

      {!isQuizStarted && !showResults && (
        <div className="quiz-preview">
          <div className="quiz-info">
            <h3>Quiz Preview</h3>
            <p>This quiz contains {quizData.questions.length} questions about {quizData.topic}.</p>
            <p className="quiz-description">
              Anyone with this link can take this quiz. Share it with your friends!
            </p>
            <button 
              className="start-quiz-button"
              onClick={startQuiz}
            >
              <FaPlay /> Start Quiz
            </button>
          </div>
        </div>
      )}

      {isQuizStarted && !showResults && (
        <div className="quiz-content">
          {quizData.questions.map((question, idx) => (
            <div key={idx} className="quiz-question-block">
              <h3 className="quiz-question">
                Q{idx + 1}. {question.question}
              </h3>
              <div className="quiz-options">
                {question.options.map((option, i) => (
                  <button
                    key={i}
                    type="button"
                    className={getOptionClassName(idx, option)}
                    onClick={() => handleAnswerSelect(idx, option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div className="quiz-actions">
            <button 
              className="submit-button"
              onClick={calculateScore}
              disabled={Object.values(selectedAnswers).some(answer => answer === null)}
            >
              Submit Answers
            </button>
          </div>
        </div>
      )}

      {showResults && (
        <div className="quiz-results">
          <div className="score-display">
            <h3>Your Score</h3>
            <p className="score">{score} / {quizData.questions.length}</p>
            <p className="percentage">
              {Math.round((score / quizData.questions.length) * 100)}%
            </p>
          </div>
          <div className="result-actions">
            <button 
              className="retry-button"
              onClick={startQuiz}
            >
              Try Again
            </button>
            <button 
              className="share-button"
              onClick={handleShare}
            >
              <FaShare /> Share Quiz
            </button>
            <button 
              className="back-button"
              onClick={() => navigate('/')}
            >
              Back to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SharedQuizPage;
