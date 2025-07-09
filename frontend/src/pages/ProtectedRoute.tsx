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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Add a small delay to ensure cookies are set
        await new Promise((resolve) => setTimeout(resolve, 300));

        const response = await axios.get(`${config.apiUrl}/auth/checkAuth`, {
          withCredentials: true,
        });
        setAuthenticated(response.data.authenticated);
      } catch (error) {
        console.error("Error checking authentication:", error);
        // Only show alert if we're not in initial loading
        if (!loading) {
          alert("Your session has expired. Please login again.");
        }
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return authenticated ? children : null;
}
