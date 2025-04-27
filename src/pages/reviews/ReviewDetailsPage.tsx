import { useParams, useNavigate } from "react-router-dom";
import { Review, ReviewType, ReviewStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import ReviewForm from "@/components/reviews/ReviewForm";
import SubmissionDetails from "@/components/reviews/SubmissionDetails";
import AlreadySubmittedReview from "@/components/reviews/AlreadySubmittedReview";
import { useReviewDetails } from "@/hooks/useReviewDetails";
import { useSubmissions } from "@/context/SubmissionContext";
import { useToast } from "@/components/ui/use-toast";
import { reviewsApi } from "@/api/apiService";

const ReviewDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateSubmission } = useSubmissions();
  const { toast } = useToast();
  const {
    submission,
    review,
    loading,
    error,
    isSubmitting,
    handleSubmitReview,
    canReview,
    user
  } = useReviewDetails(id);

  const isEditor = user?.role === 'Editor' || user?.role === 'Admin';

  const onSubmitReview = async (reviewData: Partial<Review>) => {
    try {
      // Ensure overall rating is included to fix the TS error
      if (reviewData.criteria && !reviewData.criteria.overall) {
        reviewData.criteria.overall = 0;
      }
      
      const submittedReview = await handleSubmitReview(reviewData);
      
      // If the decision is minor or major revisions and user is a Reviewer, request revision
      if ((reviewData.decision === "minor_revisions" || reviewData.decision === "major_revisions") && user?.role === "Reviewer") {
        if (submission) {
          // Backend will handle the revision process based on the review submission
          toast({
            title: "Revision Requested",
            description: `You have requested ${reviewData.decision.replace('_', ' ')} for this submission.`,
          });
        }
      }
      
      navigate("/reviews");
    } catch (err) {
      // Error already handled in the hook
      console.error("Error submitting review:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p>Loading review details...</p>
        </div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Error</h2>
        <p className="text-destructive mb-6">{error || "Submission not found"}</p>
        <Button onClick={() => navigate("/reviews")}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Reviews
        </Button>
      </div>
    );
  }

  if (!canReview()) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p className="mb-6">
          You don't have permission to review this submission.
        </p>
        <Button onClick={() => navigate("/reviews")}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Reviews
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button
        variant="outline"
        size="sm"
        className="mb-4"
        onClick={() => navigate("/reviews")}
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Back to Reviews
      </Button>
      
      <div>
        <h1 className="text-2xl font-bold mb-2">
          {isEditor ? "Editor Review" : "Review Submission"}
        </h1>
        <p className="text-muted-foreground">
          {isEditor 
            ? "Provide your editorial assessment for this manuscript"
            : "Provide your expert review for this manuscript"}
        </p>
      </div>
      
      <SubmissionDetails submission={submission} />
      
      <div>
        <h2 className="text-2xl font-semibold mb-4">
          {isEditor ? "Submit Editorial Assessment" : "Submit Your Review"}
        </h2>
        
        {review?.completed ? (
          <AlreadySubmittedReview isEditor={isEditor} />
        ) : (
          <ReviewForm
            submission={submission}
            review={review || undefined}
            onSubmit={onSubmitReview}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
};

export default ReviewDetailsPage;
