import React, { useState, useEffect } from "react";

const API_BASE = "https://trivia-backend-79q3.onrender.com";

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
      setArtistImage(null);
    }
  };

  const submitAnswer = async () => {
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

  if (!playerId) {
    return (
      <div style={{ padding: 20 }}>
        <h1>Sean’s Wacky Trivia 🤪😎🫡</h1>
        <input
          type="text"
          placeholder="Enter nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter avatar URL"
          onChange={(e) => setIcon(e.target.value)}
        />
        <button onClick={joinGame} disabled={!nickname || !icon}>
          Join Game
        </button>
      </div>
    );
  }

  if (showResults) {
    return (
      <div style={{ padding: 20 }}>
        <h2>🎉 Game Over!</h2>
        <h3>🏆 Top 5 Players</h3>
        <ul>
          {leaderboard.map((p, i) => (
            <li key={i}>
              {p.nickname} — {p.score} pts
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>🎵 Music Trivia Time</h2>
      {question ? (
        <>
          <p>{question.question}</p>
          <ul>
            {question.choices.map((choice, idx) => (
              <li key={idx}>
                <button
                  disabled={answerSubmitted}
                  style={{
                    fontWeight: answerSubmitted && idx === correctIndex ? "bold" : "normal",
                    backgroundColor:
                      answerSubmitted && idx === correctIndex
                        ? "lightgreen"
                        : answerSubmitted && idx === selectedAnswer
                        ? "lightcoral"
                        : "white"
                  }}
                  onClick={() => setSelectedAnswer(idx)}
                >
                  {choice}
                </button>
              </li>
            ))}
          </ul>

          {!answerSubmitted && selectedAnswer !== null && (
            <button onClick={submitAnswer}>Submit</button>
          )}

          {answerSubmitted && correctIndex !== null && (
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <h3>✅ Correct Answer:</h3>
              <p style={{ fontWeight: 'bold' }}>{question.choices[correctIndex]}</p>
              {artistImage && (
                <img src={artistImage} alt="Artist" style={{ width: '200px', borderRadius: '8px', marginTop: '10px' }} />
              )}
              <h4 style={{ marginTop: '20px' }}>🏆 Top 5 Scores</h4>
              <ul>
                {leaderboard.map((player, idx) => (
                  <li key={idx}>
                    {player.nickname} — {player.score} pts
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <p>Waiting for the quiz to start...</p>
      )}
    </div>
  );
}
