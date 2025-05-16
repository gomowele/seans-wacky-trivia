// QuizGame.jsx
import React, { useState, useEffect } from 'react';
import './QuizGame.css';

const API_BASE = 'https://trivia-backend-79q3.onrender.com';

export default function QuizGame({ nickname, icon, onReset }) {
  const [questionData, setQuestionData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [answerShown, setAnswerShown] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(13);
  const [isFinished, setIsFinished] = useState(false);

  const fetchQuestion = () => {
    fetch(`${API_BASE}/next-question`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'ok') {
          setQuestionData(data.question);
          setAnswerShown(false);
          setTimeLeft(13);
        } else {
          setIsFinished(true);
        }
      });
  };

  useEffect(() => {
    fetchQuestion();
  }, []);

  useEffect(() => {
    if (!answerShown && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timer);
    } else if (!answerShown) {
      setAnswerShown(true);
    } else {
      const autoAdvance = setTimeout(() => fetchQuestion(), 5000);
      return () => clearTimeout(autoAdvance);
    }
  }, [timeLeft, answerShown]);

  const handleAnswer = (choice) => {
    if (!answerShown) {
      setSelected(choice);
      const correctAnswer = questionData.choices[questionData.answer_index];
      if (choice === correctAnswer) {
        const points = Math.round((timeLeft / 13) * 100);
        setScore(score + points);
      }
      setAnswerShown(true);
    }
  };

  if (isFinished) {
    return (
      <div className="quiz-container">
        <h2>🎉 Game Over!</h2>
        <p>Final Score: {score}</p>
        <button onClick={onReset}>Switch Player</button>
      </div>
    );
  }

  if (!questionData) return <div>Loading question...</div>;

  const correctAnswer = questionData.choices[questionData.answer_index];

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <img src={icon} alt="player" className="avatar" />
        <h2>{nickname}</h2>
        <button className="switch-player" onClick={onReset}>Switch Player</button>
      </div>

      <h3>{questionData.question}</h3>

      <div className="choices">
        {questionData.choices.map((choice, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(choice)}
            disabled={answerShown}
            className={
              answerShown
                ? choice === correctAnswer
                  ? 'correct'
                  : choice === selected
                  ? 'wrong'
                  : ''
                : ''
            }
          >
            {choice}
          </button>
        ))}
      </div>

      <div className="timer">Time left: {timeLeft}s</div>

     <div className="answer-section">
  <p>Correct Answer: {correctAnswer}</p>
  <img
    src={`/images/${questionData.image_url || 'default.png'}`}
    alt="Answer Visual"
    className="answer-image"
    onError={(e) => {
      console.log("❌ Failed to load image", e.target.src);
      e.target.src = '/images/default.png';
    }}
  />
  <p>Score: {score}</p>
</div>


    </div>
  );
}

