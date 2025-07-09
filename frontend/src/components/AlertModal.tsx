import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AlertModal(navigateLocation: string, message: string) {
  const navigate = useNavigate();

  const [navigateLocation, setNavigateLocation] = useState<string>("");

  useEffect(() => {
    if (navigateLocation) {
      setNavigateLocation(navigateLocation);
    }
  }, [navigateLocation]);

  return <div>AlertModal</div>;
}
