
import { Review, Submission, PeerReviewType } from '../types';
import { submissionsApi } from './apiService';
import { useToast } from '@/components/ui/use-toast';

export const reviewsApi = {
  submitReview: async (submissionId: string, reviewData: Partial<Review>): Promise<Review> => {
    try {
      // In a real implementation, this would call an actual API endpoint
      const submission = await submissionsApi.getSubmissionById(submissionId);
      
      if (!submission) {
        throw new Error('Submission not found');
      }
      
      // Create a new review or update existing one
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
      
      // In a real app, this would update the review in the database
      console.log('Review submitted:', review);
      
      return review;
    } catch (error) {
      console.error("Error submitting review:", error);
      throw error;
    }
  },

  // Get reviews by peer review type
  getReviewsByPeerReviewType: async (reviewerId: string, peerReviewType: PeerReviewType): Promise<Submission[]> => {
    try {
      // Get all submissions assigned to this reviewer
      const reviewerSubmissions = await submissionsApi.getReviewerSubmissions(reviewerId);
      
      // Filter by peer review type if specified
      if (peerReviewType) {
        return reviewerSubmissions.filter(submission => 
          submission.peerReviewType === peerReviewType
        );
      }
      
      return reviewerSubmissions;
    } catch (error) {
      console.error("Error getting reviews by peer review type:", error);
      throw error;
    }
  }
};
