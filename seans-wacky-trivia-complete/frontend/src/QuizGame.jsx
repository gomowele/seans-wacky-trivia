// QuizGame.jsx
import React, { useState, useEffect, useRef } from 'react';
import './QuizGame.css';

const API_BASE = 'https://trivia-backend-79q3.onrender.com';

export default function QuizGame({ nickname, icon, onReset }) {
  const [gameState, setGameState] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [hasJoined, setHasJoined] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);

  const waitingMusicRef = useRef(null);
  const questionMusicRef = useRef(null);
  const leaderboardMusicRef = useRef(null);

  const fetchState = () => {
    fetch(`${API_BASE}/state`)
      .then(res => res.json())
      .then(data => {
        if (data.finished) {
          setGameFinished(true);
          setLeaderboard(data.leaderboard || []);
          stopAllMusic();
          leaderboardMusicRef.current?.play();
        } else {
          setGameState(data);
          setGameStarted(data.started);
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

  useEffect(() => {
    if (!gameStarted && !gameFinished) {
      waitingMusicRef.current?.play();
    } else {
      waitingMusicRef.current?.pause();
      waitingMusicRef.current.currentTime = 0;
    }

    if (gameStarted && !gameFinished) {
      questionMusicRef.current?.play();
    } else {
      questionMusicRef.current?.pause();
      questionMusicRef.current.currentTime = 0;
    }
  }, [gameStarted, gameFinished]);

  const stopAllMusic = () => {
    [waitingMusicRef, questionMusicRef, leaderboardMusicRef].forEach(ref => {
      ref.current?.pause();
      if (ref.current) ref.current.currentTime = 0;
    });
  };

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
    fetch(`${API_BASE}/reset`, { method: 'POST' }).then(() => {
      stopAllMusic();
      onReset();
    });
  };

  if (!hasJoined) {
    return (
      <div className="quiz-container">
        <h2>Joining game...</h2>
        <audio ref={waitingMusicRef} src="/music/waiting screen.mp3" loop autoPlay />
      </div>
    );
  }

  if (gameFinished) {
    return (
      <div className="quiz-container">
        <h2>Final Scores 🎉</h2>
        <ul className="leaderboard">
          {leaderboard.map(player => (
            <li key={player.name} className={player.top ? 'top-player' : ''}>
              <img src={player.icon} alt={player.name} className="avatar" />
              {player.name}: {player.score}
            </li>
          ))}
        </ul>
        <button onClick={resetGame}>Play Again</button>
        <audio ref={leaderboardMusicRef} src="/music/leader board.mp3" loop autoPlay />
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="quiz-container">
        <h1>Welcome, {nickname}!</h1>
        <img src={icon} alt="player" className="avatar" />
        <p>Waiting to start Sean's Wacky Trivia 🎶</p>
        <button onClick={startGame}>Start Game</button>
        <audio ref={waitingMusicRef} src="/music/waiting screen.mp3" loop autoPlay />
      </div>
    );
  }

  if (!gameState || !gameState.question) {
    return (
      <div className="quiz-container">
        <h3>Loading question...</h3>
      </div>
    );
  }

  const { question, choices, answer_index, image_url, show_answer, scores } = gameState;
  const correctAnswer = choices[answer_index];
  const playerScore = scores[nickname]?.score || 0;

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

      <div className="timer">Time left: {gameState.timer}s</div>

      {show_answer && (
        <div className="answer-section">
          <p>Correct Answer: {correctAnswer}</p>
          <img
            src={`/images/${image_url || 'default.png'}`}
            alt="Answer Visual"
            className="answer-image"
            onError={(e) => {
              console.log("❌ Failed to load image", e.target.src);
              e.target.src = '/images/default.png';
            }}
          />
          <p>Your Score: {playerScore}</p>

          <div className="leaderboard">
            <h4>Leaderboard</h4>
            <ul>
              {Object.entries(scores).sort((a, b) => b[1].score - a[1].score).map(([player, data]) => (
                <li key={player}>{player}: {data.score}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <audio ref={questionMusicRef} src="/music/questions music.mp3" loop autoPlay />
    </div>
  );
}
