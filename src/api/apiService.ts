
import { User, Submission, Review, DashboardStats } from '../types';
import { users, submissions, dashboardStats } from './mockData';

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Auth API
export const authApi = {
  login: async (email: string, password: string): Promise<User> => {
    await delay(500); // Simulate API call
    
    const user = users.find(u => u.email === email);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    // In real implementation, validate password
    return user;
  },
  
  getCurrentUser: async (): Promise<User> => {
    await delay(300);
    
    // Return a default user for now (in real app this would come from token)
    return users[3]; // Author user
  }
};

// Users API
export const usersApi = {
  getAllUsers: async (): Promise<User[]> => {
    await delay(500);
    return [...users];
  },
  
  getUserById: async (id: string): Promise<User | undefined> => {
    await delay(300);
    return users.find(user => user.id === id);
  },
  
  getUsersByRole: async (role: string): Promise<User[]> => {
    await delay(400);
    return users.filter(user => user.role === role);
  }
};

// Submissions API
export const submissionsApi = {
  getAllSubmissions: async (): Promise<Submission[]> => {
    await delay(600);
    return [...submissions];
  },
  
  getSubmissionById: async (id: string): Promise<Submission | undefined> => {
    await delay(400);
    return submissions.find(submission => submission.id === id);
  },
  
  getSubmissionsByAuthor: async (authorId: string): Promise<Submission[]> => {
    await delay(500);
    return submissions.filter(submission => submission.correspondingAuthor === authorId);
  },
  
  getSubmissionsByStatus: async (status: string): Promise<Submission[]> => {
    await delay(500);
    return submissions.filter(submission => submission.status === status);
  },
  
  getReviewerSubmissions: async (reviewerId: string): Promise<Submission[]> => {
    await delay(500);
    return submissions.filter(submission => 
      submission.reviewers?.includes(reviewerId)
    );
  },
  
  getEditorSubmissions: async (editorId: string): Promise<Submission[]> => {
    await delay(500);
    return submissions.filter(submission => submission.editorId === editorId);
  },
  
  createSubmission: async (submission: Partial<Submission>): Promise<Submission> => {
    await delay(700);
    
    // In a real API, would create and return the created submission
    const newSubmission: Submission = {
      id: `sub-${submissions.length + 1}`,
      title: submission.title || 'Untitled Submission',
      abstract: submission.abstract || '',
      authors: submission.authors || [],
      keywords: submission.keywords || [],
      status: 'draft',
      submittedDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      document: submission.document || '',
      coverLetter: submission.coverLetter || '',
      correspondingAuthor: submission.correspondingAuthor || '',
      category: submission.category || 'Uncategorized',
    };
    
    return newSubmission;
  },
  
  updateSubmission: async (id: string, updates: Partial<Submission>): Promise<Submission> => {
    await delay(600);
    
    // Find the submission to update
    const submissionIndex = submissions.findIndex(s => s.id === id);
    if (submissionIndex === -1) {
      throw new Error('Submission not found');
    }
    
    // Update the submission (in a real API, this would persist to a database)
    const updatedSubmission = {
      ...submissions[submissionIndex],
      ...updates,
      updatedDate: new Date().toISOString()
    };
    
    return updatedSubmission;
  },
  
  submitForReview: async (id: string): Promise<Submission> => {
    await delay(500);
    
    // In a real API, this would change the status and trigger notifications
    return submissionsApi.updateSubmission(id, { status: 'submitted' });
  },
  
  withdrawSubmission: async (id: string): Promise<void> => {
    await delay(500);
    // In a real implementation, this might mark as withdrawn instead of deleting
  }
};

// Reviews API
export const reviewsApi = {
  getReviewById: async (id: string): Promise<Review | undefined> => {
    await delay(400);
    
    // Find the review in the submissions
    for (const submission of submissions) {
      if (submission.reviews) {
        const review = submission.reviews.find(r => r.id === id);
        if (review) return review;
      }
    }
    
    return undefined;
  },
  
  submitReview: async (submissionId: string, reviewData: Partial<Review>): Promise<Review> => {
    await delay(600);
    
    // In a real implementation, this would update the database
    const submission = submissions.find(s => s.id === submissionId);
    if (!submission) {
      throw new Error('Submission not found');
    }
    
    const reviewId = reviewData.id || `rev-${Math.random().toString(36).substr(2, 9)}`;
    const review: Review = {
      id: reviewId,
      submissionId,
      reviewerId: reviewData.reviewerId || '',
      completed: true,
      decision: reviewData.decision,
      comments: reviewData.comments || '',
      privateComments: reviewData.privateComments,
      submittedDate: new Date().toISOString(),
      dueDate: reviewData.dueDate || new Date().toISOString(),
      criteria: reviewData.criteria || {
        methodology: 0,
        relevance: 0,
        clarity: 0,
        originality: 0,
        overall: 0
      }
    };
    
    return review;
  }
};

// Dashboard API
export const dashboardApi = {
  getStats: async (userId: string): Promise<DashboardStats> => {
    await delay(800);
    return dashboardStats;
  }
};

// Published Articles API
export const articlesApi = {
  getPublishedArticles: async (): Promise<Submission[]> => {
    await delay(500);
    return submissions.filter(s => s.status === 'published');
  },
  
  searchArticles: async (query: string): Promise<Submission[]> => {
    await delay(700);
    const lowerQuery = query.toLowerCase();
    
    return submissions.filter(s => 
      s.status === 'published' && (
        s.title.toLowerCase().includes(lowerQuery) ||
        s.abstract.toLowerCase().includes(lowerQuery) ||
        s.keywords.some(keyword => keyword.toLowerCase().includes(lowerQuery)) ||
        s.authors.some(author => author.toLowerCase().includes(lowerQuery))
      )
    );
  }
};
