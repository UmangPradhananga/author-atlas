
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { submissionsApi } from "@/api/apiService";
import { reviewsApi } from "@/api/reviewsApi";
import { Submission, Review } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import ReviewForm from "@/components/reviews/ReviewForm";

const ReviewDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchSubmissionAndReview = async () => {
      if (!id || !user) return;

      try {
        // In a real app, we'd have a direct API to get submission by ID
        const allSubmissions = await submissionsApi.getAllSubmissions();
        const foundSubmission = allSubmissions.find(sub => sub.id === id);
        
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
  }, [id, user]);

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
      
      // Navigate back to reviews page
      navigate("/reviews");
    } catch (err) {
      console.error("Error submitting review:", err);
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
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
        <h1 className="mb-2">Review Submission</h1>
        <p className="text-muted-foreground">
          Provide your expert review for this manuscript.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{submission.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Abstract</h3>
              <p className="whitespace-pre-wrap">{submission.abstract}</p>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Authors</h3>
                <p>{submission.authors.join(', ')}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Category</h3>
                <p>{submission.category}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Keywords</h3>
              <p>{submission.keywords.join(', ')}</p>
            </div>
            
            <div>
              <Button variant="outline" className="w-full sm:w-auto" asChild>
                <a href={submission.document} target="_blank" rel="noopener noreferrer">
                  View Full Manuscript
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div>
        <h2 className="text-2xl font-semibold mb-4">Submit Your Review</h2>
        {review?.completed ? (
          <div className="text-center py-8 bg-muted rounded-lg">
            <h3 className="text-xl font-medium mb-2">Review Already Submitted</h3>
            <p className="text-muted-foreground mb-6">
              You have already submitted your review for this manuscript.
            </p>
          </div>
        ) : (
          <ReviewForm
            submission={submission}
            review={review || undefined}
            onSubmit={handleSubmitReview}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
};

export default ReviewDetailsPage;
