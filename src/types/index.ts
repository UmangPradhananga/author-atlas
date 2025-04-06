// User roles
export type Role = 'admin' | 'editor' | 'reviewer' | 'author' | 'reader';

// User profile
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  affiliation?: string;
  bio?: string;
  password?: string; // Added optional password field
}

// Article submission status
export type SubmissionStatus = 
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'revision_required'
  | 'accepted'
  | 'rejected'
  | 'published';

// Review decision
export type ReviewDecision = 'accept' | 'minor_revisions' | 'major_revisions' | 'reject';

// Article submission
export interface Submission {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  keywords: string[];
  status: SubmissionStatus;
  submittedDate: string;
  updatedDate: string;
  document: string; // URL to document
  coverLetter?: string;
  correspondingAuthor: string;
  reviewers?: string[];
  editorId?: string;
  reviews?: Review[];
  decision?: {
    status: 'accept' | 'reject' | 'revision';
    comments: string;
    date: string;
  };
  category: string;
  publicationDate?: string;
}

// Review
export interface Review {
  id: string;
  submissionId: string;
  reviewerId: string;
  completed: boolean;
  decision?: ReviewDecision;
  comments: string;
  privateComments?: string; // Comments only visible to editors
  submittedDate?: string;
  dueDate: string;
  criteria: {
    methodology: number;
    relevance: number;
    clarity: number;
    originality: number;
    overall: number;
  };
}

// Dashboard statistics
export interface DashboardStats {
  totalSubmissions: number;
  pendingReviews: number;
  acceptedSubmissions: number;
  rejectedSubmissions: number;
  underReviewSubmissions: number;
  publishedArticles: number;
  submissionTrends: {
    month: string;
    submissions: number;
  }[];
  decisionRates: {
    status: string;
    count: number;
  }[];
  reviewTimes: {
    month: string;
    days: number;
  }[];
}
