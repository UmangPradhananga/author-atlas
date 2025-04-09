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
  LockOpen,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import SubmissionStatusBadge from "@/components/submissions/SubmissionStatusBadge";
import SubmissionDetailsView from "@/components/submissions/SubmissionDetailsView";
import SubmissionReviewsTab from "@/components/submissions/SubmissionReviewsTab";
import SubmissionFeedbackTab from "@/components/submissions/SubmissionFeedbackTab";
import SubmissionDecisionTab from "@/components/submissions/SubmissionDecisionTab";
import ResubmissionPortal from "@/components/submissions/ResubmissionPortal";

const SubmissionDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { getSubmissionById, submitForReview, updateSubmission } = useSubmissions();
  const [activeTab, setActiveTab] = useState("details");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResubmissionPortal, setShowResubmissionPortal] = useState(false);
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

  const handleActivateResubmission = async () => {
    setIsSubmitting(true);
    try {
      await updateSubmission(submission.id, { 
        status: 'revision_required',
        decision: {
          status: 'revision',
          comments: 'The editor has requested a revision of this submission. Please use the resubmission portal to submit your revised manuscript.',
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleResubmissionPortal = () => {
    setShowResubmissionPortal(!showResubmissionPortal);
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
                <Button variant="outline" onClick={() => {
                  toast({
                    title: "Assign Reviewers",
                    description: "This would open a dialog to assign reviewers in a real application.",
                  });
                }}>
                  <Users className="mr-2 h-4 w-4" /> Assign Reviewers
                </Button>
              </div>
            )}
            
            {isEditor && submission.status === "under_review" && (
              <div className="flex gap-2 flex-wrap justify-end">
                <Button variant="outline" className="bg-yellow-50 text-yellow-600 hover:bg-yellow-100 border-yellow-200" onClick={handleActivateResubmission}>
                  <RotateCw className="mr-2 h-4 w-4" /> Request Revisions
                </Button>
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
            )}
            
            {isAdmin && submission.status === "under_review" && (
              <div className="flex gap-2 mt-2 md:mt-0">
                <Button 
                  variant="outline" 
                  className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
                  onClick={handleActivateResubmission}
                >
                  <LockOpen className="mr-2 h-4 w-4" /> Activate Resubmission Portal
                </Button>
              </div>
            )}
            
            {isReviewer && submission.status === "under_review" && (
              <div className="flex gap-2">
                <Button onClick={() => navigate(`/reviews/${submission.id}`)}>
                  <FileText className="mr-2 h-4 w-4" /> Submit Review
                </Button>
                <Button variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-200" onClick={handleActivateResubmission}>
                  <LockOpen className="mr-2 h-4 w-4" /> Request Revision
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
                <SubmissionFeedbackTab decision={submission.decision} formatDate={formatDate} />
              </TabsContent>
            )}
            
            {submission.decision && (
              <TabsContent value="decision" className="mt-6">
                <SubmissionDecisionTab decision={submission.decision} formatDate={formatDate} />
              </TabsContent>
            )}
          </Tabs>
        </>
      )}
    </div>
  );
};

export default SubmissionDetailPage;
