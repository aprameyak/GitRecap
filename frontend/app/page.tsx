"use client";
import react from "react";
import { useState } from "react";
import { useEffect } from "react";
=
export default function Home() {
  const [username, setUsername] = useState(""); 
  return (
    <div>
      <div>
      Github Wrapped
      </div>
      <div>
        <input>
          Enter a username
        </input>
      </div>
      <div>
        <button>
          Submit
        </button>
      </div>
      <div>
        Data will be displayed here
      </div>
    </div>
  );
}
