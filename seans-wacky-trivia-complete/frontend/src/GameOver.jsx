import React, { useEffect, useRef } from 'react';
import './GameOver.css';

export default function GameOver({ leaderboard, onReset }) {
  const musicRef = useRef(null);

  useEffect(() => {
    musicRef.current.play().catch(() => {});
    return () => {
      musicRef.current.pause();
    };
  }, []);

  return (
    <div className="gameover-container">
      <audio ref={musicRef} src="/music/leader board.mp3" loop />
      <h1>🏁 Game Over! 🏁</h1>
      <h2>Final Scores</h2>
      <ul className="leaderboard">
        {leaderboard
          .sort((a, b) => b.score - a.score)
          .map((player, index) => (
            <li
              key={player.name}
              className={player.top ? 'leaderboard-entry top-player' : 'leaderboard-entry'}
            >
              <span className="rank">#{index + 1}</span>
              <span className="icon">{player.icon}</span>
              <span className="name">{player.name}</span>
              <span className="score">{player.score} pts</span>
            </li>
          ))}
      </ul>
      <button className="reset-button" onClick={onReset}>
        Play Again
      </button>
    </div>
  );
}
