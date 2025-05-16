import React, { useState, useEffect } from 'react';
import Lobby from './Lobby';
import QuizGame from './QuizGame';

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
    return (
      <Lobby
        onSubmit={(nick, icn) => {
          setNickname(nick);
          setIcon(icn);
          localStorage.setItem('nickname', nick);
          localStorage.setItem('icon', icn);
        }}
      />
    );
  }

  return (
    <QuizGame
      nickname={nickname}
      icon={icon}
      onReset={() => {
        localStorage.clear();
        setNickname('');
        setIcon('');
      }}
    />
  );
}
