
import { useState, useEffect } from "react";
import { submissionsApi } from "@/api/apiService";
import { useAuth } from "@/context/AuthContext";
import { Submission } from "@/types";
import { useNavigate } from "react-router-dom";
import ReviewCard from "@/components/reviews/ReviewCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const ReviewsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    const fetchReviewSubmissions = async () => {
      if (!user) return;

      try {
        // For reviewer role
        if (user.role === "reviewer") {
          const reviewerSubmissions = await submissionsApi.getReviewerSubmissions(user.id);
          setSubmissions(reviewerSubmissions);
        } 
        // For editor or admin roles
        else if (user.role === "editor" || user.role === "admin") {
          const allSubmissions = await submissionsApi.getAllSubmissions();
          // Only get the under_review submissions
          const reviewSubmissions = allSubmissions.filter(
            (sub) => sub.status === "under_review" || sub.status === "submitted"
          );
          setSubmissions(reviewSubmissions);
        }
      } catch (err) {
        console.error("Error fetching reviewer submissions:", err);
        setError("Failed to load review submissions");
      } finally {
        setLoading(false);
      }
    };

    fetchReviewSubmissions();
  }, [user]);

  // If not a reviewer or editor, redirect to dashboard
  if (user && user.role !== "reviewer" && user.role !== "editor" && user.role !== "admin") {
    navigate("/dashboard");
    return null;
  }

  const pendingReviews = submissions.filter(submission => 
    submission.status === "under_review" && 
    submission.reviews?.some(review => !review.completed)
  );

  const completedReviews = submissions.filter(submission => 
    submission.reviews?.some(review => review.completed)
  );

  const assignableSubmissions = submissions.filter(submission => 
    submission.status === "submitted" && 
    (user?.role === "editor" || user?.role === "admin")
  );

  // Get corresponding review for a submission for the current reviewer
  const getReviewForSubmission = (submission: Submission) => {
    if (!user || !submission.reviews) return undefined;
    return submission.reviews.find(review => review.reviewerId === user.id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2">Review Management</h1>
        <p className="text-muted-foreground">
          {user?.role === "reviewer" 
            ? "Manage your assigned manuscript reviews" 
            : "Manage review process for submitted manuscripts"}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p>Loading reviews...</p>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-destructive mb-4">{error}</p>
          <button
            className="text-primary underline"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-16">
          <h3 className="text-xl font-medium mb-2">No Reviews Assigned</h3>
          <p className="text-muted-foreground">
            You don't have any manuscripts assigned for review.
          </p>
        </div>
      ) : (
        <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pending">
              Pending Reviews {pendingReviews.length > 0 && `(${pendingReviews.length})`}
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed Reviews {completedReviews.length > 0 && `(${completedReviews.length})`}
            </TabsTrigger>
            {(user?.role === "editor" || user?.role === "admin") && (
              <TabsTrigger value="assignable">
                To Be Assigned {assignableSubmissions.length > 0 && `(${assignableSubmissions.length})`}
              </TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="pending" className="mt-6">
            {pendingReviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingReviews.map((submission) => (
                  <ReviewCard 
                    key={submission.id} 
                    submission={submission} 
                    review={getReviewForSubmission(submission)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium mb-2">No Pending Reviews</h3>
                <p className="text-muted-foreground">
                  You don't have any pending reviews at the moment.
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="mt-6">
            {completedReviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedReviews.map((submission) => (
                  <ReviewCard 
                    key={submission.id} 
                    submission={submission} 
                    review={getReviewForSubmission(submission)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium mb-2">No Completed Reviews</h3>
                <p className="text-muted-foreground">
                  You haven't completed any reviews yet.
                </p>
              </div>
            )}
          </TabsContent>
          
          {(user?.role === "editor" || user?.role === "admin") && (
            <TabsContent value="assignable" className="mt-6">
              {assignableSubmissions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {assignableSubmissions.map((submission) => (
                    <ReviewCard 
                      key={submission.id} 
                      submission={submission}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-xl font-medium mb-2">No Submissions To Assign</h3>
                  <p className="text-muted-foreground">
                    There are no submissions waiting for reviewer assignment.
                  </p>
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      )}
    </div>
  );
};

export default ReviewsPage;
