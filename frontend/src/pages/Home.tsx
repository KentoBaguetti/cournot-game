import { useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { Card } from "../components/Card";
import { Button } from "../components/Button";

export default function Home() {
  const navigate = useNavigate();

  const navigateToStudent = () => {
    navigate("/student");
  };

  const navigateToInstructor = () => {
    navigate("/login");
  };

  return (
    <Layout showHeader={true} title="Kaspers Game">
      <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Kaspers Game
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Kaspers game (Built by Kasper, copyrighted by Kasper)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card hover={true} className="flex flex-col items-center text-center">
            <div className="mb-6 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Join as Student
            </h2>
            <p className="text-gray-600 mb-6">
              Enter a game code to join an existing session and participate in
              the simulation
            </p>
            <Button
              onClick={navigateToStudent}
              variant="primary"
              size="lg"
              className="mt-auto"
            >
              Join Game
            </Button>
          </Card>

          <Card hover={true} className="flex flex-col items-center text-center">
            <div className="mb-6 w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Login as Instructor
            </h2>
            <p className="text-gray-600 mb-6">
              Create and manage game sessions, monitor student progress, and
              analyze results
            </p>
            <Button
              onClick={navigateToInstructor}
              variant="secondary"
              size="lg"
              className="mt-auto"
            >
              Instructor Login
            </Button>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
