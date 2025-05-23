import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Lobby.css';

const icons = ['🎧', '🎸', '🎤', '🎷', '🥁', '🎹', '🪕', '🎻'];

export default function Lobby({ onSubmit }) {
  const [nickname, setNickname] = useState('');
  const [icon, setIcon] = useState(icons[0]);
  const [players, setPlayers] = useState([]);
  const waitingMusicRef = useRef(null);

  useEffect(() => {
    waitingMusicRef.current.play().catch(() => {});
    const interval = setInterval(() => {
      axios.get('http://localhost:10000/state').then((res) => {
        if (res.data.started) {
          waitingMusicRef.current.pause();
        }
        setPlayers(Object.entries(res.data.scores || {}).map(([name, data]) => ({ name, ...data })));
      });
    }, 1000);
    return () => {
      clearInterval(interval);
      waitingMusicRef.current.pause();
    };
  }, []);

  const handleJoin = async () => {
    if (!nickname.trim()) return alert('Please enter a nickname.');
    await axios.post('http://localhost:10000/join', { nickname, icon });
    onSubmit(nickname, icon);
  };

  return (
    <div className="lobby-container">
      <audio ref={waitingMusicRef} src="/music/waiting screen.mp3" loop />
      <h2>🎶 Welcome to Wacky Trivia! 🎶</h2>
      <input
        type="text"
        placeholder="Enter nickname"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        className="nickname-input"
      />
      <div className="icon-selector">
        {icons.map((icn) => (
          <button
            key={icn}
            onClick={() => setIcon(icn)}
            className={icon === icn ? 'icon-button selected' : 'icon-button'}
          >
            {icn}
          </button>
        ))}
      </div>
      <button onClick={handleJoin} className="join-button">
        Join Game
      </button>
      <div className="player-list">
        <h3>Players in Lobby:</h3>
        <ul>
          {players.map((p) => (
            <li key={p.name}>
              {p.icon} {p.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
