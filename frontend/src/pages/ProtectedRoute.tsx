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
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${config.apiUrl}/auth/checkAuth`, {
          withCredentials: true,
        });
        setAuthenticated(response.data.authenticated);
      } catch (error) {
        console.log("Error checking authentication:", error);
        setAuthenticated(false);
      } finally {
        setHasChecked(true);
      }
    };

    checkAuth();
  }, [navigate]);

  if (!hasChecked) {
    return <div>Loading...</div>;
  }

  if (authenticated === false) {
    alert("Your session has expired. Please login again.");
    navigate("/");
  }

  return authenticated ? children : null;
}
