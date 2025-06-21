import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, ArrowRight, Home } from "lucide-react";
import { Layout } from "../../components/Layout";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import axios from "axios";

export default function InstructorLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Sets the token as a cookie, no response needed so far
      await axios.post(
        "http://localhost:3001/auth/login",
        {
          username: username,
          roomId: "", // roomId is empty when the user logs in
        },
        {
          withCredentials: true,
        }
      );

      navigate("/instructorDashboard");
    } catch (error) {
      console.error("Login error:", error);
      setError("Failed to login. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Instructor Login</h1>
          <p className="text-gray-600">
            Sign in to create and manage game sessions for your students.
          </p>
        </div>

        <Card>
          <form onSubmit={handleLogin} className="space-y-6">
            <Input
              label="Username"
              value={username}
              onChange={setUsername}
              placeholder="Enter your username"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Enter your password"
            />

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-3">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                icon={ArrowRight}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>

              <Button
                onClick={() => navigate('/')}
                variant="secondary"
                size="md"
                icon={Home}
                className="w-full"
              >
                Back to Home
              </Button>
            </div>
          </form>
        </Card>

        <div className="mt-8 text-center">
          <div className="bg-purple-50 rounded-2xl p-6">
            <h3 className="font-semibold text-gray-900 mb-2">First Time?</h3>
            <p className="text-sm text-gray-600">
              Contact your administrator to get instructor access credentials.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}