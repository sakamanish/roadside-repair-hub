
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { User, Wrench, LogOut, Map, Search, Home } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  
  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out successfully",
      description: "You've been logged out of your account."
    });
  };
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="rounded-full bg-bb-orange p-2">
              <Wrench className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-bb-blue">Breakdown Buddy</span>
          </Link>
          
          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <>
                <span className="hidden sm:block text-sm text-muted-foreground">
                  {user?.role === 'mechanic' ? "Mechanic" : "Customer"}: {user?.name}
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" /> Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm">Login</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Register</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>
      
      {/* Mobile navigation */}
      {isAuthenticated && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-40">
          <div className="flex justify-around items-center h-16">
            <Link to="/" className={`flex flex-col items-center justify-center p-2 ${isActive('/') ? 'text-bb-blue' : 'text-gray-500'}`}>
              <Home className="h-5 w-5" />
              <span className="text-xs mt-1">Home</span>
            </Link>
            
            {user?.role === 'customer' ? (
              <>
                <Link to="/search" className={`flex flex-col items-center justify-center p-2 ${isActive('/search') ? 'text-bb-blue' : 'text-gray-500'}`}>
                  <Search className="h-5 w-5" />
                  <span className="text-xs mt-1">Find Help</span>
                </Link>
                <Link to="/map" className={`flex flex-col items-center justify-center p-2 ${isActive('/map') ? 'text-bb-blue' : 'text-gray-500'}`}>
                  <Map className="h-5 w-5" />
                  <span className="text-xs mt-1">Map</span>
                </Link>
              </>
            ) : (
              <Link to="/profile" className={`flex flex-col items-center justify-center p-2 ${isActive('/profile') ? 'text-bb-blue' : 'text-gray-500'}`}>
                <User className="h-5 w-5" />
                <span className="text-xs mt-1">Profile</span>
              </Link>
            )}
          </div>
        </nav>
      )}
      
      {/* Footer */}
      <footer className="bg-gray-100 py-6 border-t">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Breakdown Buddy. All rights reserved.</p>
            <p className="mt-1">Connecting vehicle owners with mechanics since 2023.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
