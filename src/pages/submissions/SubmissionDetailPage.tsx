
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useSubmissions } from "@/context/SubmissionContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Calendar,
  FileText,
  Users,
  Tag,
  Send,
  Edit,
  ThumbsUp,
  ThumbsDown,
  Clock,
  AlertTriangle,
  ChevronLeft,
  RotateCw,
  UserCheck,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import SubmissionStatusBadge from "@/components/submissions/SubmissionStatusBadge";
import SubmissionDetailsView from "@/components/submissions/SubmissionDetailsView";
import SubmissionReviewsTab from "@/components/submissions/SubmissionReviewsTab";
import SubmissionFeedbackTab from "@/components/submissions/SubmissionFeedbackTab";
import SubmissionDecisionTab from "@/components/submissions/SubmissionDecisionTab";
import ResubmissionPortal from "@/components/submissions/ResubmissionPortal";
import ResubmissionDialog from "@/components/submissions/ResubmissionDialog";
import ReviewerAssignmentDialog from "@/components/submissions/ReviewerAssignmentDialog";

const SubmissionDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { getSubmissionById, submitForReview, updateSubmission } = useSubmissions();
  const [activeTab, setActiveTab] = useState("details");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResubmissionPortal, setShowResubmissionPortal] = useState(false);
  const [resubmissionDialogOpen, setResubmissionDialogOpen] = useState(false);
  const [reviewerAssignmentOpen, setReviewerAssignmentOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const submission = id ? getSubmissionById(id) : undefined;
  
  if (!submission) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Submission Not Found</h2>
        <p className="mb-6">
          The submission you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <Button onClick={() => navigate(-1)}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  const isAuthor = user?.id === submission.correspondingAuthor;
  const isEditor = user?.role === "editor" || user?.role === "admin";
  const isReviewer = user?.role === "reviewer" && submission.reviewers?.includes(user.id);
  const isAdmin = user?.role === "admin";

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMMM d, yyyy");
    } catch (e) {
      return "N/A";
    }
  };

  const handleSubmitForReview = async () => {
    if (submission.status !== "draft") return;

    setIsSubmitting(true);
    try {
      await submitForReview(submission.id);
      toast({
        title: "Success",
        description: "Your submission has been sent for review.",
      });
    } catch (error) {
      console.error("Error submitting for review:", error);
      toast({
        title: "Error",
        description: "Failed to submit for review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActivateResubmission = async (comments: string) => {
    setIsSubmitting(true);
    try {
      await updateSubmission(submission.id, { 
        status: 'revision_required',
        decision: {
          status: 'revision',
          comments: comments || 'The editor has requested a revision of this submission. Please use the resubmission portal to submit your revised manuscript.',
          date: new Date().toISOString()
        }
      });
      
      toast({
        title: "Resubmission Portal Activated",
        description: "The author can now submit a revised version of their manuscript.",
      });
    } catch (error) {
      console.error("Error activating resubmission:", error);
      toast({
        title: "Error",
        description: "Failed to activate resubmission portal. Please try again.",
        variant: "destructive",
      });
      throw error; // Re-throw to be caught by the dialog component
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleResubmissionPortal = () => {
    setShowResubmissionPortal(!showResubmissionPortal);
  };

  const handleAssignReviewers = async (reviewerIds: string[]) => {
    setIsSubmitting(true);
    try {
      // Update submission status and assign reviewers
      await updateSubmission(submission.id, {
        status: 'under_review',
        reviewers: reviewerIds,
        // Set review deadlines for each reviewer
        reviews: reviewerIds.map(reviewerId => {
          // Check if reviewer already exists to avoid duplicates
          const existingReview = submission.reviews?.find(r => r.reviewerId === reviewerId);
          if (existingReview) return existingReview;
          
          // Create a new review with a deadline 14 days from now
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 14);
          
          return {
            id: `rev-${Math.random().toString(36).substring(2, 9)}`,
            submissionId: submission.id,
            reviewerId: reviewerId,
            completed: false,
            comments: '',
            dueDate: dueDate.toISOString(),
            criteria: {
              methodology: 0,
              relevance: 0,
              clarity: 0,
              originality: 0,
              overall: 0
            }
          };
        })
      });
      
      toast({
        title: "Reviewers Assigned",
        description: "Reviewers have been successfully assigned to this submission.",
      });
    } catch (error) {
      console.error("Error assigning reviewers:", error);
      toast({
        title: "Error",
        description: "Failed to assign reviewers. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {showResubmissionPortal && submission.status === 'revision_required' && isAuthor ? (
        <ResubmissionPortal 
          submission={submission} 
          onClose={handleToggleResubmissionPortal} 
        />
      ) : (
        <>
          <Button
            variant="outline"
            size="sm"
            className="mb-4"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Back
          </Button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="line-clamp-2">{submission.title}</h1>
                <SubmissionStatusBadge status={submission.status} />
              </div>
              <p className="text-muted-foreground">
                Submitted on {formatDate(submission.submittedDate)}
              </p>
            </div>

            {isAuthor && submission.status === "draft" && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate(`/submissions/${submission.id}/edit`)}>
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
                <Button onClick={handleSubmitForReview} disabled={isSubmitting}>
                  <Send className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Submitting..." : "Submit for Review"}
                </Button>
              </div>
            )}
            
            {isAuthor && submission.status === "revision_required" && (
              <div className="flex gap-2">
                <Button onClick={handleToggleResubmissionPortal}>
                  <RotateCw className="mr-2 h-4 w-4" /> Submit Revision
                </Button>
              </div>
            )}
            
            {isEditor && submission.status === "submitted" && (
              <div className="flex gap-2">
                <Button onClick={() => setReviewerAssignmentOpen(true)}>
                  <UserCheck className="mr-2 h-4 w-4" /> Assign Reviewers
                </Button>
              </div>
            )}
            
            {isEditor && submission.status === "under_review" && (
              <div className="flex flex-wrap items-center gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setReviewerAssignmentOpen(true)}
                >
                  <UserCheck className="mr-2 h-4 w-4" /> Manage Reviewers
                </Button>
                <div className="flex gap-2 flex-wrap justify-end">
                  <Button variant="outline" className="bg-green-50 text-green-600 hover:bg-green-100 border-green-200" onClick={() => {
                    toast({
                      title: "Accept Submission",
                      description: "This would accept the submission in a real application.",
                    });
                  }}>
                    <ThumbsUp className="mr-2 h-4 w-4" /> Accept
                  </Button>
                  <Button variant="outline" className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200" onClick={() => {
                    toast({
                      title: "Reject Submission",
                      description: "This would reject the submission in a real application.",
                    });
                  }}>
                    <ThumbsDown className="mr-2 h-4 w-4" /> Reject
                  </Button>
                </div>
              </div>
            )}
            
            {isReviewer && submission.status === "under_review" && (
              <div className="flex gap-2">
                <Button onClick={() => navigate(`/reviews/${submission.id}`)}>
                  <FileText className="mr-2 h-4 w-4" /> Submit Review
                </Button>
              </div>
            )}
          </div>

          {submission.status === "revision_required" && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Revision Required</AlertTitle>
              <AlertDescription>
                The editor has requested revisions for this submission. Please review the feedback and submit your revised manuscript.
              </AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              {submission.status === "revision_required" && (
                <TabsTrigger value="feedback">Editor Feedback</TabsTrigger>
              )}
              {submission.decision && (
                <TabsTrigger value="decision">Decision</TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="details" className="mt-6">
              <SubmissionDetailsView submission={submission} formatDate={formatDate} user={user} />
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-6">
              <SubmissionReviewsTab 
                reviews={submission.reviews || []} 
                submissionStatus={submission.status}
                formatDate={formatDate}
                isEditor={isEditor}
                isReviewer={isReviewer}
                peerReviewType={submission.peerReviewType || 'double_blind'}
              />
            </TabsContent>
            
            {submission.status === "revision_required" && (
              <TabsContent value="feedback" className="mt-6">
                <SubmissionFeedbackTab 
                  decision={submission.decision} 
                  formatDate={formatDate}
                  resubmissionDetails={submission.resubmissionDetails}
                />
              </TabsContent>
            )}
            
            {submission.decision && (
              <TabsContent value="decision" className="mt-6">
                <SubmissionDecisionTab decision={submission.decision} formatDate={formatDate} />
              </TabsContent>
            )}
          </Tabs>
          
          {/* Add the ReviewerAssignmentDialog */}
          {isEditor && (
            <ReviewerAssignmentDialog
              open={reviewerAssignmentOpen}
              onClose={() => setReviewerAssignmentOpen(false)}
              submission={submission}
              onAssignReviewers={handleAssignReviewers}
            />
          )}
        </>
      )}
    </div>
  );
};

export default SubmissionDetailPage;
