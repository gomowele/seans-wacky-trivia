// App.jsx
import React, { useState, useEffect } from 'react';
import QuizGame from './QuizGame';
import Lobby from './Lobby';

export default function App() {
  const [nickname, setNickname] = useState('');
  const [icon, setIcon] = useState('');

  useEffect(() => {
    const savedNick = localStorage.getItem('nickname');
    const savedIcon = localStorage.getItem('icon');
    if (savedNick && savedIcon) {
      setNickname(savedNick);
      setIcon(savedIcon);
    }
  }, []);

  if (!nickname || !icon) {
    return <Lobby onSubmit={(nick, icn) => {
      setNickname(nick);
      setIcon(icn);
      localStorage.setItem('nickname', nick);
      localStorage.setItem('icon', icn);
    }} />;
  }

  return <QuizGame nickname={nickname} icon={icon} onReset={() => {
    localStorage.clear();
    window.location.reload();
  }} />;
}

// Lobby.jsx
import React, { useState } from 'react';
import { PRELOADED_ICONS } from './QuizGame';

export default function Lobby({ onSubmit }) {
  const [nickname, setNickname] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('');

  return (
    <div className="lobby-container">
      <h1>Join Sean’s Wacky Trivia 🎶</h1>
      <input
        type="text"
        placeholder="Enter your nickname"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
      />
      <div className="icon-grid">
        {PRELOADED_ICONS.map((icon, idx) => (
          <div key={idx} className={selectedIcon === icon.url ? 'icon selected' : 'icon'} onClick={() => setSelectedIcon(icon.url)}>
            <img src={icon.url} alt={icon.name} />
            <p>{icon.name}</p>
          </div>
        ))}
      </div>
      <button disabled={!nickname || !selectedIcon} onClick={() => onSubmit(nickname, selectedIcon)}>
        Join Game
      </button>
    </div>
  );
} 

// Add to QuizGame.jsx header area
// <button onClick={onReset} className="switch-player">Switch Player</button>
// Style .switch-player in CSS if needed

// Updated PRELOADED_ICONS
export const PRELOADED_ICONS = [
  { name: "LeBron James", url: "/avatars/lebron.jpg" },
  { name: "Serena Williams", url: "/avatars/serena.jpg" },
  { name: "Lionel Messi", url: "/avatars/messi.jpg" },
  { name: "Tom Brady", url: "/avatars/brady.jpg" },
  { name: "Michael Jordan", url: "/avatars/jordan.jpg" },
  { name: "Beyoncé", url: "/avatars/beyonce.jpg" },
  { name: "Drake", url: "/avatars/drake.jpg" },
  { name: "Bad Bunny", url: "/avatars/bad.jpg" },
  { name: "Taylor Swift", url: "/avatars/taylor.jpg" },
  { name: "Eminem", url: "/avatars/eminem.jpg" },
  { name: "Tom Hanks", url: "/avatars/tom.jpg" },
  { name: "Zendaya", url: "/avatars/zendaya.jpg" },
  { name: "The Rock", url: "/avatars/therock.jpg" },
  { name: "Scarlett Johansson", url: "/avatars/scarlett.jpg" },
  { name: "Mario", url: "/avatars/mario.jpg" },
  { name: "Lara Croft", url: "/avatars/lara.jpg" },
  { name: "Master Chief", url: "/avatars/chief.jpg" },
  { name: "Pikachu", url: "/avatars/pikachu.jpg" },
  { name: "Link", url: "/avatars/link.jpg" },
  { name: "Kratos", url: "/avatars/kratos.jpg" }
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
