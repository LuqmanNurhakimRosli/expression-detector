// src/pages/Home.tsx

import React from "react";
import { Link } from "react-router-dom"; // Because normal React uses react-router-dom
import Logo from "../assets/feynment-logo.png"; // Adjust based on your folder
import Header from "../components/Header";

const Home: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-100 via-blue-50 to-emerald-50">
      {/* Header */}
      <header className="bg-white shadow-md py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/logo192.png" alt="FeynmentAI Logo" className="h-8 w-8" />
          <span className="text-2xl font-bold text-emerald-600">FeynmentAI</span>
        </div>
        <nav className="flex gap-6 text-lg font-medium">
          <Link to="/features" className="text-blue-700 hover:text-emerald-600 transition">Features</Link>
          {/* <Link to="/about" className="text-blue-700 hover:text-emerald-600 transition">About</Link>
          <Link to="/contact" className="text-blue-700 hover:text-emerald-600 transition">Contact</Link> */}
          <Link to="/login" className="ml-4 px-4 py-2 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 transition shadow">Login</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-12">
        <h1 className="text-5xl md:text-6xl font-extrabold text-blue-900 mb-6 drop-shadow-lg">
          Welcome to <span className="text-emerald-600">FeynmentAI</span>
        </h1>
        <p className="text-xl md:text-2xl text-blue-800 mb-8 max-w-2xl mx-auto">
          Your all-in-one student companion for learning, summarizing, and testing your knowledge from lectures, PDFs, and audio notes. Fast, friendly, and powered by AI.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link to="/features" className="px-8 py-4 bg-emerald-500 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-emerald-600 transition">
            Try Features
          </Link>
          <Link to="/login" className="px-8 py-4 bg-blue-500 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-blue-600 transition">
            Login
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-8 py-6 px-4 text-center text-blue-700 text-sm">
        <div className="mb-2">
          &copy; {new Date().getFullYear()} BudakPintar. All rights reserved.
        </div>
        <div className="flex justify-center gap-4">
          <Link to="/about" className="hover:underline">About</Link>
          <Link to="/contact" className="hover:underline">Contact</Link>
          <a href="https://github.com/your-repo" target="_blank" rel="noopener noreferrer" className="hover:underline">GitHub</a>
        </div>
      </footer>
    </div>
  );
};

export default Home;
