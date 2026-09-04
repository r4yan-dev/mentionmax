import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#F4FAF8", color: "#073B3A" }}>
        Chargement...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/connexion" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/connexion" element={<Auth />} />
          <Route
            path="/accueil"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
