import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate API call
    try {
      // For demo purposes, check for specific credentials
      // In a real app, you would make an API call here
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let userInfo;
      
      // Check for admin credentials
      if (email === 'admin@example.com' && password === 'admin123') {
        userInfo = {
          id: 'admin-1',
          name: 'Admin User',
          email: email,
          role: 'admin'
        };
      }
      // Check for regular user credentials
      else if (email === 'user@example.com' && password === 'user123') {
        userInfo = {
          id: 'user-1',
          name: 'Regular User',
          email: email,
          role: 'user'
        };
      }
      // Check for demo credentials
      else if (email === 'demo@example.com' && password === 'demo123') {
        userInfo = {
          id: 'demo-1',
          name: 'Demo User',
          email: email,
          role: 'user'
        };
      }
      // For any other credentials, create a regular user
      else {
        userInfo = {
          id: 'user-' + Date.now(),
          name: email.split('@')[0], // Use email prefix as name for demo
          email: email,
          role: 'user'
        };
      }
      
      // Use the auth context to login
      login(userInfo);
      
      // Redirect to dashboard
      navigate('/');
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail('demo@example.com');
    setPassword('demo123');
  };

  const handleAdminLogin = () => {
    setEmail('admin@example.com');
    setPassword('admin123');
  };

  const handleUserLogin = () => {
    setEmail('user@example.com');
    setPassword('user123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mb-4">
            <LogIn className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your Aura Seat Navigator account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
            
            <div className="grid grid-cols-1 gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleAdminLogin}
                disabled={isLoading}
              >
                Login as Admin
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleUserLogin}
                disabled={isLoading}
              >
                Login as User
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleDemoLogin}
                disabled={isLoading}
              >
                Use Demo Credentials
              </Button>
            </div>
          </form>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <div className="space-y-1">
              <p><strong>Admin:</strong> admin@example.com / admin123</p>
              <p><strong>User:</strong> user@example.com / user123</p>
              <p><strong>Demo:</strong> demo@example.com / demo123</p>
            </div>
            <p className="mt-2">
              Don't have an account?{' '}
              <Button variant="link" className="p-0 h-auto">
                Contact your administrator
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login; 