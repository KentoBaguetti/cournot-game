// Configuration for the application
const config = {
  // Backend API URL from environment variables
  //apiUrl: import.meta.env.VITE_API_URL || "http://localhost:3001",
  apiUrl:
    import.meta.env.VITE_NODE_ENV === "production"
      ? "https://cuhkgameplatform.online"
      : "http://localhost:3001",
};

export default config;
