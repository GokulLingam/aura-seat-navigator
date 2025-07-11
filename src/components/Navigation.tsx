import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Calendar, 
  MapPin, 
  Settings, 
  User, 
  Bell,
  Menu,
  X
} from 'lucide-react';

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navigationItems = [
    { path: '/', label: 'Dashboard', icon: Building2 },
    { path: '/floor-plan', label: 'Floor Plan', icon: MapPin },
    { path: '/resources', label: 'Resources', icon: Calendar },
  ];

  const isActivePath = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center justify-between px-6 py-4 bg-background border-b border-border">
        <div className="flex items-center space-x-8">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-golden rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="text-xl font-bold">WorkSpace</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.path);
              
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-4 h-4" />
            <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-accent text-accent-foreground">
              3
            </Badge>
          </Button>

          {/* Settings */}
          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4" />
          </Button>

          {/* User Profile */}
          <Button variant="outline" size="sm" className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>John Doe</span>
          </Button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-golden rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="text-lg font-bold">WorkSpace</span>
          </Link>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="px-4 py-3 border-t border-border bg-muted/30">
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActivePath(item.path);
                
                return (
                  <Link 
                    key={item.path} 
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button
                      variant={isActive ? 'default' : 'ghost'}
                      size="sm"
                      className="w-full justify-start space-x-2"
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Button>
                  </Link>
                );
              })}
              
              <div className="pt-2 border-t border-border mt-3">
                <Button variant="ghost" size="sm" className="w-full justify-start space-x-2">
                  <Bell className="w-4 h-4" />
                  <span>Notifications</span>
                  <Badge className="ml-auto bg-accent text-accent-foreground">3</Badge>
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start space-x-2">
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navigation;