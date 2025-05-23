
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Lobby.css';

export default function Lobby({ onSubmit }) {
  const [nickname, setNickname] = useState('');
  const [icon, setIcon] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  const lobbyMusicRef = useRef(null);

  useEffect(() => {
    lobbyMusicRef.current.play().catch(() => {});
  }, []);

  const handleJoin = () => {
    if (!nickname || !icon) {
      setError('Please enter a nickname and select an icon.');
      return;
    }
    setIsJoining(true);
    axios.post('http://localhost:10000/join', { nickname, icon })
      .then(() => {
        onSubmit(nickname, icon);
        lobbyMusicRef.current.pause();
        lobbyMusicRef.current.currentTime = 0;
      })
      .catch((err) => {
        setError('Failed to join game. Please try again.');
        setIsJoining(false);
      });
  };

  const icons = ['icon1.png', 'icon2.png', 'icon3.png', 'icon4.png'];

  return (
    <div className="lobby-container" style={{ backgroundImage: "url('/images/background.jpg')" }}>
      <audio ref={lobbyMusicRef} src="/music/waiting screen.mp3" loop />
      <h1>Join the Trivia Game</h1>
      <input
        type="text"
        placeholder="Enter your nickname"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
      />
      <div className="icon-select">
        {icons.map((icn, idx) => (
          <img
            key={idx}
            src={`/avatars/${icn}`}
            alt={`icon ${idx}`}
            className={icon === icn ? 'selected' : ''}
            onClick={() => setIcon(icn)}
          />
        ))}
      </div>
      {error && <div className="error">{error}</div>}
      <button onClick={handleJoin} disabled={isJoining}>
        {isJoining ? 'Joining...' : 'Join Game'}
      </button>
    </div>
  );
}
