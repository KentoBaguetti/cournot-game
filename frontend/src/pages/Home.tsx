import React from "react";
import { useNavigate } from "react-router-dom";
import { Users, BookOpen, TrendingUp, Play } from "lucide-react";
import { Layout } from "../components/Layout";
import { Card } from "../components/Card";
import { Button } from "../components/Button";

export default function Home() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <TrendingUp className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Interactive Game
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Platform
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Join exciting multiplayer games or create your own gaming sessions as an instructor.
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card hover className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Student</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Join a game session using a game code provided by your instructor.
            </p>
            <Button
              onClick={() => navigate("/student")}
              variant="success"
              size="lg"
              icon={Play}
              className="w-full"
            >
              Join Game
            </Button>
          </Card>

          <Card hover className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Instructor
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Create and manage game sessions for your students.
            </p>
            <Button
              onClick={() => navigate("/login")}
              variant="primary"
              size="lg"
              icon={BookOpen}
              className="w-full"
            >
              Create Game
            </Button>
          </Card>
        </div>

        {/* Features Section */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">
            Platform Features
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Real-time Gaming
              </h4>
              <p className="text-sm text-gray-600">
                Experience seamless real-time multiplayer gaming
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Multi-room Support
              </h4>
              <p className="text-sm text-gray-600">
                Organize players into manageable game rooms
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Play className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Interactive Learning
              </h4>
              <p className="text-sm text-gray-600">
                Engage with concepts through interactive gameplay
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}