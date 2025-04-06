
import { User, Submission, Review, DashboardStats, Role } from '../types';
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
  },
  
  signup: async (name: string, email: string, password: string, role: 'reader' | 'author'): Promise<User> => {
    await delay(800); // Simulate API call
    
    // Check if user with email already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    // In a real app, this would create a new user in the database
    const newUser: User = {
      id: `user-${Date.now().toString(36)}`,
      name,
      email,
      role: role as Role,
      avatar: undefined,
    };
    
    // In a real app, would add to the database and return the created user
    return newUser;
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
  },
  
  // Create user method (now handling password properly)
  createUser: async (userData: Partial<User>): Promise<User> => {
    await delay(600);
    
    // Check if user with email already exists
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    // Create new user with required fields
    const newUser: User = {
      id: `user-${Date.now().toString(36)}`,
      name: userData.name || 'New User',
      email: userData.email || '',
      role: userData.role || 'reader',
      avatar: userData.avatar,
      affiliation: userData.affiliation,
      bio: userData.bio,
      // In a real app, the password would be hashed before storing
      password: userData.password
    };
    
    // In a real app, this would be persisted to a database
    users.push(newUser); // Add to in-memory array for mock data
    
    return newUser;
  },
  
  // Update user method
  updateUser: async (id: string, updates: Partial<User>): Promise<User> => {
    await delay(500);
    
    // Find the user to update
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    // Update the user (in a real API, this would persist to a database)
    const updatedUser = {
      ...users[userIndex],
      ...updates,
    };
    
    // In a real app, this would be persisted to a database
    users[userIndex] = updatedUser; // Update in-memory array for mock data
    
    return updatedUser;
  },
  
  // Delete user method
  deleteUser: async (id: string): Promise<void> => {
    await delay(400);
    
    // Find the user to delete
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    // In a real app, this would be persisted to a database
    users.splice(userIndex, 1); // Remove from in-memory array for mock data
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
      peerReviewType: submission.peerReviewType || 'double_blind', // Default to double blind if not specified
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
