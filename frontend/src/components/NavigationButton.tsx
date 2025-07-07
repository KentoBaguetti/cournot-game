import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "./Button";
import { useSocket, leaveGame } from "../socket";

interface NavigationButtonProps {
  type: "back" | "home";
  withConfirmation?: boolean;
  confirmationMessage?: string;
  navigateLocation?: string;
  variant?: "primary" | "secondary" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
  roomId?: string;
  leaveGameOnNavigate?: boolean;
}

export const NavigationButton: React.FC<NavigationButtonProps> = ({
  type,
  withConfirmation = false,
  confirmationMessage = "Are you sure you want to navigate away from this page?",
  navigateLocation = "/",
  variant = "secondary",
  size = "sm",
  className = "",
  roomId,
  leaveGameOnNavigate = false,
}) => {
  const navigate = useNavigate();
  const socket = useSocket();

  const handleNavigation = () => {
    if (withConfirmation) {
      const confirmed = window.confirm(confirmationMessage);
      if (!confirmed) return;
    }

    if (leaveGameOnNavigate && roomId) {
      leaveGame(socket, roomId);
    }

    if (type === "back") {
      navigate(-1);
    } else if (type === "home") {
      navigate(navigateLocation);
    }
  };

  return (
    <Button
      onClick={handleNavigation}
      variant={variant}
      size={size}
      className={`flex items-center justify-center ${className}`}
    >
      {type === "back" ? (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back
        </>
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"
              clipRule="evenodd"
            />
          </svg>
          Home
        </>
      )}
    </Button>
  );
};

export default NavigationButton;
