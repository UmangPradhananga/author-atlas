
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { submissionsApi } from "@/api/apiService";
import { reviewsApi } from "@/api/reviewsApi";
import { Submission, Review } from "@/types";
import { useToast } from "@/components/ui/use-toast";

export function useReviewDetails(submissionId: string | undefined) {
  const { user } = useAuth();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSubmissionAndReview = async () => {
      if (!submissionId || !user) return;

      try {
        // In a real app, we'd have a direct API to get submission by ID
        const allSubmissions = await submissionsApi.getAllSubmissions();
        const foundSubmission = allSubmissions.find(sub => sub.id === submissionId);
        
        if (!foundSubmission) {
          throw new Error("Submission not found");
        }
        
        setSubmission(foundSubmission);
        
        // Find the current user's review for this submission if it exists
        if (foundSubmission.reviews) {
          const userReview = foundSubmission.reviews.find(
            r => r.reviewerId === user.id
          );
          setReview(userReview || null);
        }
      } catch (err) {
        console.error("Error fetching submission or review:", err);
        setError("Failed to load review details");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissionAndReview();
  }, [submissionId, user]);

  const handleSubmitReview = async (reviewData: Partial<Review>) => {
    if (!submission || !user) return;
    
    setIsSubmitting(true);
    
    try {
      // Prepare review data
      const reviewToSubmit = {
        ...(review || {}), // Use existing review data if available
        ...reviewData,
        submissionId: submission.id,
        reviewerId: user.id,
        completed: true,
        submittedDate: new Date().toISOString(),
      };
      
      // In a real app, this would actually create/update the review in the database
      const submittedReview = await reviewsApi.submitReview(
        submission.id, 
        reviewToSubmit as Partial<Review>
      );
      
      // Update local state
      setReview(submittedReview);
      
      toast({
        title: "Review Submitted",
        description: "Your review has been successfully submitted.",
      });
      
      return submittedReview;
    } catch (err) {
      console.error("Error submitting review:", err);
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if user is allowed to review this submission
  const canReview = () => {
    if (!user || !submission) return false;
    
    // Editors and admins can review any submission
    if (user.role === "editor" || user.role === "admin") return true;
    
    // Reviewers can only review if they're assigned
    if (user.role === "reviewer") {
      return submission.reviewers?.includes(user.id) || false;
    }
    
    return false;
  };

  return {
    submission,
    review,
    loading,
    error,
    isSubmitting,
    handleSubmitReview,
    canReview,
    user
  };
}
