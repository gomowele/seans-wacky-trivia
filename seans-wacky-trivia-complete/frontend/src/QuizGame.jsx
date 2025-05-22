import React, { useState, useEffect } from 'react';
import './QuizGame.css';

const API_BASE = 'https://trivia-backend-79q3.onrender.com';

export default function QuizGame({ nickname, icon, onReset }) {
  const [gameState, setGameState] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [hasJoined, setHasJoined] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const fetchState = () => {
    fetch(`${API_BASE}/state`)
      .then(res => res.json())
      .then(data => {
        setGameState(data);
        setGameStarted(data.started);

        // reset selected answer if new question is shown
        if (data.question !== gameState?.question) {
          setSelectedAnswer(null);
        }
      });
  };

  useEffect(() => {
    if (nickname && icon && !hasJoined) {
      fetch(`${API_BASE}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, icon })
      }).then(() => setHasJoined(true));
    }
  }, [nickname, icon, hasJoined]);

  useEffect(() => {
    const interval = setInterval(fetchState, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAnswer = (choice) => {
    if (!gameState?.show_answer && selectedAnswer === null) {
      setSelectedAnswer(choice);
      fetch(`${API_BASE}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, answer: choice })
      });
    }
  };

  const startGame = () => {
    fetch(`${API_BASE}/start`, { method: 'POST' });
  };

  const resetGame = () => {
    fetch(`${API_BASE}/reset`, { method: 'POST' }).then(onReset);
  };

  if (!hasJoined) return <div className="quiz-container">Joining game...</div>;

  if (!gameStarted) {
    return (
      <div className="quiz-container">
        <h1>Welcome, {nickname}!</h1>
        <img src={icon} alt="player" className="avatar" />
        <p>Waiting to start Sean's Wacky Trivia 🎶</p>
        <button onClick={startGame}>Start Game</button>
      </div>
    );
  }

  if (!gameState || !gameState.question) return <div className="quiz-container">Loading question...</div>;

  const { question, choices, image_url, show_answer, scores, timer } = gameState;
  const correctAnswer = show_answer ? choices.find((c, i) => i === gameState.answer_index) : null;

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <img src={icon} alt="player" className="avatar" />
        <h2>{nickname}</h2>
        <button className="switch-player" onClick={resetGame}>Switch Player</button>
      </div>

      <h3>{question}</h3>

      <div className="choices">
        {choices.map((choice, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(choice)}
            disabled={show_answer || selectedAnswer !== null}
            className={
              show_answer
                ? choice === correctAnswer
                  ? 'correct'
                  : choice === selectedAnswer
                  ? 'wrong'
                  : ''
                : ''
            }
          >
            {choice}
          </button>
        ))}
      </div>

      <div className="timer">Time left: {timer}s</div>

      {show_answer && (
        <div className="answer-section">
          <p>✅ Correct Answer: {correctAnswer}</p>
          <img
            src={`/images/${image_url || 'default.png'}`}
            alt="Answer Visual"
            className="answer-image"
            onError={(e) => {
              console.log("❌ Failed to load image", e.target.src);
              e.target.src = '/images/default.png';
            }}
          />
          <p>📊 Your Score: {scores[nickname]?.score || 0}</p>

          <div className="leaderboard">
            <h4>Leaderboard</h4>
            <ul>
              {Object.entries(scores)
                .sort(([, a], [, b]) => b.score - a.score)
                .map(([player, data]) => (
                  <li key={player}>
                    <img src={data.icon} alt={player} className="avatar small" />
                    {player}: {data.score}
                  </li>
                ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
