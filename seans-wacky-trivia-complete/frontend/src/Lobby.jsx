import React, { useState } from 'react';
import { PRELOADED_ICONS } from './icons';
 // Or wherever you moved PRELOADED_ICONS

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
        {PRELOADED_ICONS.map((icon, i) => (
          <div
            key={i}
            className={selectedIcon === icon.url ? 'icon selected' : 'icon'}
            onClick={() => setSelectedIcon(icon.url)}
          >
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
