import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ProtectedRoute() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    toast.warn("You must be logged in to access this page!", { position: "top-center", autoClose: 2000 });
    return <Navigate to="/login" state={{ from: location }} />;
  }

  return <Outlet />;
}
