"use client";
import { useState } from "react";
import Display from "./components/Display";

export default function Home() {
  const [username, setUsername] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (username) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
            Github Wrapped
          </h1>
          <p className="text-gray-400 text-lg">
            Discover your GitHub journey in style
          </p>
        </div>

        {/* Search Section */}
        <div className="max-w-md mx-auto">
          <div className="backdrop-blur-lg bg-white/10 p-6 rounded-2xl shadow-xl border border-white/20">
            <div className="space-y-4">
              <div className="relative">
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  type="text"
                  placeholder="Enter GitHub username"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-purple-500 
                           text-white placeholder-gray-400 transition-all"
                />
              </div>
              <button
                onClick={handleSubmit}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-500 
                         hover:from-blue-600 hover:to-purple-600 rounded-lg font-medium
                         transform transition-all duration-200 hover:scale-[1.02] 
                         active:scale-[0.98] focus:outline-none focus:ring-2 
                         focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                Generate Wrapped
              </button>
            </div>
          </div>
        </div>

        {/* Display Section */}
        {submitted && (
          <div className="mt-12 backdrop-blur-lg bg-white/5 rounded-2xl p-6 border border-white/10">
            <Display username={username} />
          </div>
        )}
      </div>
    </div>
  );
}
