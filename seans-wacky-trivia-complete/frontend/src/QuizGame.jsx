import './QuizGame.css';
import React, { useState, useEffect } from "react";

const API_BASE = "https://trivia-backend-79q3.onrender.com";

const PRELOADED_ICONS = [
  // (unchanged icon list)
];

export default function QuizGame() {
  const [questionData, setQuestionData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [answerShown, setAnswerShown] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(13);
  const [isFinished, setIsFinished] = useState(false);

  const fetchQuestion = () => {
    fetch(`${API_BASE}/next-question`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        console.log("Fetched question:", data);
        if (data.status === "ok") {
          setQuestionData(data.question);
          setAnswerShown(false);
          setTimeLeft(13);
        } else if (data.status === "finished") {
          setIsFinished(true);
        }
      })
      .catch(err => console.error("Failed to load question:", err));
  };

  useEffect(() => {
    fetchQuestion();
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && !answerShown) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (!answerShown) {
      setAnswerShown(true);
    } else {
      // Auto-advance to next question after 5s of showing the answer
      const delay = setTimeout(() => {
        fetchQuestion();
      }, 5000);
      return () => clearTimeout(delay);
    }
  }, [timeLeft, answerShown]);

  const handleAnswer = (choice) => {
    if (!answerShown) {
      setSelected(choice);
      const correctAnswer = questionData.choices[questionData.answer_index];
      if (choice === correctAnswer) setScore(score + 1);
      setAnswerShown(true);
    }
  };

  const handleRestart = () => {
    fetch(`${API_BASE}/reset`, { method: 'POST' })
      .then(() => {
        setIsFinished(false);
        setQuestionData(null);
        setScore(0);
        fetchQuestion();
      });
  };

  if (isFinished) {
    return (
      <div className="quiz-container">
        <h1>Sean’s Wacky Trivia 🎶</h1>
        <h2>Game Over!</h2>
        <p>Your final score: {score}</p>
        <button onClick={handleRestart}>Restart Game</button>
      </div>
    );
  }

  if (!questionData) return <div>Loading question...</div>;

  const correctAnswer = questionData.choices[questionData.answer_index];
  const fallbackImage = "https://upload.wikimedia.org/wikipedia/commons/4/4f/Music-note.svg";

  return (
    <div className="quiz-container">
      <h1>Sean’s Wacky Trivia 🎶</h1>
      <div className="question-box">
        <h2>{questionData.question || 'No question text provided.'}</h2>
        <div className="choices">
          {questionData.choices?.length > 0 ? (
            questionData.choices.map((c, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(c)}
                className={answerShown && c === correctAnswer ? 'correct' : ''}
                disabled={answerShown}
              >
                {c}
              </button>
            ))
          ) : (
            <p>No choices available for this question.</p>
          )}
        </div>
        <div className="timer">Time left: {timeLeft}s</div>
        {answerShown && (
          <div className="answer-display">
            <p>Correct Answer: {correctAnswer}</p>
            <img
              src={questionData.image_url || fallbackImage}
              alt="answer visual"
              className="answer-image"
              onError={(e) => (e.target.src = fallbackImage)}
            />
            <p>Your Score: {score}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export { PRELOADED_ICONS };
