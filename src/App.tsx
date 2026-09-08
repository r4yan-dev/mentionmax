import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AccountProvider } from "./context/AccountContext";
import { FocusProvider } from "./context/FocusContext";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";
import Exercises from "./pages/Exercises";
import Exams from "./pages/Exams";
import Tests from "./pages/Tests";
import NationalExams from "./pages/NationalExams";
import ExamReader from "./pages/ExamReader";
import AiStudioGenerator from "./pages/AiStudioGenerator";
import AIHelp from "./pages/AIHelp";
import Handnotes from "./pages/Handnotes";
import WritingLab from "./pages/WritingLab";
import Subjects from "./pages/Subjects";
import SubjectsLauncher from "./pages/SubjectsLauncher";
import Lessons from "./pages/Lessons";
import Flashcards from "./pages/Flashcards";
import Focus from "./pages/Focus";
import FocusGroupDetail from "./pages/FocusGroupDetail";
import FocusGroupNew from "./pages/FocusGroupNew";
import FocusGroupJoin from "./pages/FocusGroupJoin";
import { GroupLeaderboard, GroupChat, GroupStats, GroupMembers, GroupSettings } from "./pages/FocusGroupTabs";
import Progression from "./pages/Progression";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import Preferences from "./pages/Preferences";
import Library from "./pages/Library";
import AuthenticatedShell from "./components/AuthenticatedShell";
import "./index.css";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loading">Chargement...</div>;
  if (!user) return <Navigate to="/connexion" replace />;
  return <AccountProvider><FocusProvider>{children}</FocusProvider></AccountProvider>;
}

export default function App() {
  return <BrowserRouter><AuthProvider><Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/connexion" element={<Auth />} />
    <Route element={<ProtectedRoute><AuthenticatedShell /></ProtectedRoute>}>
      <Route path="/accueil" element={<Dashboard />} />
      <Route path="/matieres" element={<SubjectsLauncher />} />
      <Route path="/subjects" element={<SubjectsLauncher />} />
      <Route path="/subjects/:subjectId" element={<Subjects />} />
      <Route path="/flashcards" element={<Flashcards />} />
      <Route path="/lecons/:subjectId" element={<Lessons />} />
      <Route path="/lecons/:subjectId/:lessonId" element={<Lessons />} />
      <Route path="/exercices" element={<Exercises />} />
      <Route path="/exercises" element={<Exercises />} />
      <Route path="/exercices/:exerciseId" element={<Exercises />} />
      <Route path="/focus" element={<Focus />} />
      <Route path="/focus/groups/new" element={<FocusGroupNew />} />
      <Route path="/focus/groups/join" element={<FocusGroupJoin />} />
      <Route path="/focus/groups/:groupId" element={<FocusGroupDetail />}>
        <Route index element={<GroupLeaderboard />} />
        <Route path="chat" element={<GroupChat />} />
        <Route path="stats" element={<GroupStats />} />
        <Route path="members" element={<GroupMembers />} />
        <Route path="settings" element={<GroupSettings />} />
      </Route>
      <Route path="/examens" element={<Exams />} />
      <Route path="/examens/:examId" element={<ExamReader />} />
      <Route path="/examens/nationaux" element={<NationalExams />} />
      <Route path="/exams" element={<Exams />} />
      <Route path="/tests" element={<Tests />} />
      <Route path="/exams/nationaux" element={<NationalExams />} />
      <Route path="/exams/:examId" element={<ExamReader />} />
      <Route path="/ai-studio" element={<AiStudioGenerator />} />
      <Route path="/ai-studio/generate" element={<AiStudioGenerator />} />
      <Route path="/ai-studio/handnotes" element={<Handnotes />} />
      <Route path="/ai-studio/writing" element={<WritingLab />} />
      <Route path="/ai-help" element={<AIHelp />} />
      <Route path="/progression" element={<Progression />} />
      <Route path="/classement" element={<Leaderboard />} />
      <Route path="/bibliotheque" element={<Library />} />
      <Route path="/bibliotheque/:itemId" element={<Library />} />
      <Route path="/profil" element={<Profile />} />
      <Route path="/preferences" element={<Preferences />} />
      <Route path="/preferences/personality" element={<Preferences />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></AuthProvider></BrowserRouter>;
}
