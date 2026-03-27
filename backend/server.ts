import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import setupGameHandler from "./socket/game-handler";

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

setupGameHandler(io);

const PORT: string | number = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
