"use client";
import { useState } from 'react';
import Display from './components/Display';

export default function Home() {
  const [username, setUsername] = useState('');
  const [submittedUsername, setSubmittedUsername] = useState<string | null>(null);
  const [inputError, setInputError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setInputError('');
    
    if (!username.trim()) {
      setInputError('Please enter a GitHub username');
      setIsSubmitting(false);
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;
    if (!usernameRegex.test(username)) {
      setInputError('Please enter a valid GitHub username');
      setIsSubmitting(false);
      return;
    }

    // Small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    setSubmittedUsername(username);
    setIsSubmitting(false);
  };

  const handleReset = () => {
    setSubmittedUsername(null);
    setUsername('');
    setInputError('');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-slate-800 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {!submittedUsername ? (
          <div className="flex flex-col items-center justify-center min-h-[80vh] animate-fade-in">
            <div className="text-center max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-violet-400 to-fuchsia-500 text-transparent bg-clip-text">
                GitRecap
              </h1>
              <p className="text-gray-400 mb-8 text-lg">
                Discover your coding journey with personalized GitHub analytics
              </p>
              
              <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        setInputError('');
                      }}
                      placeholder="Enter GitHub username"
                      className={`w-full px-4 py-3 rounded-lg bg-slate-800/50 border ${
                        inputError ? 'border-red-500' : 'border-white/10'
                      } text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all`}
                      aria-label="GitHub username"
                      disabled={isSubmitting}
                    />
                  </div>
                  {inputError && (
                    <p className="text-red-400 text-sm flex items-center">
                      <svg 
                        className="w-4 h-4 mr-1" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                        />
                      </svg>
                      {inputError}
                    </p>
                  )}
                </div>
                
                <button
                  type="submit"
                  className="w-full px-4 py-3 bg-violet-500 hover:bg-violet-600 text-white rounded-lg transition-colors flex items-center justify-center space-x-2 group disabled:opacity-70"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span>Processing...</span>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </>
                  ) : (
                    <>
                      <span>Generate Recap</span>
                      <svg 
                        className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M13 7l5 5m0 0l-5 5m5-5H6" 
                        />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            <button
              onClick={handleReset}
              className="mb-8 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors flex items-center space-x-2 group"
            >
              <svg 
                className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M10 19l-7-7m0 0l7-7m-7 7h18" 
                />
              </svg>
              <span>Back</span>
            </button>
            <Display username={submittedUsername} />
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </main>
  );
}
