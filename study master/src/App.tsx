import React, { useState } from "react";

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gray-100">
      {/* Navbar */}
      <nav className="w-full bg-blue-600 text-white p-4 shadow-md flex justify-between">
        <span className="font-bold text-lg">StudyMaster AI</span>
        <div>
          <button className="px-3 py-1 rounded hover:bg-blue-700">Login</button>
          <button className="ml-2 px-3 py-1 rounded hover:bg-blue-700">Sign Up</button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="text-center mt-20 mb-10">
        <h1 className="text-5xl font-bold text-blue-700 mb-4">Welcome to StudyMaster AI 🚀</h1>
        <p className="text-xl text-gray-700">Your smart study assistant platform</p>
      </header>

      {/* Counter Example */}
      <section className="text-center mb-10">
        <p className="text-lg mb-2">Click the button to increment the counter:</p>
        <button
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          onClick={() => setCount(count + 1)}
        >
          Increment
        </button>
        <p className="mt-2 text-lg font-semibold">Count: {count}</p>
      </section>

      {/* Footer */}
      <footer className="w-full bg-gray-200 p-4 text-center text-gray-600 mt-auto">
        © 2025 StudyMaster AI. All rights reserved.
      </footer>
    </div>
  );
}
