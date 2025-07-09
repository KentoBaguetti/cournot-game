// Configuration for the application
const config = {
  // Backend API URL from environment variables
  //apiUrl: import.meta.env.VITE_API_URL || "http://localhost:3001",
  apiUrl:
    import.meta.env.VITE_NODE_ENV === "production"
      ? "https://cuhkgameplatform.online"
      : "http://localhost:3001",
  // Use relative path for API calls when on the same domain
  basePath: import.meta.env.VITE_NODE_ENV === "production" ? "/app/" : "/",
};

export default config;
