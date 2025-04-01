
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Submission } from '../types';
import { submissionsApi } from '../api/apiService';
import { useAuth } from './AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface SubmissionContextType {
  submissions: Submission[];
  userSubmissions: Submission[];
  loading: boolean;
  error: string | null;
  createSubmission: (submission: Partial<Submission>) => Promise<Submission>;
  updateSubmission: (id: string, updates: Partial<Submission>) => Promise<Submission>;
  submitForReview: (id: string) => Promise<Submission>;
  getSubmissionById: (id: string) => Submission | undefined;
  fetchSubmissions: () => Promise<void>;
}

const SubmissionContext = createContext<SubmissionContextType | undefined>(undefined);

export const SubmissionProvider = ({ children }: { children: ReactNode }) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Filtered submissions based on user role
  const userSubmissions = user ? submissions.filter(submission => {
    if (user.role === 'admin' || user.role === 'editor') {
      return true; // Admins and editors see all submissions
    } else if (user.role === 'reviewer') {
      return submission.reviewers?.includes(user.id);
    } else if (user.role === 'author') {
      return submission.correspondingAuthor === user.id;
    } else {
      return submission.status === 'published'; // Readers only see published
    }
  }) : [];

  useEffect(() => {
    fetchSubmissions();
  }, [user]);

  const fetchSubmissions = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    
    try {
      let fetchedSubmissions: Submission[];
      
      switch (user.role) {
        case 'admin':
        case 'editor':
          fetchedSubmissions = await submissionsApi.getAllSubmissions();
          break;
        case 'reviewer':
          fetchedSubmissions = await submissionsApi.getReviewerSubmissions(user.id);
          break;
        case 'author':
          fetchedSubmissions = await submissionsApi.getSubmissionsByAuthor(user.id);
          break;
        case 'reader':
          fetchedSubmissions = await submissionsApi.getSubmissionsByStatus('published');
          break;
        default:
          fetchedSubmissions = [];
      }
      
      setSubmissions(fetchedSubmissions);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setError('Failed to fetch submissions. Please try again later.');
      toast({
        title: 'Error',
        description: 'Failed to fetch submissions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getSubmissionById = (id: string) => {
    return submissions.find(sub => sub.id === id);
  };

  const createSubmission = async (submission: Partial<Submission>) => {
    try {
      if (!user) throw new Error('User must be logged in to create a submission');
      
      const newSubmission = await submissionsApi.createSubmission({
        ...submission,
        correspondingAuthor: user.id,
      });
      
      setSubmissions(prevSubmissions => [...prevSubmissions, newSubmission]);
      
      toast({
        title: 'Submission created',
        description: 'Your submission has been saved as a draft.',
      });
      
      return newSubmission;
    } catch (err) {
      console.error('Error creating submission:', err);
      toast({
        title: 'Error',
        description: 'Failed to create submission',
        variant: 'destructive',
      });
      throw err;
    }
  };

  const updateSubmission = async (id: string, updates: Partial<Submission>) => {
    try {
      const updatedSubmission = await submissionsApi.updateSubmission(id, updates);
      
      setSubmissions(prevSubmissions => 
        prevSubmissions.map(sub => 
          sub.id === id ? { ...sub, ...updates, updatedDate: new Date().toISOString() } : sub
        )
      );
      
      toast({
        title: 'Submission updated',
        description: 'Your changes have been saved.',
      });
      
      return updatedSubmission;
    } catch (err) {
      console.error('Error updating submission:', err);
      toast({
        title: 'Error',
        description: 'Failed to update submission',
        variant: 'destructive',
      });
      throw err;
    }
  };

  const submitForReview = async (id: string) => {
    try {
      const updatedSubmission = await submissionsApi.submitForReview(id);
      
      setSubmissions(prevSubmissions => 
        prevSubmissions.map(sub => 
          sub.id === id ? { ...sub, status: 'submitted', updatedDate: new Date().toISOString() } : sub
        )
      );
      
      toast({
        title: 'Submission sent for review',
        description: 'Your submission has been successfully sent for review.',
      });
      
      return updatedSubmission;
    } catch (err) {
      console.error('Error submitting for review:', err);
      toast({
        title: 'Error',
        description: 'Failed to submit for review',
        variant: 'destructive',
      });
      throw err;
    }
  };

  return (
    <SubmissionContext.Provider value={{
      submissions,
      userSubmissions,
      loading,
      error,
      createSubmission,
      updateSubmission,
      submitForReview,
      getSubmissionById,
      fetchSubmissions,
    }}>
      {children}
    </SubmissionContext.Provider>
  );
};

export const useSubmissions = () => {
  const context = useContext(SubmissionContext);
  if (context === undefined) {
    throw new Error('useSubmissions must be used within a SubmissionProvider');
  }
  return context;
};
