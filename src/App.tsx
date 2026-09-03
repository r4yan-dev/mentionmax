import "./data/mock/missionHeliosPatch";
import Exams from "./pages/Exams";
import Tests from "./pages/Tests";
import NationalExams from "./pages/NationalExams";
import ExamReader from "./pages/ExamReader";
import Subjects from "./pages/Subjects";
import Lessons from "./pages/Lessons";
import Exercises from "./pages/Exercises";
import DesignLab from "./pages/DesignLab";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AccountProvider } from "./context/AccountContext";
import { FocusProvider } from "./context/FocusContext";
import { AppShell } from "./components/layout/AppShell";
import { FocusMode } from "./components/layout/FocusMode";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Focus from "./pages/Focus";
import AIHelp from "./pages/AIHelp";
import Profile from "./pages/Profile";
import Preferences from "./pages/Preferences";
import PersonalityTest from "./pages/PersonalityTest";
import FocusExercise from "./pages/FocusExercise";
import Handnotes from "./pages/Handnotes";
import FocusGroupNew from "./pages/FocusGroupNew";
import FocusGroupJoin from "./pages/FocusGroupJoin";
import FocusGroupDetail from "./pages/FocusGroupDetail";
import { GroupLeaderboard, GroupChat, GroupStats, GroupMembers, GroupSettings } from "./pages/FocusGroupTabs";
import "./styles/foundation.css";

function LoadingScreen() { return <div className="auth-page"><div className="auth-loading">Chargement...</div></div>; }

function ProtectedApp() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/connexion" replace />;
  return (
    <AccountProvider>
      <FocusProvider>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/accueil" element={<Home />} />
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/subjects/:subjectId" element={<Subjects />} />
            <Route path="/lecons" element={<Navigate to="/subjects" replace />} />
            <Route path="/lecons/:subjectId" element={<Lessons />} />
            <Route path="/lecons/:subjectId/:lessonId" element={<Lessons />} />
            <Route path="/exercices" element={<Exercises />} />
            <Route path="/exercices/:exerciseId" element={<FocusExercise />} />
            <Route path="/focus" element={<Focus />} />
            <Route path="/focus/timer" element={<Focus />} />
            <Route path="/exams" element={<Exams />} />
            <Route path="/exams/nationaux" element={<NationalExams />} />
            <Route path="/exams/:examId" element={<ExamReader />} />
            <Route path="/tests" element={<Tests />} />
            <Route path="/tests/nationaux" element={<Navigate to="/exams/nationaux" replace />} />
            <Route path="/ai" element={<Navigate to="/ai-help" replace />} />
            <Route path="/ai-help" element={<AIHelp />} />
            <Route path="/ai-studio/handnotes" element={<Handnotes />} />
            <Route path="/profil" element={<Profile />} />
            <Route path="/profil/:userId" element={<Profile />} />
            <Route path="/preferences" element={<Preferences />} />
            <Route path="/preferences/personality" element={<PersonalityTest />} />
            <Route path="/focus/groups/new" element={<FocusGroupNew />} />
            <Route path="/focus/groups/join" element={<FocusGroupJoin />} />
            <Route path="/focus/groups/:groupId" element={<FocusGroupDetail />}>
              <Route index element={<GroupLeaderboard />} />
              <Route path="chat" element={<GroupChat />} />
              <Route path="stats" element={<GroupStats />} />
              <Route path="members" element={<GroupMembers />} />
              <Route path="settings" element={<GroupSettings />} />
            </Route>
            <Route path="/design-lab" element={<DesignLab />} />
            <Route path="/dashboard" element={<Navigate to="/accueil" replace />} />
            <Route path="/progression" element={<Navigate to="/accueil" replace />} />
            <Route path="/classement" element={<Navigate to="/focus" replace />} />
            <Route path="/ai-studio" element={<Navigate to="/ai-studio/handnotes" replace />} />
          </Route>
        </Routes>
      </FocusProvider>
    </AccountProvider>
  );
}

function ProtectedFocus() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/connexion" replace />;
  return <AccountProvider><FocusProvider><Routes><Route element={<FocusMode />}><Route path="/pratique/:matiere/:chapitre/:exerciseId" element={<FocusExercise />} /></Route></Routes></FocusProvider></AccountProvider>;
}

export default function App() {
  return <AuthProvider><BrowserRouter><Routes><Route path="/" element={<Landing />} /><Route path="/connexion" element={<Auth />} /><Route path="/pratique/:matiere/:chapitre/:exerciseId" element={<ProtectedFocus />} /><Route path="*" element={<ProtectedApp />} /></Routes></BrowserRouter></AuthProvider>;
}
