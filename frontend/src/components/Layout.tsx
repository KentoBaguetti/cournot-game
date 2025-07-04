import React from "react";
import NavigationButton from "./NavigationButton";

interface LayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  title?: string;
  navigateLocation?: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
  withConfirmation?: boolean;
  confirmationMessage?: string;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  showHeader = true,
  title = "Cournot Game",
  navigateLocation = "/",
  showBackButton = true,
  showHomeButton = true,
  withConfirmation = false,
  confirmationMessage = "Are you sure you want to navigate away from this page?",
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {showHeader && (
        <header className="bg-white/80 border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center cursor-pointer">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-gray-900">{title}</h1>
              </div>
              <div className="flex items-center space-x-2">
                {showBackButton && (
                  <NavigationButton
                    type="back"
                    withConfirmation={withConfirmation}
                    confirmationMessage={confirmationMessage}
                  />
                )}
                {showHomeButton && (
                  <NavigationButton
                    type="home"
                    withConfirmation={withConfirmation}
                    confirmationMessage={confirmationMessage}
                    navigateLocation={navigateLocation}
                  />
                )}
              </div>
            </div>
          </div>
        </header>
      )}
      <main className="relative">{children}</main>
    </div>
  );
};

export default Layout;
