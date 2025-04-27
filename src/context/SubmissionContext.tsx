import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Submission } from '../types';
import { submissionsApi } from '../api/apiService';
import { useAuth } from './AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Response,GenericResponse } from '@/types/api';
import { CreateJournalRequest, UpdateJournalRequest } from '@/types/journal';
import { AssignReviewerRequest } from '@/types/editor';

interface SubmissionContextType {
  submissions: Submission[];
  userSubmissions: Submission[];
  loading: boolean;
  error: string | null;
  createSubmission: (submission: Partial<CreateJournalRequest>) => Promise<Response>;
  updateSubmission: (updates: Partial<UpdateJournalRequest>) => Promise<Response>;
  submitForReview: (assignReviewer: AssignReviewerRequest) => Promise<Response>;
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
    if (user.role === 'Admin' || user.role === 'Editor') {
      return true; // Admins and editors see all submissions
    } else if (user.role === 'Reviewer') {
      return submission.reviewers?.includes(user.userId);
    } else if (user.role === 'Author') {
      return submission.correspondingAuthor === user.userId;
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
        case 'Admin':
        case 'Editor':
          fetchedSubmissions = await submissionsApi.getAllSubmissions();
          break;
        case 'Reviewer':
          fetchedSubmissions = await submissionsApi.getReviewerSubmissions(user.userId);
          break;
        case 'Author':
          fetchedSubmissions = await submissionsApi.getSubmissionsByAuthor();
          break;
        case 'Reader':
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

  const createSubmission = async (submission: Partial<CreateJournalRequest>) => {
    try {
      if (!user) throw new Error('User must be logged in to create a submission');
      
      const newSubmission = await submissionsApi.createSubmission({
        ...submission
      });
      if(!newSubmission.isSuccess)
      {
        throw new Error(newSubmission.error.errorMessage);
      }
      
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

  const updateSubmission = async ( updates: Partial<UpdateJournalRequest>): Promise<Response> => {  
    try {
      const updatedSubmission = await submissionsApi.updateSubmission(updates);
      
      if(!updatedSubmission.isSuccess)
      {
        throw new Error(updatedSubmission.error.errorMessage);
      }
      
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

  const submitForReview = async (assignReviewer: AssignReviewerRequest): Promise<Response> => {
    try {
      const updatedSubmission = await submissionsApi.submitForReview(assignReviewer);
      
      setSubmissions(prevSubmissions => 
        prevSubmissions.map(sub => 
          sub.id === assignReviewer.journalId ? { ...sub, status: 'submitted', updatedDate: new Date().toISOString() } : sub
        )
      );
      if(!updatedSubmission.isSuccess)
      {
        throw new Error(updatedSubmission.error.errorMessage);
      }
      var response = updatedSubmission as Response;
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
