export default function ProtectedRoute({ children }) {
  const isLogin = localStorage.getItem("isLogin") === "true";
  const token = localStorage.getItem("token");

  if (!isLogin || !token) {
    return <Navigate to="/" replace />;
  }
  return children;
}