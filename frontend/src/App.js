import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { I18nProvider } from "./contexts/I18nContext";
import { Toaster } from "./components/ui/sonner";
import AuthPage from "./pages/AuthPage";
import CreatorDashboard from "./pages/CreatorDashboard";
import CreatorVideos from "./pages/CreatorVideos";
import CreatorProfile from "./pages/CreatorProfile";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCreators from "./pages/AdminCreators";
import AdminCreatorDetail from "./pages/AdminCreatorDetail";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#09090b' }}>
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />;
  }

  return children;
};

const AuthRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#09090b' }}>
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <I18nProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<AuthRoute><AuthPage /></AuthRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute requiredRole="creator"><CreatorDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/videos" element={<ProtectedRoute requiredRole="creator"><CreatorVideos /></ProtectedRoute>} />
            <Route path="/dashboard/accounts" element={<ProtectedRoute requiredRole="creator"><CreatorProfile /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/creators" element={<ProtectedRoute requiredRole="admin"><AdminCreators /></ProtectedRoute>} />
            <Route path="/admin/creator/:creatorId" element={<ProtectedRoute requiredRole="admin"><AdminCreatorDetail /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster position="bottom-right" theme="dark" />
        </AuthProvider>
      </I18nProvider>
    </BrowserRouter>
  );
}

export default App;
