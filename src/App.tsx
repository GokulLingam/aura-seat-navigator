import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import DashboardPage from "@/pages/DashboardPage";
import FloorPlanPage from "@/pages/FloorPlanPage";
import ResourcesPage from "@/pages/ResourcesPage";
import ApiDebugPage from "@/pages/ApiDebugPage";
import NotFound from "@/pages/NotFound";
import LoginForm from "@/components/LoginForm";
import UserManagement from "@/components/UserManagement";

const queryClient = new QueryClient();



// Login wrapper with navigation
const LoginWrapper = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  console.log('LoginWrapper rendered:', { user });
  
  // If already logged in, redirect to home
  if (user) {
    console.log('User already logged in, redirecting to home');
    return <Navigate to="/" replace />;
  }
  
  return (
    <LoginForm 
      onSuccess={() => {
        console.log('Login successful, navigating to home');
        navigate('/');
      }}
    />
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  console.log('ProtectedRoute check:', { user, isLoading });
  
  if (isLoading) {
    return (
      <div style={{ padding: '20px', backgroundColor: 'yellow' }}>
        <h1>Loading...</h1>
      </div>
    );
  }
  
  if (!user) {
    console.log('No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  console.log('User authenticated, rendering children');
  return <>{children}</>;
};

// Main App Layout
const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  
  console.log('AppLayout rendered:', { user });
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <main className="p-6">
        {children}
      </main>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginWrapper />} />
                
                {/* Protected Routes */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <AppLayout>
                      <DashboardPage />
                    </AppLayout>
                  </ProtectedRoute>
                } />
                
                <Route path="/floor-plan" element={
                  <ProtectedRoute>
                    <AppLayout>
                      <FloorPlanPage />
                    </AppLayout>
                  </ProtectedRoute>
                } />
                
                <Route path="/resources" element={
                  <ProtectedRoute>
                    <AppLayout>
                      <ResourcesPage />
                    </AppLayout>
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/users" element={
                  <ProtectedRoute>
                    <AppLayout>
                      <UserManagement />
                    </AppLayout>
                  </ProtectedRoute>
                } />
                
                <Route path="/api-debug" element={<ApiDebugPage />} />
                
                {/* Catch all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
