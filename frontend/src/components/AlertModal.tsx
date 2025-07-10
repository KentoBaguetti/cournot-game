import { useNavigate } from "react-router-dom";
import { Button } from "./Button";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  navigateLocation: string;
  message: string;
}

export function AlertModal({
  isOpen,
  onClose,
  navigateLocation,
  message,
}: AlertModalProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleConfirm = () => {
    navigate(navigateLocation);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-blue-300 hover:text-blue-100 transition-colors z-10"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Header */}
        <div className="bg-blue-700 text-white p-6">
          <h2 className="text-2xl font-bold">Alert</h2>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-700">{message}</p>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 flex justify-end">
          <Button
            onClick={handleConfirm}
            variant="primary"
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
}
