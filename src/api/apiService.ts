import { ROLES,User, Submission, Review, DashboardStats, Role, PeerReviewType } from '../types';
import { users, submissions, dashboardStats } from './mockData';
import axios from './axiosInstance'
import { CreateCopyEditorRequest, LoginResponse } from '@/types/auth';
import { GenericResponse,Response } from '@/types/api';
import { CreateAuthorRequest,CreateEditorRequest,CreatePublisherRequest,CreateReviewerRequest} from '@/types/auth';
import { User as UserIcon} from 'lucide-react';
import SubmissionCard from '@/components/submissions/SubmissionCard';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { stringify } from 'querystring';
import { sub } from 'date-fns';
import { CreateJournalRequest, UpdateJournalRequest } from '@/types/journal';
import { ReviewJournalRequest, UpdateReviewJournalRequest } from '@/types/reviewer';
import { AssignCopyEditorRequest, AssignReviewerRequest, EditorDecisionInReview } from '@/types/editor';
import { GetAllAuthorsResponse } from '@/types/author';

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Auth API
export const authApi = {
  login: async (email: string, password: string): Promise<User> => {
    try {
      const response = await axios.post<GenericResponse<LoginResponse>>('/Authentication/login', {
        email,
        password,
      });

      if (!response.data.isSuccess) {
        throw new Error('Login failed');
      }

      const loginData = response.data.data;
      const roleFromApi = loginData.roleNames?.[0];

      if (!roleFromApi) {
                  throw new Error('No roles found in the response');
                  }
  // take the first role

      function isValidRole(role: string): role is Role {
        return ROLES.includes(role as Role);
      }

      if (!isValidRole(roleFromApi)) {
        throw new Error(`Invalid role received: ${roleFromApi}`);
      }
      const user: User = {
        userId: loginData.userId,
        fullName: loginData.fullName,
        email: loginData.emailAddress,
        role: roleFromApi,
      };

      localStorage.setItem('user', JSON.stringify(user));

      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  logout: async (): Promise<void> => {
    try {
      // Call the logout API endpoint to clear cookies on the backend
      await axios.post('/Authentication/logout');
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with local logout even if API call fails
    }
  },
  
  getCurrentUser: async (): Promise<User> => {
    const userData = localStorage.getItem("user");
  
    if (!userData) {
      throw new Error("User not found");
    }
  
    const parsedUser = JSON.parse(userData) as User;
  
    if (!parsedUser.role || !ROLES.includes(parsedUser.role)) {
      throw new Error("Invalid or missing user role");
    }
  
    return parsedUser;
  },
  
  signup: async (createAuthorRequest: CreateAuthorRequest): Promise<Response> => {
    try {
        var response = await axios.post(`/Author`, createAuthorRequest);
        if(!response.data.isSuccess){

        throw new Error(response.data.errorMessage);
        }
        return response.data;
      } 
    catch (error) {
      console.error('Signup error:', error); 
      throw error;
    } 
  },
  

  getAuthors: async (): Promise<GenericResponse<GetAllAuthorsResponse[]>> => {
    try {
      const response = await axios.get<GenericResponse<GetAllAuthorsResponse[]>>('/Authors');
      if (!response.data.isSuccess) {
        throw new Error('Failed to fetch authors');
      }
      return response.data;
    } catch (error) {
      console.error('Fetch authors error:', error);
      throw error;
    }
  },


  getAuthorById: async (id: string): Promise<GetAllAuthorsResponse | null> => {
    try {
      const response = await axios.get<GenericResponse<GetAllAuthorsResponse>>(`/Authors/${id}`);
      if (!response.data.isSuccess) {
        throw new Error('Failed to fetch author');
      }
      return response.data.data || null;
    } catch (error) {
      console.error('Fetch author error:', error);
      throw error;
    }
  }
};

// Users API
export const usersApi = {
  getAllUsers: async (): Promise<User[]> => {
    try {
      const response = await axios.get<GenericResponse<User[]>>('/User/all');
      if (!response.data.isSuccess) {
        throw new Error('Failed to fetch users');
      }
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching all users:", error);
      throw error;
    }
  },
  
  getUserById: async (userId: string): Promise<User | undefined> => {
    try {
      const response = await axios.get<GenericResponse<User>>(`/users/${userId}`);
      if (!response.data.isSuccess) {
        throw new Error('Failed to fetch user');
      }
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching user with ID ${userId}:`, error);
      throw error;
    }
  },
  
  getUsersByRole: async (role: string): Promise<User[]> => {
    try {
      // Ensure role is correctly formatted for the API
      const formattedRole = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
      const response = await axios.get<GenericResponse<User[]>>(`/users/by-role/${formattedRole}`);
      if (!response.data.isSuccess) {
        throw new Error(`Failed to fetch users with role: ${formattedRole}`);
      }
      return response.data.data || [];
    } catch (error) {
      console.error(`Error fetching users with role ${role}:`, error);
      throw error;
    }
  },
      
  createAuthor: async (createAuthorRequest: CreateAuthorRequest): Promise<Response> => {
    try {
      const response = await axios.post<Response>(`/${createAuthorRequest.roleName}`, createAuthorRequest);
      if (!response.data.isSuccess) {
        throw new Error('Failed to create author');
      }
      return response.data;
    } catch (error) {
      console.error("Error creating author:", error);
      throw error;
    }
  },
      
  createEditor: async (createEditorRequest: CreateEditorRequest): Promise<Response> => {
    try {
      const response = await axios.post<Response>(`/${createEditorRequest.roleName}`, createEditorRequest);
      if (!response.data.isSuccess) {
        throw new Error('Failed to create editor');
      }
      return response.data;
    } catch (error) {
      console.error("Error creating editor:", error);
      throw error;
    }
  },
      
  createPublisher: async (createPublisherRequest: CreatePublisherRequest): Promise<Response> => {
    try {
      const response = await axios.post<Response>(`/${createPublisherRequest.roleName}`, createPublisherRequest);
      if (!response.data.isSuccess) {
        throw new Error('Failed to create publisher');
      }
      return response.data;
    } catch (error) {
      console.error("Error creating publisher:", error);
      throw error;
    }
  },
      
  createReviewer: async (createReviewerRequest: CreateReviewerRequest): Promise<Response> => {
    try {
      const response = await axios.post<Response>(`/${createReviewerRequest.roleName}`, createReviewerRequest);
      if (!response.data.isSuccess) {
        throw new Error('Failed to create reviewer');
      }
      return response.data;
    } catch (error) {
      console.error("Error creating reviewer:", error);
      throw error;
    }
  },

  createCopyEditor: async (createCopyEditorRequest: CreateCopyEditorRequest): Promise<Response> => {
    try {
      const response = await axios.post<Response>(`/${createCopyEditorRequest.roleName}`, createCopyEditorRequest);
      if (!response.data.isSuccess) {
        throw new Error('Failed to create copy editor');
      }
      return response.data;
    } catch (error) {
      console.error("Error creating copy editor:", error);
      throw error;
    }
  },

  updateCopyEditor: async (updateCopyEditorRequest: Partial<CreateCopyEditorRequest>): Promise<Response> => {
    try {
      const response = await axios.put<Response>(`/${updateCopyEditorRequest.roleName}`, updateCopyEditorRequest);
      if (!response.data.isSuccess) {
        throw new Error('Failed to update copy editor');
      }
      return response.data;
    } catch (error) {
      console.error("Error updating copy editor:", error);
      throw error;
    }
  },

  updateAuthor: async (updateAuthorRequest: Partial<CreateAuthorRequest>): Promise<Response> => {
    try {
      const response = await axios.put<Response>(`/${updateAuthorRequest.roleName}`, updateAuthorRequest);
      if (!response.data.isSuccess) {
        throw new Error('Failed to update author');
      }
      return response.data;
    } catch (error) {
      console.error("Error updating author:", error);
      throw error;
    }
  },
      
  updateEditor: async (updateEditorRequest: Partial<CreateEditorRequest>): Promise<Response> => {
    try {
      const response = await axios.put<Response>(`/${updateEditorRequest.roleName}`, updateEditorRequest);
      if (!response.data.isSuccess) {
        throw new Error('Failed to update editor');
      }
      return response.data;
    } catch (error) {
      console.error("Error updating editor:", error);
      throw error;
    }
  },
      
  updatePublisher: async (updatePublisherRequest: Partial<CreatePublisherRequest>): Promise<Response> => {
    try {
      const response = await axios.put<Response>(`/${updatePublisherRequest.roleName}`, updatePublisherRequest);
      if (!response.data.isSuccess) {
        throw new Error('Failed to update publisher');
      }
      return response.data;
    } catch (error) {
      console.error("Error updating publisher:", error);
      throw error;
    }
  },
      
  updateReviewer: async (updateReviewerRequest: Partial<CreateReviewerRequest>): Promise<Response> => {
    try {
      const response = await axios.put<Response>(`/${updateReviewerRequest.roleName}`, updateReviewerRequest);
      if (!response.data.isSuccess) {
        throw new Error('Failed to update reviewer');
      }
      return response.data;
    } catch (error) {
      console.error("Error updating reviewer:", error);
      throw error;
    }
  },

  deleteAuthor: async (userId: string): Promise<Response> => {
    try {
      const response = await axios.delete<Response>(`/Author/${userId}`);
      if (!response.data.isSuccess) {
        throw new Error('Failed to delete author');
      }
      return response.data;
    } catch (error) {
      console.error(`Error deleting author with ID ${userId}:`, error);
      throw error;
    }
  },

  deleteEditor: async (userId: string): Promise<Response> => {
    try {
      const response = await axios.delete<Response>(`/Editor/${userId}`);
      if (!response.data.isSuccess) {
        throw new Error('Failed to delete editor');
      }
      return response.data;
    } catch (error) {
      console.error(`Error deleting editor with ID ${userId}:`, error);
      throw error;
    }
  },

  deletePublisher: async (userId: string): Promise<Response> => {
    try {
      const response = await axios.delete<Response>(`/Publisher/${userId}`);
      if (!response.data.isSuccess) {
        throw new Error('Failed to delete publisher');
      }
      return response.data;
    } catch (error) {
      console.error(`Error deleting publisher with ID ${userId}:`, error);
      throw error;
    }
  },

  deleteReviewer: async (userId: string): Promise<Response> => {
    try {
      const response = await axios.delete<Response>(`/Reviewer/${userId}`);
      if (!response.data.isSuccess) {
        throw new Error('Failed to delete reviewer');
      }
      return response.data;
    } catch (error) {
      console.error(`Error deleting reviewer with ID ${userId}:`, error);
      throw error;
    }
  },
};

// Submissions API
export const submissionsApi = {
  getAllSubmissions: async (): Promise<Submission[]> => {
    var response = await axios.get<GenericResponse<Submission[]>>('/submissions');
    if (!response.data.isSuccess) {
      throw new Error('Failed to fetch submissions');
    }
    const data = response.data.data;
    const Submissions: Submission[] = data || [];
    if (!data) {
      return [...submissions];
    }

    return data;
  },
  
  getSubmissionById: async (id: string): Promise<Submission | undefined> => {
    var response = await axios.get<GenericResponse<Submission>>(`/submissions/${id}`);
    if (!response.data.isSuccess) 
      {
        throw new Error('Failed to fetch submission');

      }
      const data = response.data.data;
      if (!data) {
        throw new Error('No data found in the response');
      }
      return data;
  },
  
  getSubmissionsByAuthor: async (): Promise<Submission[]> => {
    var response = await axios.get<GenericResponse<Submission[]>>('/author-journal');
    const authorId = 'some-author-id'; // Replace with the actual authorId or pass it as a parameter
    return submissions.filter(submission => submission.correspondingAuthor === authorId);
  },
  
  getSubmissionsByStatus: async (status: string): Promise<Submission[]> => {
    await delay(500);
    return submissions.filter(submission => submission.status === status);
  },
  
  getReviewerSubmissions: async (reviewerId: string, peerReviewType?: PeerReviewType): Promise<Submission[]> => {
    await delay(500);
    let filteredSubmissions = submissions.filter(submission => 
      submission.reviewers?.includes(reviewerId)
    );
    
    // // Apply peer review type filter if specified
    // if (peerReviewType) {
    //   filteredSubmissions = filteredSubmissions.filter(
    //     submission => submission.peerReviewType === peerReviewType
    //   );
    // }
    
    return filteredSubmissions;
  },
  
  getEditorSubmissions: async (editorId: string): Promise<Submission[]> => {
    await delay(500);
    return submissions.filter(submission => submission.editorId === editorId);
  },
  
  createSubmission: async (submission: Partial<CreateJournalRequest>): Promise<Response> => {
    await delay(700);
    var response  = await axios.post<Response>('/Journal', submission);
    if (!response.data.isSuccess) {
      throw new Error('Failed to create submission');
    }
    const data = response.data;
    return data;

  },
  
  updateSubmission: async ( updates: Partial<UpdateJournalRequest>): Promise<Response> => {
    var response = await axios.put<Response>('/Journal', updates);
    if (!response.data.isSuccess)
      {
        throw new Error('Failed to update submission');
      }
      const data = response.data;
      if (!data) {
        throw new Error('Failed to update submission');
      } 
      return data;
  },
  submitForReview: async (assignReviewer: AssignReviewerRequest): Promise<Response> => 
    {
    await delay(500);
    var response = await axios.post<Response>('/submissions/submitForReview', assignReviewer);
    if (!response.data.isSuccess) {
      throw new Error('Failed to submit for review');
    }
    const data = response.data;
    return data;
    
  },
  
  withdrawSubmission: async (id: string): Promise<void> => {
    await delay(500);
    // In a real implementation, this might mark as withdrawn instead of deleting
  }
};

// Reviews API
export const reviewsApi = {
  getReviewById: async (id: string): Promise<Review | undefined> => {
    var response = await axios.get<GenericResponse<Review>>(`/reviews/${id}`);
    if (!response.data.isSuccess) {
      throw new Error('Failed to fetch review');
    }
    var data = response.data.data;
    if (!data) {
      throw new Error('No data found in the response');
    }
    return data;
  },
  
  submitReview: async ( reviewData: Partial<ReviewJournalRequest>): Promise<Response> => {
    await delay(600);
    var response = await axios.post<Response>('/reviews', reviewData);
    if (!response.data.isSuccess) {
      throw new Error('Failed to submit review');
    }
    const data = response.data;
    return data;
  },
  updateReview: async (updateData: Partial<UpdateReviewJournalRequest>): Promise<Response> => {
    await delay(600);
    var response = await axios.put<Response>('/reviews', updateData);
    if (!response.data.isSuccess) {
      throw new Error('Failed to update review');
    }
    const data = response.data;
    return data;
  }
};

// Dashboard API
export const dashboardApi = {
  getStats: async (userId: string): Promise<DashboardStats> => {
    await delay(800);
    return dashboardStats;
  }
};
// Editor API
export const editorApi = {
  assignReviewer: async (assignReviewerRequest: AssignReviewerRequest): Promise<Response> => 
  {
    var response = await axios.post<Response>(`/submissions/assignReviewer`, assignReviewerRequest);
    if (!response.data.isSuccess) {
      throw new Error('Failed to assign reviewer');
    }
    return response.data;
  },
  assignEditor: async (submissionId: string, editorId: string): Promise<Response> => 
  {
    var response = await axios.post<Response>(`/submissions/${submissionId}/assignEditor`, {
      editorId: editorId
    });
    if (!response.data.isSuccess) {
      throw new Error('Failed to assign editor');
    }
    return response.data;
  },
  assignCopyEditor : async (submissionId: string, copyEditorId: string, publisherId: string): Promise<Response> => 
      {
        var response = await axios.post<Response>(`/submissions/${submissionId}/assignCopyEditor`, {
          copyEditorId: copyEditorId,
          publisherId: publisherId
        });
        if (!response.data.isSuccess) {
          throw new Error('Failed to assign copy editor');
        }
        return response.data;
      },
  editorDecissionInReview: async (editorDecision: EditorDecisionInReview): Promise<Response> =>
      {
        var response = await axios.post<Response>(`/submissions/editorDecissionInReview`, editorDecision);
        if (!response.data.isSuccess) {
          throw new Error('Failed to approve review');
        }
        return response.data;
      },
  editorDecissionInCopyEdition: async( assignCopyEditorRequest: AssignCopyEditorRequest): Promise<Response> =>
      {
        var response = await axios.post<Response>(`/submissions/editorDecissionInCopyEdition`, assignCopyEditorRequest);  
        if (!response.data.isSuccess) {
          throw new Error('Failed to process editor decision in copy edition');
        }
        return response.data;
      }
};
// Published Articles API
export const articlesApi = {
  getPublishedArticles: async (): Promise<Submission[]> => {
    const response = await axios.get<GenericResponse<Submission[]>>('/articles/published');
    if (!response.data.isSuccess) 
      {
        throw new Error('Failed to fetch published articles');
      }
      const data = response.data.data;
      if (!data) {
        throw new Error('No data found in the response');
      }
     return data.filter(article => article.status === 'published');
  },
  
  searchArticles: async (query: string): Promise<Submission[]> => {
    await delay(700);
    const lowerQuery = query.toLowerCase();
    var response = await axios.get<GenericResponse<Submission[]>>(`/articles`);
    if(!response.data.isSuccess) {
      throw new Error('Failed to fetch articles');
    }
    const data = response.data.data;
    if (!data) {
      throw new Error('No data found in the response');
    }
    return data.filter(article => 
      article.status === 'published' && (
        article.title.toLowerCase().includes(lowerQuery) ||
        article.abstract.toLowerCase().includes(lowerQuery) ||
        article.keywords.some(keyword => keyword.toLowerCase().includes(lowerQuery)) ||
        article.authors.some(author => author.toLowerCase().includes(lowerQuery))
      )
    );
  }
};
