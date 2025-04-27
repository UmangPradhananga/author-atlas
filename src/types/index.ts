export const ROLES = ['Admin', 'Editor', 'Reviewer', 'Author', 'Reader', 'CopyEditor', 'Publisher'] as const;

export type Role = typeof ROLES[number];

// Peer review types
export type PeerReviewType = 'open' | 'single_blind' | 'double_blind';

// User profile
export interface User {
  userId: string;
  fullName: string;
  email: string;
  role: Role;
  
  // Optional common fields
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string | Date;
  
  // Optional Author-specific fields
  penName?: string;
  genre?: string;
  
  // Optional Editor-specific fields
  yearsOfService?: number;
  researchAreas?: string;
  publications?: string[];
  awards?: string[];
  reviewedPapersCount?: number;
  orcid?: string;
  
  // Optional Reviewer-specific fields
  affiliation?: string;
  expertise?: string;
  bio?: string;
  dateOfJoining?: string | Date;
  status?: string;
  
  // Optional Publisher/CopyEditor fields
  associatedPublication?: string;
  yearsInService?: number;
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

// Resubmission details
export interface ResubmissionDetails {
  responseToReviewers: string;
  changesSummary: string;
  resubmissionDate: string;
  previousVersion: string; // URL to previous version
}

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
      resubmissionDetails?: ResubmissionDetails;
      copyeditors?: string[];
      publishers?: string[];
      peerReviewType: PeerReviewType;
      manuscriptVersion: 'initial' | 'reviewing' | 'copy_editing' | 'final';
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
    methodology?: number;
    relevance?: number;
    clarity?: number;
    originality?: number;
    overall: number;
    novelty?: number;
    importance?: number;
    presentation?: number;
    techQuality?: number;
    [key: string]: number | undefined;
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
  // Gender enum
  export enum Gender {
    Male = 1,
    Female = 2,
    Others = 3
  }
  // Role enum
  export enum RoleEnum {
    Admin = 1,
    Author = 2,
    Reviewer = 3,
    Editor = 4,
    Publisher = 5
  }

  // Status enum
  export enum Status {
    Active = 1,
    Inactive = 2
  }

  // SubmissionStatus enum
  export enum SubmissionStatusEnum {
    Draft = 1,
    Submitted = 2,
    UnderReview = 3,
    Accepted = 4,
    Rejected = 5,
    PendingRevision = 6,
    UnderCopyEdition = 7,
    CopyEdition = 8,
    Published = 9,
    Resubmission = 10
  }

  // PublisherDecision enum
  export enum PublisherDecision {
    Approve = 1,
    Reject = 2
  }

  // ReviewRating enum
  export enum ReviewRating {
    VeryPoor = 1,
    Poor = 2,
    BelowAverage = 3,
    Average = 4,
    Satisfactory = 5,
    Fair = 6,
    Good = 7,
    VeryGood = 8,
    Excellent = 9,
    Outstanding = 10
  }

  // ReviewStatus enum
  export enum ReviewStatus {
    Accepted = 1,
    Rejected = 2,
    MinorRevision = 3,
    MajorRevision = 4
  }

  // ReviewType enum
  export enum ReviewType {
    SingleBinded = 1,
    DoubleBinded = 2,
    Open = 3
  }

  // ManuscriptVersion enum
  export enum ManuscriptVersion {
    Initial = 1,
    Reviewing = 2,
    CopyEditingEdition = 3,
    Final = 4
  }

  // EditorDecision enum
  export enum EditorDecision {
    Accept = 1,
    SubmitForReview = 2,
    Reject = 3
  }

  // EditorCopyEditionDecision enum
  export enum EditorCopyEditionDecision {
    Accept = 1,
    Reject = 2
  }
