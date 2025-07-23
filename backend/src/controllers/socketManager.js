// import { Server } from "socket.io"

// import fetch from 'node-fetch';


// async function predictToxicity(comment) {
//   try {
//     const response = await fetch("http://127.0.0.1:5000/predict", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ comment }),
//     });

//     if (!response.ok) {
//       throw new Error(`Python API error: ${response.statusText}`);
//     }
//     return await response.json();
//   } catch (err) {
//     console.error("🔴 Prediction API call failed:", err);
//     // Return a default non-toxic result so the app doesn't break
//     return { toxic: false, severe_toxic: false, obscene: false, threat: false, insult: false, identity_hate: false };
//   }
// }


// let connections = {}
// let messages = {}
// let timeOnline = {}

// export const connectToSocket = (server) => {
//     const io = new Server(server, {
//         cors: {
//             origin: "*",
//             methods: ["GET", "POST"],
//             allowedHeaders: ["*"],
//             credentials: true
//         }
//     });


//     io.on("connection", (socket) => {

//         console.log("SOMETHING CONNECTED")

//         socket.on("join-call", (path) => {

//             if (connections[path] === undefined) {
//                 connections[path] = []
//             }
//             connections[path].push(socket.id)

//             timeOnline[socket.id] = new Date();

//             // connections[path].forEach(elem => {
//             //     io.to(elem)
//             // })

//             for (let a = 0; a < connections[path].length; a++) {
//                 io.to(connections[path][a]).emit("user-joined", socket.id, connections[path])
//             }

//             if (messages[path] !== undefined) {
//                 for (let a = 0; a < messages[path].length; ++a) {
//                     io.to(socket.id).emit("chat-message", messages[path][a]['data'],
//                         messages[path][a]['sender'], messages[path][a]['socket-id-sender'])
//                 }
//             }

//         })

//         socket.on("signal", (toId, message) => {
//             io.to(toId).emit("signal", socket.id, message);
//         })

//         socket.on("chat-message", async({data, sender}) => {
//             console.log("🧠 Received message:", data, "from", sender);
//             const [matchingRoom, found] = Object.entries(connections)
//                 .reduce(([room, isFound], [roomKey, roomValue]) => {


//                     if (!isFound && roomValue.includes(socket.id)) {
//                         return [roomKey, true];
//                     }

//                     return [room, isFound];

//                 }, ['', false]);

//             if (found === true) {
//                 if (messages[matchingRoom] === undefined) {
//                     messages[matchingRoom] = []
//                 }

//                 messages[matchingRoom].push({ 'sender': sender, "data": data, "socket-id-sender": socket.id })
//                 console.log("📦 Running ML toxicity check...");

//                 try {
//                     const labels = await predictToxicity(data);
//                     const isToxic = Object.values(labels).some((v) => v === true);

//                     const messagePayload = {
//                         sender,
//                         data,
//                         blurred: isToxic,
//                         labels: Object.entries(labels)
//                         .filter(([_, val]) => val)
//                         .map(([key]) => key),
//                         "socket-id-sender": socket.id,
//                     };

//                     connections[matchingRoom].forEach((elem) => {
//                         io.to(elem).emit("chat-message", messagePayload);
//                     });
//                     } catch (err) {
//                     console.error("🔴 ML Prediction failed:", err);
//                     }

//                                 }

//                             })

//                             socket.on("disconnect", () => {

//                                 var diffTime = Math.abs(timeOnline[socket.id] - new Date())

//                                 var key

//                                 for (const [k, v] of JSON.parse(JSON.stringify(Object.entries(connections)))) {

//                                     for (let a = 0; a < v.length; ++a) {
//                                         if (v[a] === socket.id) {
//                                             key = k

//                                             for (let a = 0; a < connections[key].length; ++a) {
//                                                 io.to(connections[key][a]).emit('user-left', socket.id)
//                                             }

//                                             var index = connections[key].indexOf(socket.id)

//                                             connections[key].splice(index, 1)


//                                             if (connections[key].length === 0) {
//                                                 delete connections[key]
//                                             }
//                                         }
//                                     }

//                                 }


//                             })


//     })


//     return io;
// }




// backend/src/controllers/socketManager.js

import { Server } from "socket.io";
import fetch from 'node-fetch'; // Make sure to install node-fetch: npm install node-fetch

// ✅ This function is now much faster!
async function predictToxicity(comment) {
  try {
    const response = await fetch("http://127.0.0.1:5000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment }),
    });

    if (!response.ok) {
      throw new Error(`Python API error: ${response.statusText}`);
    }
    return await response.json();
  } catch (err) {
    console.error("🔴 Prediction API call failed:", err);
    // Return a default non-toxic result so the app doesn't break
    return { toxic: false, severe_toxic: false, obscene: false, threat: false, insult: false, identity_hate: false };
  }
}

export const connectToSocket = (server) => {
  const io = new Server(server, { cors: {
      origin: "http://localhost:3000", // The URL of your React app
      methods: ["GET", "POST"]
    }});

  io.on("connection", (socket) => {
    console.log("USER CONNECTED:", socket.id);

    socket.on("join-call", (roomName) => {
      const clientsInRoom = io.sockets.adapter.rooms.get(roomName);
      const numClients = clientsInRoom ? clientsInRoom.size : 0;

      if (numClients > 0) {
          const existingClientIds = Array.from(clientsInRoom);
          socket.emit('existing-peers', existingClientIds);
      }

      socket.join(roomName);

      socket.to(roomName).emit("user-joined", socket.id);
    });

    socket.on("signal", (toId, message) => {
      io.to(toId).emit("signal", socket.id, message);
    });

    socket.on("chat-message", async ({ data, sender }) => {
      // ✅ SIMPLIFIED: Easily find the room the user is in
      const room = Array.from(socket.rooms)[1]; // The first room is the socket's own ID

      if (room) {
        const labels = await predictToxicity(data);
        const isToxic = Object.values(labels).some((v) => v === true);

        const messagePayload = {
          sender,
          data,
          blurred: isToxic,
          labels: Object.keys(labels).filter(k => labels[k]),
          "socket-id-sender": socket.id,
        };

        // ✅ SIMPLIFIED: Broadcast efficiently to the room
        io.to(room).emit("chat-message", messagePayload);
      }
    });

    // ✅ SIMPLIFIED: Disconnect logic is now trivial
    socket.on("disconnect", () => {
      console.log("USER DISCONNECTED:", socket.id);
      // Notify any rooms the user was in that they've left
      socket.rooms.forEach(room => {
        if (room !== socket.id) { // Don't emit to the user's own room ID
          io.to(room).emit('user-left', socket.id);
        }
      });
    });
  });

  return io;
};