import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AccountProvider } from "./context/AccountContext";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";
import Exercises from "./pages/Exercises";
import Exams from "./pages/Exams";
import Tests from "./pages/Tests";
import NationalExams from "./pages/NationalExams";
import ExamReader from "./pages/ExamReader";
import AiStudio from "./pages/AiStudio";
import AIHelp from "./pages/AIHelp";
import Handnotes from "./pages/Handnotes";
import Subjects from "./pages/Subjects";
import Lessons from "./pages/Lessons";
import Progression from "./pages/Progression";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import Preferences from "./pages/Preferences";
import AuthenticatedShell from "./components/AuthenticatedShell";
import "./index.css";

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
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/subjects/:subjectId" element={<Subjects />} />
            <Route path="/lecons/:subjectId" element={<Lessons />} />
            <Route path="/lecons/:subjectId/:lessonId" element={<Lessons />} />
            <Route path="/exercices" element={<Exercises />} />
            <Route path="/exercises" element={<Exercises />} />
            <Route path="/exercices/:exerciseId" element={<Exercises />} />
            <Route path="/examens" element={<Exams />} />
            <Route path="/examens/:examId" element={<ExamReader />} />
            <Route path="/exams" element={<Exams />} />
            <Route path="/tests" element={<Tests />} />
            <Route path="/exams/nationaux" element={<NationalExams />} />
            <Route path="/examens/nationaux" element={<NationalExams />} />
            <Route path="/exams/:examId" element={<ExamReader />} />
            <Route path="/ai-studio" element={<AiStudio />} />
            <Route path="/ai-studio/handnotes" element={<Handnotes />} />
            <Route path="/ai-help" element={<AIHelp />} />
            <Route path="/progression" element={<Progression />} />
            <Route path="/classement" element={<Leaderboard />} />
            <Route path="/profil" element={<Profile />} />
            <Route path="/preferences" element={<Preferences />} />
            <Route path="/preferences/personality" element={<Preferences />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
