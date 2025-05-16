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

  return <QuizGame nickname={nickname} icon={icon} />;
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
