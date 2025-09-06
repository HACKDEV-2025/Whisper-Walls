import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { useEffect } from "react";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Wall from "./pages/Wall";
import CreateWhisper from "./pages/CreateWhisper";
import WhisperDetail from "./pages/WhisperDetail";
import Account from "./pages/Account";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
}

// Auth Route component (redirects to home if already logged in)
function AuthRoute() {
  const { user, loading } = useAuth();
  
  useEffect(() => {
    if (!loading && user) {
      // Small delay to show success message
      const timer = setTimeout(() => {
        window.location.href = '/';
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user, loading]);
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (user) {
    return <Navigate to="/" replace />;
  }
  
  return <Auth />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<AuthRoute />} />
            <Route path="/wall" element={<Wall />} />
            <Route path="/whisper/:id" element={<WhisperDetail />} />
            <Route path="/create" element={
              <ProtectedRoute>
                <CreateWhisper />
              </ProtectedRoute>
            } />
            <Route path="/trending" element={<Wall />} />
            <Route path="/analytics" element={<Wall />} />
            <Route path="/about" element={<Home />} />
            <Route path="/account" element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
