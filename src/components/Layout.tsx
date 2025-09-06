import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Home, 
  MessageSquare, 
  TrendingUp, 
  BarChart3, 
  Info,
  LogOut,
  User,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 font-bold text-xl">
              <MessageSquare className="h-6 w-6 text-primary" />
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Whisper Wall
              </span>
              <span className="text-xs text-muted-foreground ml-2">Beta</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/"
                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                  isActive('/') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Home className="h-4 w-4" />
                Home
              </Link>
              <Link
                to="/wall"
                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                  isActive('/wall') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                Wall
              </Link>
              <Link
                to="/trending"
                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                  isActive('/trending') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                Trending
              </Link>
              <Link
                to="/analytics"
                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                  isActive('/analytics') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                Analytics
              </Link>
              <Link
                to="/about"
                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                  isActive('/about') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Info className="h-4 w-4" />
                About
              </Link>
            </nav>

            {/* User Actions */}
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <Button
                    onClick={() => navigate('/create')}
                    size="sm"
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create Whisper
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/account')}
                  >
                    <User className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </>
              ) : (
                <Button onClick={() => navigate('/auth')}>
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10">
        {children}
      </main>
    </div>
  );
}