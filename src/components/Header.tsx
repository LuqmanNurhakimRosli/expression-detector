// src/components/Header.tsx

import { Link } from "react-router-dom";

function Header() {
  return (
    <header className="bg-white shadow-md fixed w-full z-50 top-0">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <img src="/your-logo.png" alt="FeynmentAI Logo" className="h-10 w-10" />
          <span className="font-bold text-xl text-purple-800">FeynmentAI</span>
        </Link>

        {/* Navigation */}
        <nav className="flex space-x-6">
          <Link to="/features" className="text-gray-700 hover:text-purple-800 font-medium transition">
            Features
          </Link>
          {/* <Link to="/about" className="text-gray-700 hover:text-purple-800 font-medium transition">
            About
          </Link>
          <Link to="/contact" className="text-gray-700 hover:text-purple-800 font-medium transition">
            Contact
          </Link> */}
        </nav>
      </div>
    </header>
  );
}

export default Header;
