import { Server, Socket } from "socket.io";
import { Question, generateQuestion } from "../utils/math-generator";

let currentQuestion: Question | null = null;
let isQuestionActive: boolean = false;
const scores: Record<string, number> = {};

export default function setupGameHandler(io: Server): void {
  io.on("connection", handleOnConnection);

  function startNewRound(): void {
    currentQuestion = generateQuestion();
    isQuestionActive = true;
    io.emit("new_question", { mathString: currentQuestion.mathString });
  }

  function handleOnConnection(socket: Socket) {
    console.log(`user connected: ${socket.id}`);

    if (!scores[socket.id]) {
      scores[socket.id] = 0;
    }

    if (isQuestionActive && currentQuestion) {
      socket.emit("new_question", { mathString: currentQuestion.mathString });
    } else if (!currentQuestion) {
      startNewRound();
    }

    socket.emit("leaderboard_update", scores);

    socket.on("submit_answer", function (data: { answer: number }) {
      if (!isQuestionActive || !currentQuestion) return;

      if (data.answer == currentQuestion.answer) {
        isQuestionActive = false;
        scores[socket.id] = (scores[socket.id] ?? 0) + 1;
        io.emit("winner_announced", {
          winnerId: socket.id,
          correctAnswer: currentQuestion.answer,
        });

        io.emit("leaderboard_update", scores);

        setTimeout(() => {
          startNewRound();
        }, 3000);
      } else {
        socket.emit("wrong_answer");
      }
    });

    socket.on("disconnect", function () {
      delete scores[socket.id];
      console.log("socket disconnected: ", socket.id);
    });
  }
}
