import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Role } from '../types';
import { authApi } from '../api/apiService';
import { useToast } from '@/components/ui/use-toast';
import { CreateAuthorRequest } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (createAuthorRequest: CreateAuthorRequest) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check for existing session
        const currentUser = await localStorage.getItem('user');
        if (currentUser == null ) {return new Error('No user found');}
        const parsedUser = JSON.parse(currentUser) as User;
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const loggedInUser = await authApi.login(email, password);
      setUser(loggedInUser);
      toast({
        title: 'Login successful',
        description: `Welcome back, ${loggedInUser.fullName}!`,
      });
    } catch (error) {
      console.error('Login failed:', error);
      toast({
        title: 'Login failed',
        description: 'Invalid credentials. Please try again.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (createAuthorRequest: CreateAuthorRequest) => {
    setIsLoading(true);
    try {
      const newUser = await authApi.signup(createAuthorRequest);
      window.location.href = '/login';
    } catch (error) {
      console.error('Signup failed:', error);
      toast({
        title: 'Signup failed',
        description: 'Could not create your account. The email might already be in use.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call the API to clear server-side session/cookies
      await authApi.logout();
      
      // Clear user data from localStorage
      localStorage.removeItem('user');
      
      // Update state
      setUser(null);
      
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Logout Issue',
        description: 'There was a problem during logout, but you have been logged out of this device.',
        variant: 'destructive',
      });
      
      // Ensure user is still logged out locally even if API call fails
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
