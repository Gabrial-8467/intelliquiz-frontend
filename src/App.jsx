import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Quiz from './pages/Quiz';
import QuizTestPage from './pages/quizTestPage';
import Result from './pages/result';
import Signin from './pages/signin';
import SignupPage from './pages/signup';
import Profile from './pages/profile';
import PublicRoute from './routes/publicRoutes';
import SharedQuizPage from './pages/sharedQuiz';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/result" element={<Result />} />
        <Route path="/quiz/test/:uuid" element={<QuizTestPage />} />
        <Route path="/quiz/shared/:uuid" element={<SharedQuizPage />} />
        {/* 🔐 Public routes (only accessible when not logged in) */}
        <Route
          path="/signin"
          element={
            <PublicRoute>
              <Signin />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignupPage />
            </PublicRoute>
          }
        />
        
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
};

export default App;
