
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, X, LogOut, User, LayoutDashboard, 
  FileText, ClipboardCheck, Users, Settings, Plus 
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  const isActive = (path: string) => location.pathname === path;

  const NavLink = ({ to, label, icon: Icon }: { to: string, label: string, icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }) => (
    <Link 
      to={to} 
      className={cn(
        "text-sm font-medium transition-colors flex items-center gap-1",
        isActive(to) ? "text-primary" : "hover:text-primary"
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-2">
            {/* JMS Logo */}
            <div className="flex items-center justify-center bg-primary text-primary-foreground rounded h-8 w-8 font-bold">
              JMS
            </div>
            <span className="font-bold text-xl hidden md:inline-block">Journal Manager</span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden ml-auto">
          <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center space-x-6 mx-6 flex-1">
          <Link to="/" className={cn(
            "text-sm font-medium transition-colors",
            isActive('/') ? "text-primary" : "hover:text-primary"
          )}>
            Home
          </Link>
          
          <Link to="/articles" className={cn(
            "text-sm font-medium transition-colors",
            isActive('/articles') ? "text-primary" : "hover:text-primary"
          )}>
            Articles
          </Link>
          
          {user && (
            <>
              {user.role !== 'reader' && (
                <NavLink to="/dashboard" label="Dashboard" icon={LayoutDashboard} />
              )}
              
              {(user.role === 'author' || user.role === 'admin' || user.role === 'editor') && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className={cn(
                      "text-sm font-medium gap-1 p-2 h-8",
                      isActive('/submissions') ? "text-primary" : "hover:text-primary"
                    )}>
                      <FileText className="h-4 w-4" />
                      <span>Submissions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => navigate('/submissions')}>
                      View Submissions
                    </DropdownMenuItem>
                    {user.role === 'author' && (
                      <DropdownMenuItem onClick={() => navigate('/submissions/new')}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Submission
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              
              {(user.role === 'reviewer' || user.role === 'admin' || user.role === 'editor') && (
                <NavLink to="/reviews" label="Reviews" icon={ClipboardCheck} />
              )}
              
              {user.role === 'admin' && (
                <NavLink to="/users" label="Users" icon={Users} />
              )}
              
              {(user.role === 'admin' || user.role === 'editor') && (
                <NavLink to="/settings" label="Settings" icon={Settings} />
              )}
            </>
          )}
        </nav>

        {/* User dropdown menu */}
        <div className="ml-auto hidden md:flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    <p className="text-xs leading-none text-muted-foreground capitalize">{user.role}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" onClick={() => navigate('/login')}>
              Sign In
            </Button>
          )}
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-x-0 top-16 z-50 p-4 bg-background border-b">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/"
                className="flex items-center py-2 text-base font-medium hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/articles"
                className="flex items-center py-2 text-base font-medium hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Articles
              </Link>
              
              {user && (
                <>
                  {user.role !== 'reader' && (
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-1 py-2 text-base font-medium hover:text-primary"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <LayoutDashboard className="h-5 w-5" />
                      Dashboard
                    </Link>
                  )}
                  
                  {(user.role === 'author' || user.role === 'admin' || user.role === 'editor') && (
                    <>
                      <Link
                        to="/submissions"
                        className="flex items-center gap-1 py-2 text-base font-medium hover:text-primary"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <FileText className="h-5 w-5" />
                        My Submissions
                      </Link>
                      {user.role === 'author' && (
                        <Button 
                          variant="outline" 
                          className="flex items-center justify-start gap-1"
                          onClick={() => {
                            navigate('/submissions/new');
                            setMobileMenuOpen(false);
                          }}
                        >
                          <Plus className="h-4 w-4" />
                          New Submission
                        </Button>
                      )}
                    </>
                  )}
                  
                  {(user.role === 'reviewer' || user.role === 'admin' || user.role === 'editor') && (
                    <Link
                      to="/reviews"
                      className="flex items-center gap-1 py-2 text-base font-medium hover:text-primary"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <ClipboardCheck className="h-5 w-5" />
                      Review Queue
                    </Link>
                  )}
                  
                  {user.role === 'admin' && (
                    <Link
                      to="/users"
                      className="flex items-center gap-1 py-2 text-base font-medium hover:text-primary"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Users className="h-5 w-5" />
                      Users
                    </Link>
                  )}
                  
                  {(user.role === 'admin' || user.role === 'editor') && (
                    <Link
                      to="/settings"
                      className="flex items-center gap-1 py-2 text-base font-medium hover:text-primary"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Settings className="h-5 w-5" />
                      Settings
                    </Link>
                  )}
                </>
              )}
              
              {user ? (
                <div className="py-2 border-t border-border">
                  <div className="flex items-center pb-2">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                    </div>
                  </div>
                  <Button variant="ghost" className="w-full justify-start" onClick={() => {
                    navigate('/profile');
                    setMobileMenuOpen(false);
                  }}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </Button>
                </div>
              ) : (
                <Button onClick={() => {
                  navigate('/login');
                  setMobileMenuOpen(false);
                }}>
                  Sign In
                </Button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
