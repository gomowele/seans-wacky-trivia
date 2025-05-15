import { useState, useEffect } from "react";

export default function QuizGame() {
  const [nickname, setNickname] = useState("");
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [icons, setIcons] = useState([]);
  const [joined, setJoined] = useState(false);
  const [playerId, setPlayerId] = useState(null);
  const [question, setQuestion] = useState(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [winner, setWinner] = useState(null);
  const [timer, setTimer] = useState(10);

  const signupMusic = new Audio("/music/signup.mp3");
  const questionMusic = new Audio("/music/question.mp3");
  const timeoutSound = new Audio("/music/timeout.mp3");
  const resultSound = new Audio("/music/result.mp3");

  const handleIconUpload = (e) => {
    const files = Array.from(e.target.files);
    const fileURLs = files.map((file) => URL.createObjectURL(file));
    setIcons((prev) => [...prev, ...fileURLs]);
  };

 const handleJoin = async () => {
  if (nickname && selectedIcon) {
    // Trigger music on user interaction to bypass browser block
    signupMusic.pause();
    signupMusic.currentTime = 0;
    signupMusic.play();

    const formData = new FormData();
    formData.append("nickname", nickname);
    formData.append("icon_url", selectedIcon);

    const res = await fetch("https://trivia-backend-79q3.onrender.com/join", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setPlayerId(data.player_id);
    setJoined(true);
  }
};


  const fetchQuestion = async () => {
    const res = await fetch("https://trivia-backend-79q3.onrender.com/current-question");
    const data = await res.json();
    if (data.question) {
      setQuestion(data);
      setTimer(10);
      questionMusic.play();
    } else if (data.status === "finished") {
      fetchLeaderboard();
    }
  };

  const submitAnswer = async (index) => {
    const formData = new FormData();
    formData.append("player_id", playerId);
    formData.append("answer_index", index);

    await fetch("https://trivia-backend-79q3.onrender.com/submit-answer", {
      method: "POST",
      body: formData,
    });

    questionMusic.pause();
    questionMusic.currentTime = 0;
    setAnswerSubmitted(true);
    setTimeout(() => {
      nextQuestion();
    }, 1000);
  };
  const nextQuestion = async () => {
    const res = await fetch("https://trivia-backend-79q3.onrender.com/next-question", {
      method: "POST",
    });
    const data = await res.json();
    if (data.status === "ok") {
      setQuestion(data.question);
      setAnswerSubmitted(false);
      setTimer(10);
      questionMusic.play();
    } else {
      fetchLeaderboard();
    }
  };

  const fetchLeaderboard = async () => {
    questionMusic.pause();
    questionMusic.currentTime = 0;
    resultSound.play();

    const res = await fetch("https://trivia-backend-79q3.onrender.com/leaderboard");
    const data = await res.json();
    setLeaderboard(data.top5);
    setWinner(data.winner);
    setShowResults(true);
  };

  useEffect(() => {
    if (!joined) {
      signupMusic.loop = true;
      signupMusic.volume = 0.5;
      signupMusic.play();
    }
  }, []);

  useEffect(() => {
    if (joined) {
      const interval = setInterval(() => {
        fetchQuestion();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [joined]);

  useEffect(() => {
    if (question && !answerSubmitted) {
      const countdown = setInterval(() => {
        setTimer((prev) => {
          if (prev === 1) {
            clearInterval(countdown);
            timeoutSound.play();
            setAnswerSubmitted(true);
            questionMusic.pause();
            questionMusic.currentTime = 0;
            nextQuestion();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(countdown);
    }
  }, [question, answerSubmitted]);

  if (!joined) {
    return (
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-bold text-center">Sean’s Wacky Trivia 🤪😎🫡</h1>
        <input
          placeholder="Enter your nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
        <label>
          Upload avatar icons:
          <input type="file" accept="image/*" multiple onChange={handleIconUpload} />
        </label>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {icons.map((icon, index) => (
            <img
              key={index}
              src={icon}
              alt="avatar"
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                border: selectedIcon === icon ? "2px solid black" : "2px solid transparent",
                cursor: "pointer",
              }}
              onClick={() => setSelectedIcon(icon)}
            />
          ))}
        </div>
        <button onClick={handleJoin} disabled={!nickname || !selectedIcon}>
          Join Game
        </button>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-bold text-center">Game Over!</h1>
        <h2 className="text-xl font-semibold">Winner: {winner?.nickname}</h2>
        <div className="space-y-2">
          {leaderboard.map((player, index) => (
            <div key={index} className="flex justify-between">
              <span>{player.nickname}</span>
              <span>{Math.round(player.score)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (question) {
    return (
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-bold text-center">Sean’s Wacky Trivia 🤪😎🫡</h1>
        <div className="space-y-2">
          <h2 className="text-lg font-bold">{question.question}</h2>
          <div>⏱️ {timer}s</div>
          {question.choices.map((choice, idx) => (
            <button
              key={idx}
              onClick={() => submitAnswer(idx)}
              disabled={answerSubmitted}
              style={{
                display: "block",
                width: "100%",
                padding: "10px",
                marginTop: "5px",
              }}
            >
              {choice}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-center">Sean’s Wacky Trivia 🤪😎🫡</h1>
      <p>Waiting for the quiz to start...</p>
    </div>
  );
}
