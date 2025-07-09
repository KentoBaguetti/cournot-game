import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../config";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Checking authentication...");
        // First try with cookies
        const response = await axios.get(`${config.apiUrl}/auth/checkAuth`, {
          withCredentials: true,
        });

        console.log("Auth check response:", response.data);
        setAuthenticated(response.data.authenticated);
        setCheckingAuth(false);
      } catch (error) {
        console.error("Auth check failed:", error);

        // Try to use localStorage token as fallback
        const localToken = localStorage.getItem("game_auth_token");

        if (localToken) {
          console.log("Found token in localStorage, trying to use it...");
          try {
            // Try to validate the token
            const response = await axios.post(
              `${config.apiUrl}/auth/validateToken`,
              { token: localToken },
              { withCredentials: true }
            );

            if (response.data.authenticated) {
              console.log("Local token is valid");
              setAuthenticated(true);
              setCheckingAuth(false);
              return;
            }
          } catch (tokenError) {
            console.error("Local token validation failed:", tokenError);
          }
        }

        // If we get here, authentication has failed
        console.log("Authentication failed, redirecting to home");
        setAuthenticated(false);
        setCheckingAuth(false);
        navigate("/", {
          state: { authError: "Your session has expired. Please login again." },
        });
      }
    };

    checkAuth();
  }, [navigate]);

  // Show nothing while checking authentication
  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return authenticated ? children : null;
}
