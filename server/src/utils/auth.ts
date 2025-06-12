const generateUniqueId = (): string => {
  let res = "";
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for (let i = 0; i < 16; i++) {
    res += chars[Math.floor(Math.random() * chars.length)];
  }
  return res;
};

export { generateUniqueId };
