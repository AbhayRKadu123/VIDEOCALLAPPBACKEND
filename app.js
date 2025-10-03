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

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
const RegisteredUsers = {}
function getUsernameBySocketId(socketId) {
  return Object.keys(RegisteredUsers).find(
    (username) => RegisteredUsers[username] === socketId
  );
}
io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  socket.on('register-user', ({ username }) => {
    RegisteredUsers[username] = socket.id;
    console.log('username=', RegisteredUsers)
  })
  socket.on("offer", ({ sdp,Target}) => {
    io.to(RegisteredUsers[Target]).emit("offer", { sdp, from: getUsernameBySocketId(socket.id) });
  });

  socket.on("answer", ({ sdp, Target,sender }) => {
    console.log('Target from ans=', Target)
    if (RegisteredUsers[Target]) {
      console.log('RegisteredUsers[Target]=', RegisteredUsers[Target])
      socket.to(RegisteredUsers[Target]).emit("answer", { sdp, from: getUsernameBySocketId(socket.id) });
    }
  });

  socket.on("ice-candidate", ({ candidate, Target }) => {
    // console.log('Registered Use1r=',RegisteredUsers[Target])

    if (RegisteredUsers[Target]) {
      console.log('Registered User=', RegisteredUsers[Target])
      console.log('Registered User=', Target)
      socket.to(RegisteredUsers[Target]).emit("ice-candidate", { candidate, from: socket.id });

    }
  });
});

server.listen(5000, () => console.log("Server running on port 5000"));

server / server.js
