import './QuizGame.css';
import React, { useState, useEffect } from "react";

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
  const [question, setQuestion] = useState(null);
  const [selected, setSelected] = useState(null);
  const [answerShown, setAnswerShown] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(13);

  useEffect(() => {
    fetch(`${API_BASE}/next-question`, { method: 'POST' })
      .then(res => res.json())
      .then(data => setQuestion(data));
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && !answerShown) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (!answerShown) {
      setAnswerShown(true);
    }
  }, [timeLeft, answerShown]);

  const handleAnswer = (choice) => {
    if (!answerShown) {
      setSelected(choice);
      if (choice === question.correct_answer) setScore(score + 1);
      setAnswerShown(true);
    }
  };

  if (!question) return <div>Loading question...</div>;

  return (
    <div className="quiz-container">
      <h1>Sean’s Wacky Trivia 🎶</h1>
      <div className="question-box">
        <h2>{question.text}</h2>
        <div className="choices">
          {question.choices.map((c, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(c)}
              className={answerShown && c === question.correct_answer ? 'correct' : ''}
              disabled={answerShown}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="timer">Time left: {timeLeft}s</div>
        {answerShown && (
          <div className="answer-display">
            <p>Correct Answer: {question.correct_answer}</p>
            {question.image_url && <img src={question.image_url} alt="answer visual" className="answer-image" />}
            <p>Your Score: {score}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export { PRELOADED_ICONS };
