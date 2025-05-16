// QuizGame.jsx
import './QuizGame.css';
import React, { useState, useEffect } from 'react';

const API_BASE = "https://trivia-backend-79q3.onrender.com";

export const PRELOADED_ICONS = [
  { name: "LeBron", url: "/avatars/lebron.jpg" },
  { name: "Serena", url: "/avatars/serena.jpg" },
  { name: "Messi", url: "/icons/messi.png" },
  { name: "Brady", url: "/icons/brady.png" },
  { name: "Jordan", url: "/icons/jordan.png" },
  { name: "Beyoncé", url: "/icons/beyonce.png" },
  { name: "Drake", url: "/icons/drake.png" },
  { name: "Bad Bunny", url: "/icons/badbunny.png" },
  { name: "Taylor", url: "/icons/taylor.png" },
  { name: "Eminem", url: "/icons/eminem.png" },
  { name: "Tom Hanks", url: "/icons/hanks.png" },
  { name: "Zendaya", url: "/icons/zendaya.png" },
  { name: "The Rock", url: "/icons/therock.png" },
  { name: "Scarlett", url: "/icons/scarlett.png" },
  { name: "Mario", url: "/icons/mario.png" },
  { name: "Lara Croft", url: "/icons/lara.png" },
  { name: "Master Chief", url: "/icons/chief.png" },
  { name: "Pikachu", url: "/icons/pikachu.png" },
  { name: "Link", url: "/icons/link.png" },
  { name: "Kratos", url: "/icons/kratos.png" }
];

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
        if (data.status === "ok") {
          setQuestionData(data.question);
          setAnswerShown(false);
          setTimeLeft(13);
        } else if (data.status === "finished") {
          setIsFinished(true);
        }
      })
      .catch(err => console.error("Failed to load question:", err));
  };

  useEffect(() => {
    fetchQuestion();
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && !answerShown) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (!answerShown) {
      setAnswerShown(true);
    } else {
      const delay = setTimeout(() => {
        fetchQuestion();
      }, 5000);
      return () => clearTimeout(delay);
    }
  }, [timeLeft, answerShown]);

  const handleAnswer = (choice) => {
    if (!answerShown) {
      setSelected(choice);
      const correctAnswer = questionData.choices[questionData.answer_index];
      if (choice === correctAnswer) setScore(score + 1);
      setAnswerShown(true);
    }
  };

  const correctAnswer = questionData?.choices[questionData?.answer_index];
  const fallbackImage = "/images/default.png";

  if (isFinished) {
    return (
      <div className="quiz-container">
        <h1>Sean’s Wacky Trivia 🎶</h1>
        <h2>Game Over!</h2>
        <p>Final Score for {nickname}: {score}</p>
        <button onClick={onReset}>Switch Player</button>
      </div>
    );
  }

  if (!questionData) return <div>Loading question...</div>;

  return (
    <div className="quiz-container">
      <div className="player-header">
        <img src={icon} alt={nickname} className="player-icon" />
        <span className="player-name">{nickname}</span>
        <button onClick={onReset} className="switch-player">Switch Player</button>
      </div>
      <h1>Sean’s Wacky Trivia 🎶</h1>
      <div className="question-box">
        <h2>{questionData.question}</h2>
        <div className="choices">
          {questionData.choices.map((c, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(c)}
              className={answerShown && c === correctAnswer ? 'correct' : ''}
              disabled={answerShown}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="timer">Time left: {timeLeft}s</div>
        {answerShown && (
          <div className="answer-display">
            <p>Correct Answer: {correctAnswer}</p>
            <img
              src={`/images/${questionData.image_url || 'default.png'}`}
              alt="answer"
              className="answer-image"
              onError={(e) => {
                e.target.src = fallbackImage;
              }}
            />
            <p>Your Score: {score}</p>
          </div>
        )}
      </div>
    </div>
  );
}
