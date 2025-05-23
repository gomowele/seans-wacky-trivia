import React, { useState, useEffect, useRef } from 'react';
import Lobby from './Lobby';
import QuizGame from './QuizGame';
import './QuizGame.css';

export default function App() {
  const [nickname, setNickname] = useState('');
  const [icon, setIcon] = useState('');
  const waitingMusicRef = useRef(null);

  useEffect(() => {
    const savedNick = localStorage.getItem('nickname');
    const savedIcon = localStorage.getItem('icon');
    if (savedNick && savedIcon) {
      setNickname(savedNick);
      setIcon(savedIcon);
    }
  }, []);

  // Play waiting music on load
  useEffect(() => {
    if (!nickname || !icon) {
      waitingMusicRef.current?.play().catch(err => console.log('Music error:', err));
    }
  }, [nickname, icon]);

  if (!nickname || !icon) {
    return (
      <>
        <Lobby
          onSubmit={(nick, icn) => {
            setNickname(nick);
            setIcon(icn);
            localStorage.setItem('nickname', nick);
            localStorage.setItem('icon', icn);
          }}
        />
        <audio ref={waitingMusicRef} src="/music/waiting screen.mp3" loop autoPlay />
      </>
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
