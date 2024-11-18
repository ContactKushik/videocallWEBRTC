import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

const server = http.createServer(app);
const io = new Server(server);

let userCount = 0;

io.on("connection", (socket) => {
  userCount++;
  console.log(`User connected: ${socket.id}, Users: ${userCount}`);

  socket.on("signalingMessage", (message) => {
    socket.broadcast.emit("signalingMessage", message);
  });

  socket.on("disconnect", () => {
    userCount--;
    console.log(`User disconnected: ${socket.id}, Users: ${userCount}`);
  });
});

app.get("/", (req, res) => res.render("index"));

server.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
