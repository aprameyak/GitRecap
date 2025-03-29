"use client"
import { useState } from "react";
import Display from "./components/Display";

export default function Home() {
  const [username, setUsername] = useState(""); 
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = () => {
    if (username) {
      setSubmitted(true);
      setError(null); 
    } else {
      setError("Please enter a username");
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Github Wrapped</h1>
        <p>Discover your GitHub activity highlights for the year!</p>
      </div>
      <div className="input-section">
        <input 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          type="text" 
          placeholder="Enter a GitHub username"
          className="input-field"
        />
        {error && <div className="error-message">{error}</div>}
        <button onClick={handleSubmit} className="submit-button">
          Get Wrapped
        </button>
      </div>
      {submitted && <Display username={username} />}
    </div>
  );
}
