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

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${config.apiUrl}/auth/checkAuth`, {
          withCredentials: true,
        });
        setAuthenticated(response.data.authenticated);
      } catch (error) {
        console.error("Error checking authentication:", error);
        alert("Your session has expired. Please login again."); // TODO: this alert runs twice
        navigate("/");
      }
    };

    checkAuth();
  }, []);

  return authenticated ? children : null;
}
