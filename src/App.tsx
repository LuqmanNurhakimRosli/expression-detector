import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from './auth/ProtectedRoute';
import MainLayout from './layout/MainLayout';
import Home from './pages/Home';
import Login from './auth/Login';
import Features from './pages/Features';
import Note from './pages/Note';
import Quizzez from './pages/Quizzez';
import Flashcard from './pages/Flashcard';
import NotFound from './pages/NotFound';
import { Analytics } from "@vercel/analytics/react"

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer />
        <Routes>
          {/* Wrap everything inside MainLayout to keep navbar and header */}
          <Route element={<MainLayout />}>
            {/* Public Routes */}
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route path="features" element={<ProtectedRoute />}>
              <Route index element={<Features />} />
              <Route path=":id" element={<Features />}>
                <Route path="note" element={<Note />} />
                <Route path="quizzez" element={<Quizzez />} />
                <Route path="flashcard" element={<Flashcard />} />
              </Route>
            </Route>
            
            {/* 404 Page */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
      <Analytics />
    </AuthProvider>
  );
}

export default App;
