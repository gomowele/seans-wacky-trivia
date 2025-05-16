import './QuizGame.css';
import React, { useState, useEffect } from "react";

const API_BASE = "https://trivia-backend-79q3.onrender.com";

const PRELOADED_ICONS = [
  // (unchanged icon list)
];

export default function QuizGame() {
  const [question, setQuestion] = useState(null);
  const [selected, setSelected] = useState(null);
  const [answerShown, setAnswerShown] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(13);

  useEffect(() => {
    fetch(`${API_BASE}/next-question`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        console.log("Fetched question:", data);
        setQuestion(data);
      })
      .catch(err => console.error("Failed to load question:", err));
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && !answerShown) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (!answerShown) {
      setAnswerShown(true);
    }
  }, [timeLeft, answerShown]);

  const handleAnswer = (choice) => {
    if (!answerShown) {
      setSelected(choice);
      if (choice === question.correct_answer) setScore(score + 1);
      setAnswerShown(true);
    }
  };

  if (!question) return <div>Loading question...</div>;

  return (
    <div className="quiz-container">
      <h1>Sean’s Wacky Trivia 🎶</h1>
      <div className="question-box">
        <h2>{question.text || 'No question text provided.'}</h2>
        <div className="choices">
          {question.choices?.length > 0 ? (
            question.choices.map((c, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(c)}
                className={answerShown && c === question.correct_answer ? 'correct' : ''}
                disabled={answerShown}
              >
                {c}
              </button>
            ))
          ) : (
            <p>No choices available for this question.</p>
          )}
        </div>
        <div className="timer">Time left: {timeLeft}s</div>
        {answerShown && (
          <div className="answer-display">
            <p>Correct Answer: {question.correct_answer}</p>
            {question.image_url && (
              <img
                src={question.image_url}
                alt="answer visual"
                className="answer-image"
                onError={(e) => (e.target.style.display = 'none')}
              />
            )}
            <p>Your Score: {score}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export { PRELOADED_ICONS };
