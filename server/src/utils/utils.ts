// generate a random 6 character join code for the games/rooms
export function generateJoinCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// this function will parse roomIds that contain a breakout room tail and return just the main room id
export function parseRoomId(roomId: string): string {
  const mainRoomId = roomId.split("_")[0];
  return mainRoomId
}
