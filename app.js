// // server/server.js
// const express = require("express");
// const http = require("http");
// const { Server } = require("socket.io");

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, { cors: { origin: "*" } });

// io.on("connection", (socket) => {
//   console.log("Connected:", socket.id);

//   socket.on("offer", ({ sdp }) => {
//     socket.broadcast.emit("offer", { sdp, from: socket.id });
//   });

//   socket.on("answer", ({ sdp }) => {
//     socket.broadcast.emit("answer", { sdp, from: socket.id });
//   });

//   socket.on("ice-candidate", ({ candidate }) => {
//     socket.broadcast.emit("ice-candidate", { candidate, from: socket.id });
//   });
// });

// server.listen(5000, () => console.log("Server running on port 5000"));

// server/server.js

// server/server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors()); // Allow all origins for testing

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Store users: username -> socketId
const RegisteredUsers = {};

function getUsernameBySocketId(socketId) {
  return Object.keys(RegisteredUsers).find(
    (username) => RegisteredUsers[username] === socketId
  );
}

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  // Register user
  socket.on("register-user", ({ username }) => {
    RegisteredUsers[username] = socket.id;
    socket.data.username = username; // store username in socket object
    console.log(`Registered user: ${username} (${socket.id})`);
    console.log("Current users:", RegisteredUsers);
  });

  // Offer
  socket.on("offer", ({ sdp, Target }) => {
    if (RegisteredUsers[Target]) {
      console.log(`Forwarding offer from ${socket.data.username} to ${Target}`);
      io.to(RegisteredUsers[Target]).emit("offer", {
        sdp,
        from: socket.data.username,
      });
    } else {
      console.log(`Offer target not found: ${Target}`);
    }
  });

  // Answer
  socket.on("answer", ({ sdp, Target }) => {
    if (RegisteredUsers[Target]) {
      console.log(`Forwarding answer from ${socket.data.username} to ${Target}`);
      io.to(RegisteredUsers[Target]).emit("answer", {
        sdp,
        from: socket.data.username,
      });
    } else {
      console.log(`Answer target not found: ${Target}`);
    }
  });

  // ICE candidate
  socket.on("ice-candidate", ({ candidate, Target }) => {
    if (RegisteredUsers[Target]) {
      console.log(`Forwarding ICE candidate from ${socket.data.username} to ${Target}`);
      io.to(RegisteredUsers[Target]).emit("ice-candidate", {
        candidate,
        from: socket.data.username,
      });
    } else {
      console.log(`ICE candidate target not found: ${Target}`);
    }
  });

  // Disconnect
  socket.on("disconnect", () => {
    const username = getUsernameBySocketId(socket.id);
    if (username) {
      delete RegisteredUsers[username];
      console.log(`User disconnected: ${username} (${socket.id})`);
      console.log("Updated users:", RegisteredUsers);
    } else {
      console.log(`Unknown socket disconnected: ${socket.id}`);
    }
  });
});

// Use dynamic port for Render
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
