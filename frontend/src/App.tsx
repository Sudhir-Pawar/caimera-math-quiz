import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import "./App.css";

// Connect to our Node backend
const socket: Socket = io("http://localhost:3000");

function App() {
  const [question, setQuestion] = useState<string>("Waiting for next round...");
  const [answer, setAnswer] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [leaderboard, setLeaderboard] = useState<Record<string, number>>({});
  const [isLocked, setIsLocked] = useState<boolean>(true);

  useEffect(() => {
    socket.on("new_question", (data: { mathString: string }) => {
      setQuestion(data.mathString);
      setAnswer("");
      setStatusMessage("");
      setIsLocked(false);
    });

    socket.on(
      "winner_announced",
      (data: { winnerId: string; correctAnswer: number }) => {
        setIsLocked(true);
        if (data.winnerId === socket.id) {
          setStatusMessage(`You won! The answer was ${data.correctAnswer}.`);
        } else {
          setStatusMessage(
            `Someone else won! The answer was ${data.correctAnswer}.`,
          );
        }
      },
    );

    socket.on("wrong_answer", () => {
      setStatusMessage("Incorrect, try again!");
      setAnswer("");
    });

    socket.on("leaderboard_update", (scores: Record<string, number>) => {
      setLeaderboard(scores);
    });

    return () => {
      socket.off("new_question");
      socket.off("winner_announced");
      socket.off("wrong_answer");
      socket.off("leaderboard_update");
    };
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!answer || isLocked) return;

    socket.emit("submit_answer", { answer: parseInt(answer, 10) });
  };

  return (
    <div className="container">
      <header>
        <h1>Caimera Math Clash</h1>
        <p className="socket-id">Your ID: {socket.id}</p>
      </header>

      <main className="quiz-card">
        <h2 className="question-display">{question}</h2>

        <form onSubmit={handleSubmit} className="answer-form">
          <input
            type="number"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Enter answer..."
            disabled={isLocked}
            autoFocus
          />
          <button type="submit" disabled={isLocked || !answer}>
            Submit
          </button>
        </form>

        {statusMessage && (
          <div
            className={`status-message ${statusMessage.includes("won") ? "success" : "error"}`}
          >
            {statusMessage}
          </div>
        )}
      </main>

      <aside className="leaderboard">
        <h3>High Scores</h3>
        <ul>
          {Object.entries(leaderboard)
            .sort(([, a], [, b]) => b - a)
            .map(([id, score]) => (
              <li key={id} className={id === socket.id ? "highlight" : ""}>
                {id.substring(0, 5)}... : <strong>{score}</strong>
              </li>
            ))}
        </ul>
      </aside>
    </div>
  );
}

export default App;
