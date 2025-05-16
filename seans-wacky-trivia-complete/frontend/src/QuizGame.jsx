import React, { useState, useEffect } from "react";
import "./QuizGame.css";

const API_BASE = "https://trivia-backend-79q3.onrender.com";

const PRELOADED_ICONS = [
  // Sports
  { name: "LeBron James", url: "https://upload.wikimedia.org/wikipedia/commons/2/2f/LeBron_James_Lakers.jpg" },
  { name: "Serena Williams", url: "https://upload.wikimedia.org/wikipedia/commons/4/4c/Serena_Williams_2013_US_Open.jpg" },
  { name: "Lionel Messi", url: "https://upload.wikimedia.org/wikipedia/commons/8/87/Lionel_Messi_20180626.jpg" },
  { name: "Michael Jordan", url: "https://upload.wikimedia.org/wikipedia/commons/a/ae/Michael_Jordan_in_2014.jpg" },
  { name: "Simone Biles", url: "https://upload.wikimedia.org/wikipedia/commons/f/f6/Simone_Biles_Rio_2016e.jpg" },
  // Music
  { name: "Taylor Swift", url: "https://upload.wikimedia.org/wikipedia/commons/5/58/Taylor_Swift_3_-_2019.jpg" },
  { name: "Drake", url: "https://upload.wikimedia.org/wikipedia/commons/9/94/Drake_at_the_2017_Billboard_Music_Awards.jpg" },
  { name: "Beyoncé", url: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Beyonce_-_Grammy_Awards_2023.jpg" },
  { name: "Bruno Mars", url: "https://upload.wikimedia.org/wikipedia/commons/1/13/Bruno_Mars_24K_Magic_World_Tour_in_Milan_%281%29.jpg" },
  { name: "Selena", url: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Selena_Quintanilla_P%C3%A9rez.png" },
  // Movies
  { name: "Dwayne Johnson", url: "https://upload.wikimedia.org/wikipedia/commons/e/ed/Dwayne_Johnson_2014.jpg" },
  { name: "Scarlett Johansson", url: "https://upload.wikimedia.org/wikipedia/commons/9/91/Scarlett_Johansson_by_Gage_Skidmore_2.jpg" },
  { name: "Tom Hanks", url: "https://upload.wikimedia.org/wikipedia/commons/2/29/Tom_Hanks_TIFF_2019.jpg" },
  { name: "Zendaya", url: "https://upload.wikimedia.org/wikipedia/commons/6/6e/Zendaya_2023.jpg" },
  { name: "Keanu Reeves", url: "https://upload.wikimedia.org/wikipedia/commons/b/bc/Keanu_Reeves_%282018%29.jpg" },
  // Video Games
  { name: "Mario", url: "https://upload.wikimedia.org/wikipedia/en/a/a9/MarioNSMBUDeluxe.png" },
  { name: "Lara Croft", url: "https://upload.wikimedia.org/wikipedia/en/e/e5/Lara_Croft_%282013_video_game%29.png" },
  { name: "Master Chief", url: "https://upload.wikimedia.org/wikipedia/en/e/e0/Master_Chief_in_Halo_5.png" },
  { name: "Sonic", url: "https://upload.wikimedia.org/wikipedia/en/e/e2/Sonic_the_Hedgehog.png" },
  { name: "Link", url: "https://upload.wikimedia.org/wikipedia/en/8/8e/Link_BotW.png" }
];

export default function QuizGame() {
  const [nickname, setNickname] = useState("");
  const [icon, setIcon] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [question, setQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [correctIndex, setCorrectIndex] = useState(null);
  const [artistImage, setArtistImage] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [timer, setTimer] = useState(13);

  const joinGame = async () => {
    const formData = new FormData();
    formData.append("nickname", nickname);
    formData.append("icon_url", icon);

    const res = await fetch(`${API_BASE}/join`, {
      method: "POST",
      body: formData
    });
    const data = await res.json();
    setPlayerId(data.player_id);
  };

  const fetchQuestion = async () => {
    const res = await fetch(`${API_BASE}/current-question`);
    const data = await res.json();

    if (data.status === "finished") {
      const res = await fetch(`${API_BASE}/leaderboard`);
      const lb = await res.json();
      setLeaderboard(lb.top5);
      setShowResults(true);
    } else if (data.status !== "waiting") {
      setQuestion(data);
      setAnswerSubmitted(false);
      setSelectedAnswer(null);
      setCorrectIndex(null);
      setArtistImage(data.image_url || null);
      setTimer(13);
    }
  };

  const submitAnswer = async () => {
    if (answerSubmitted || selectedAnswer === null) return;

    const formData = new FormData();
    formData.append("player_id", playerId);
    formData.append("answer_index", selectedAnswer);

    const response = await fetch(`${API_BASE}/submit-answer`, {
      method: "POST",
      body: formData
    });

    const data = await response.json();
    setCorrectIndex(data.correct_index);
    setArtistImage(data.image_url);

    const lb = await fetch(`${API_BASE}/leaderboard`);
    const lbData = await lb.json();
    setLeaderboard(lbData.top5);

    setAnswerSubmitted(true);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchQuestion();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (timer > 0 && question && !answerSubmitted) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(countdown);
    } else if (timer === 0 && !answerSubmitted) {
      submitAnswer();
    }
  }, [timer, question, answerSubmitted]);

  if (!playerId) {
    return (
      <div className="signup-screen">
        <h1 className="game-title">Sean’s Wacky Trivia 🤪😎🫡</h1>
        <input
          className="nickname-input"
          type="text"
          placeholder="Enter nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
        <h3>Select Your Icon</h3>
        <div className="icon-grid">
          {PRELOADED_ICONS.map((iconData, index) => (
            <div key={index} className="icon-option" onClick={() => setIcon(iconData.url)}>
              <img
                src={iconData.url}
                alt={iconData.name}
                className={icon === iconData.url ? "icon selected" : "icon"}
              />
              <div className="icon-label">{iconData.name}</div>
            </div>
          ))}
        </div>
        <button className="join-button" onClick={joinGame} disabled={!nickname || !icon}>
          Join Game
        </button>
      </div>
    );
  }
