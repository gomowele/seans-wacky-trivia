import React, { useState, useEffect, useRef } from 'react';
import './QuizGame.css';
import axios from 'axios';
import GameOver from './GameOver';

export default function QuizGame({ nickname, icon, onReset }) {
  const [gameState, setGameState] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answersDisabled, setAnswersDisabled] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false); // <-- added
  const questionMusicRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      axios.get('http://localhost:10000/state').then((res) => {
        setGameState(res.data);
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (gameState) {
      setAnswersDisabled(gameState.show_answer);
      setIsAnswered(false); // reset on new question

      if (!gameState.finished) {
        questionMusicRef.current.play().catch(() => {});
      } else {
        questionMusicRef.current.pause();
        questionMusicRef.current.currentTime = 0;
      }
    }
  }, [gameState?.question_id, gameState?.show_answer]);

  if (!gameState) return <div>Loading game...</div>;
  if (gameState.finished) return <GameOver leaderboard={gameState.leaderboard} onReset={onReset} />;

  const handleAnswer = (choice) => {
  if (!isAnswered) {
    setSelectedAnswer(choice);
    setIsAnswered(true);
    axios.post('http://localhost:10000/answer', {
      nickname,
      answer: choice,
    });
  }
};


  return (
    <div className="quiz-container">
      <audio ref={questionMusicRef} src="/music/questions music.mp3" loop />
      <div className="quiz-header">
        <h2>{gameState.question}</h2>
        <img src={`/images/${gameState.image_url}`} alt="question visual" />
      </div>
      <div className="choices">
        {gameState.choices.map((choice, idx) => (
          <button
            key={idx}
            onClick={() => handleAnswer(choice)}
            className={`choice-btn ${answersDisabled && idx === gameState.answer_index ? 'correct' : ''} ${selectedAnswer === choice ? 'selected' : ''}`}
            disabled={answersDisabled || isAnswered}
          >
            {choice}
          </button>
        ))}
      </div>
      <div className="timer">⏰ Time Left: {gameState.timer}</div>
    </div>
  );
}
