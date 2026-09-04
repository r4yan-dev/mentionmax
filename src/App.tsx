import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AccountProvider } from "./context/AccountContext";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";
import Exercises from "./pages/Exercises";
import Exams from "./pages/Exams";
import ExamReader from "./pages/ExamReader";
import AiStudio from "./pages/AiStudio";
import Subjects from "./pages/Subjects";
import Progression from "./pages/Progression";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import AuthenticatedShell from "./components/AuthenticatedShell";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loading">Chargement...</div>;
  if (!user) return <Navigate to="/connexion" replace />;
  return <AccountProvider>{children}</AccountProvider>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/connexion" element={<Auth />} />
          <Route element={<ProtectedRoute><AuthenticatedShell /></ProtectedRoute>}>
            <Route path="/accueil" element={<Dashboard />} />
            <Route path="/matieres" element={<Subjects />} />
            <Route path="/exercices" element={<Exercises />} />
            <Route path="/exercices/:exerciseId" element={<Exercises />} />
            <Route path="/examens" element={<Exams />} />
            <Route path="/examens/:examId" element={<ExamReader />} />
            <Route path="/ai-studio" element={<AiStudio />} />
            <Route path="/progression" element={<Progression />} />
            <Route path="/classement" element={<Leaderboard />} />
            <Route path="/profil" element={<Profile />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
