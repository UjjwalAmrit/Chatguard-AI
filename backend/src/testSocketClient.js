// backend/src/testSocketClient.js

import { io } from "socket.io-client";

// Replace with your backend's actual port if it's not 8000
const SERVER_URL = "http://localhost:8000";
const socket = io(SERVER_URL);

socket.on("connect", () => {
  console.log(`✅ Connected to backend with socket ID: ${socket.id}`);

  // Join a test room
  socket.emit("join-call", "test-room");
  console.log("-> Sent 'join-call' to room 'test-room'");

  // --- We will send two messages to test the ML model ---

  // 1. A non-toxic message
  const nonToxicMessage = { data: 'you are a wonderful person', sender: 'Tester' };
  socket.emit('chat-message', nonToxicMessage);
  console.log("-> Sent non-toxic message:", nonToxicMessage.data);

  // 2. A toxic message
  const toxicMessage = { data: 'i hate you so much', sender: 'Tester' };
  socket.emit('chat-message', toxicMessage);
  console.log("-> Sent toxic message:", toxicMessage.data);
});

// Listen for the processed message coming back from the server
socket.on("chat-message", (payload) => {
  console.log("\n✅ Received Processed Message from Server:");
  console.log(payload);
  console.log("------------------------------------------");
});

socket.on("disconnect", () => {
  console.log("Disconnected from backend.");
});