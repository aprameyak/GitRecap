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
    <div className="container">
      <div className="header">
        <h1>Github Wrapped</h1>
      </div>
      <div className="input-section">
        <input 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          type="text" 
          placeholder="Enter a username"
        />
        <button onClick={handleSubmit}>
          Submit
        </button>
      </div>
      {submitted && <Display username={username} />}
    </div>
  );
}
