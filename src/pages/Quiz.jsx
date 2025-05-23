import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { shuffleArray } from '../utils/shuffle';
import { getQuizQuestions, saveQuiz } from '../services/quizAPI';
import jsPDF from 'jspdf';
import { v4 as uuidv4 } from 'uuid';
import LOADER from '../components/Loader';
import { FaExclamationTriangle, FaDownload, FaShare, FaPlay, FaArrowLeft } from 'react-icons/fa';
import '../style/quiz.css';

const Quiz = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const topic = state?.topic || '';
  const [quizUUID] = useState(uuidv4());
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shareModal, setShareModal] = useState({ visible: false, link: '', copied: false });
  const [previewMode, setPreviewMode] = useState('preview');

  useEffect(() => {
    const fetchAndSaveQuiz = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getQuizQuestions(topic);
        const rawQuestions = Array.isArray(response)
          ? response
          : response?.data?.questions || [];

        const preparedQuestions = rawQuestions.map((q) => ({
          question: q.question || 'No question available',
          correct_answer: q.correct_answer || 'No correct answer',
          options: shuffleArray(q.options?.length ? q.options : ['No options available']),
        }));

        setQuestions(preparedQuestions);

        await saveQuiz({
          uuid: quizUUID,
          topic,
          questions: preparedQuestions,
        });

        console.log('Quiz saved successfully with UUID:', quizUUID);
      } catch (error) {
        console.error('Error saving quiz:', error);
        setError(error.message || 'Failed to save quiz. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (topic) {
      fetchAndSaveQuiz();
    } else {
      setLoading(false);
      setError('No topic provided. Please go back and select a topic.');
    }
  }, [topic, quizUUID]);

  const generatePDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const margin = 15;
    const maxLineWidth = doc.internal.pageSize.getWidth() - 2 * margin;
    let y = 20;

    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFontSize(20).setFont('helvetica', 'bold');
    const headingText = `${topic} Quiz`;
    const headingWidth = doc.getTextWidth(headingText);
    const headingX = (pageWidth - headingWidth) / 2;
    doc.text(headingText, headingX, y);
    y += 10;

    doc.setFontSize(12).setFont('helvetica', 'normal').text('Instructions:', margin, y);
    y += 7;

    doc.setFontSize(10);
    doc.text('1. Read each question carefully', margin + 5, y); y += 5;
    doc.text('2. Select the correct answer from the options provided', margin + 5, y); y += 5;
    doc.text('3. The correct answer is marked with an asterisk (*)', margin + 5, y); y += 15;

    doc.setFontSize(12).setFont('helvetica', 'normal');
    questions.forEach((q, i) => {
      const lines = doc.splitTextToSize(`Q${i + 1}: ${q.question}`, maxLineWidth);
      doc.text(lines, margin, y);
      y += lines.length * 6;

      q.options.forEach((opt) => {
        doc.rect(margin + 5, y - 3, 4, 4);
        if (opt === q.correct_answer) {
          doc.setFont('helvetica', 'bold');
          doc.text('*', margin + 2, y);
        }
        doc.text(opt, margin + 12, y);
        if (opt === q.correct_answer) doc.setFont('helvetica', 'normal');
        y += 6;
      });

      y += 8;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save(`${topic.toLowerCase()}-quiz.pdf`);
  };

  const generateShareableLink = () => {
    const link = `${window.location.origin}/quiz/shared/${quizUUID}`;
    setShareModal({ visible: true, link, copied: false });
  };

  const copyToClipboard = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
        .then(() => {
          setShareModal(prev => ({ ...prev, copied: true }));
          setTimeout(() => setShareModal({ visible: false, link: '', copied: false }), 2000);
        })
        .catch((err) => {
          console.error("Clipboard API failed:", err);
          fallbackCopy(text);
        });
    } else {
      fallbackCopy(text);
    }
  };

  const fallbackCopy = (text) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = 0;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      setShareModal(prev => ({ ...prev, copied: true }));
      setTimeout(() => setShareModal({ visible: false, link: '', copied: false }), 2000);
    } catch {
      alert("Failed to copy. Please copy manually.");
    }
    document.body.removeChild(textarea);
  };

  const startQuiz = () => {
    navigate(`/quiz/test/${quizUUID}`, { 
      state: { 
        topic,
        uuid: quizUUID,
        questions
      } 
    });
  };

  const togglePreviewMode = () => {
    setPreviewMode(prev => (prev === 'preview' ? 'questions' : 'preview'));
  };

  if (loading) {
    return (
      <div className="quiz-page">
        <div className="loading-container">
          <LOADER />
          <p>Preparing your quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-page error-container">
        <FaExclamationTriangle className="error-icon" />
        <h2>Error</h2>
        <p>{error}</p>
        <Button onClick={() => navigate('/')} className="back-button">
          <FaArrowLeft /> Back to Home
        </Button>
      </div>
    );
  }

  if (!topic || questions.length === 0) {
    return (
      <div className="quiz-page error-container">
        <h2>No Quiz Data</h2>
        <p>No quiz data found. Please go back and select a topic.</p>
        <Button onClick={() => navigate('/')} className="back-button">
          <FaArrowLeft /> Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="quiz-page">
      <div className="quiz-header">
        <h2>Quiz Preview: {topic}</h2>
        <p className="quiz-description">
          Review the questions below before starting the quiz. You can download a PDF version or share this quiz with others.
        </p>
      </div>

      <div className="quiz-actions">
        <Button onClick={generatePDF} className="action-button">
          <FaDownload /> Download PDF
        </Button>
        <Button onClick={generateShareableLink} className="action-button">
          <FaShare /> Share Quiz
        </Button>
        <Button onClick={togglePreviewMode} className="action-button">
          {previewMode === 'preview' ? 'Show Questions' : 'Show Preview'}
        </Button>
        <Button onClick={startQuiz} className="start-button">
          <FaPlay /> Start Quiz
        </Button>
      </div>

      {previewMode === 'preview' ? (
        <div className="quiz-preview">
          <div className="preview-card">
            <h3>Quiz Overview</h3>
            <ul>
              <li>Total Questions: {questions.length}</li>
              <li>Topic: {topic}</li>
              <li>Time Limit: No time limit</li>
              <li>Passing Score: Not required</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="quiz-questions">
          {questions.map((q, idx) => (
            <div key={idx} className="question-card">
              <h3 className="question-number">Question {idx + 1}</h3>
              <p className="question-text">{q.question}</p>
              <div className="options-preview">
                {q.options.map((opt, i) => (
                  <div key={i} className={`option-preview ${opt === q.correct_answer ? 'correct' : ''}`}>
                    {opt}
                    {opt === q.correct_answer && <span className="correct-badge">Correct Answer</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {shareModal.visible && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3>Share Quiz</h3>
            <div className="share-link-container">
              <input
                type="text"
                value={shareModal.link}
                readOnly
                className="share-link-input"
              />
              <Button
                onClick={() => copyToClipboard(shareModal.link)}
                className="copy-button"
              >
                {shareModal.copied ? 'Copied!' : 'Copy Link'}
              </Button>
            </div>
            <Button
              onClick={() => setShareModal({ visible: false, link: '', copied: false })}
              className="close-button"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quiz;
