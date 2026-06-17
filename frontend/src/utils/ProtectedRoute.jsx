import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const ownerData = localStorage.getItem("owner");

  if (!ownerData) {
    return <Navigate to="/login" replace />;
  }

  return children;
}