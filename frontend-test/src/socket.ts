import { io } from "socket.io-client";

const generateUniqueId = (): string => {
  let res = "";
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for (let i = 0; i < 16; i++) {
    res += chars[Math.floor(Math.random() * chars.length)];
  }
  return res;
};

// check if userId exists
let userId = localStorage.getItem("userId");
if (!userId) {
  userId = generateUniqueId();
  localStorage.setItem("userId", userId);
}

const socket = io("http://localhost:3001", {
  auth: {
    userId,
  },
});

export default socket;
