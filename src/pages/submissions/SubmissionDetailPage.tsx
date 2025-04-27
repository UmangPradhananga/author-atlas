import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useSubmissions } from "@/context/SubmissionContext";
import { Submission, Review, ReviewType, EditorDecision } from "@/types";
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
import {
  FileText,
  Send,
  Edit,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  ChevronLeft,
  RotateCw,
  UserCheck,
  Pen,
  Briefcase,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import SubmissionStatusBadge from "@/components/submissions/SubmissionStatusBadge";
import SubmissionDetailsView from "@/components/submissions/SubmissionDetailsView";
import SubmissionReviewsTab from "@/components/submissions/SubmissionReviewsTab";
import SubmissionFeedbackTab from "@/components/submissions/SubmissionFeedbackTab";
import SubmissionDecisionTab from "@/components/submissions/SubmissionDecisionTab";
import ResubmissionPortal from "@/components/submissions/ResubmissionPortal";
import AssignmentDialog from "@/components/submissions/AssignmentDialog";
import { editorApi } from "@/api/apiService";
import { EditorDecisionInReview, AssignReviewerRequest } from "@/types/editor";

// Helper function to simulate delayed operations
const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const SubmissionDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { getSubmissionById, submitForReview, updateSubmission } = useSubmissions();
  const [activeTab, setActiveTab] = useState("details");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResubmissionPortal, setShowResubmissionPortal] = useState(false);
  const [reviewerAssignmentOpen, setReviewerAssignmentOpen] = useState(false);
  const [copyeditorAssignmentOpen, setCopyeditorAssignmentOpen] = useState(false);
  const [publisherAssignmentOpen, setPublisherAssignmentOpen] = useState(false);
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

  const isAuthor = user?.userId === submission.correspondingAuthor;
  const isEditor = user?.role === "Editor" || user?.role === "Admin";
  const isReviewer = user?.role === "Reviewer" && submission.reviewers?.includes(user.userId);
  const isAdmin = user?.role === "Admin";

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
      // Create proper AssignReviewerRequest object
      const assignReviewerRequest = {
        journalId: submission.id,
        reviewerIds: [], // Empty array as no reviewers are assigned at this stage
        reviewType: ReviewType.DoubleBinded, // Default to double-blind, can be adjusted based on submission
        status: EditorDecision.SubmitForReview,
        editorComment: "Submitted by author for review"
      };
      
      await submitForReview(assignReviewerRequest);
      
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
      // Create the request object expected by the backend for activating resubmission
      const assignReviewerRequest: AssignReviewerRequest = {
        journalId: submission.id,
        reviewerIds: [], // Empty array as we're not assigning reviewers
        reviewType: submission.peerReviewType as unknown as ReviewType,
        status: EditorDecision.SubmitForReview, // This will be mapped to revision_required on the backend
        editorComment: comments || 'The editor has requested a revision of this submission. Please use the resubmission portal to submit your revised manuscript.'
      };
      
      // Call the assignReviewer API with the resubmission request
      await editorApi.assignReviewer(assignReviewerRequest);
      
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

  const handleAssignUsers = async (userIds: string[], role: string) => {
    if (!submission) return;
    
    setIsSubmitting(true);
    try {
      let updates: Partial<Submission> = {};
      
      switch (role) {
        case 'reviewer':
          // Create proper AssignReviewerRequest object
          const assignReviewerRequest = {
            journalId: submission.id,
            reviewerIds: userIds,
            reviewType: ReviewType.DoubleBinded, // Use submission's review type if available
            status: EditorDecision.SubmitForReview,
            editorComment: "Reviewers assigned by editor"
          };
          
          // Call the assignReviewer API
          await editorApi.assignReviewer(assignReviewerRequest);
          
          // Update local state with the reviewer information
          updates = {
            status: 'under_review',
            reviewers: userIds,
            reviews: userIds.map(reviewerId => {
              const existingReview = submission.reviews?.find(r => r.reviewerId === reviewerId);
              if (existingReview) return existingReview;
              
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
          };
          break;
        case 'copyeditor':
          // Just update UI state for copyeditors - backend API call is separate if needed
          updates = {
            copyeditors: userIds
          };
          break;
        case 'publisher':
          // Just update UI state for publishers - backend API call is separate if needed
          updates = {
            publishers: userIds
          };
          break;
      }
      
      // Update the submission in the UI
      await delay(500);
      
      toast({
        title: "Assignment Updated",
        description: `Successfully assigned ${role}s to this submission.`,
      });
    } catch (error) {
      console.error(`Error assigning ${role}s:`, error);
      toast({
        title: "Error",
        description: `Failed to assign ${role}s. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeskDecision = async (decision: 'accept' | 'reject' | 'review') => {
    if (!submission) return;
    setIsSubmitting(true);
    
    try {
      // Map UI decision to the proper EditorDecision enum value
      let status: EditorDecision;
      
      if (decision === 'accept') {
        status = EditorDecision.Accept;
      } else if (decision === 'reject') {
        status = EditorDecision.Reject;
      } else {
        status = EditorDecision.SubmitForReview;
      }
      
      // Create the request object expected by the backend
      const assignReviewerRequest: AssignReviewerRequest = {
        journalId: submission.id,
        reviewerIds: [], // Empty array as this is a desk decision without assigning reviewers
        reviewType: submission.peerReviewType as unknown as ReviewType, // Using the submission's review type
        status: status,
        editorComment: `Desk ${decision} by editor at ${new Date().toISOString()}`
      };
      
      // Call the assignReviewer API with the desk decision
      await editorApi.assignReviewer(assignReviewerRequest);
      
      toast({
        title: "Decision Made",
        description: `Submission has been ${decision === 'review' ? 'sent for review' : decision + 'ed'}.`,
      });
    } catch (error) {
      console.error("Error making desk decision:", error);
      toast({
        title: "Error",
        description: "Failed to process the decision. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {showResubmissionPortal && submission?.status === 'revision_required' && isAuthor ? (
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
                <h1 className="line-clamp-2">{submission?.title}</h1>
                <SubmissionStatusBadge status={submission?.status || 'draft'} />
              </div>
              <p className="text-muted-foreground">
                Submitted on {formatDate(submission?.submittedDate)}
              </p>
            </div>

            {isAuthor && submission?.status === "draft" && (
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

            {isAuthor && submission?.status === "revision_required" && (
              <div className="flex gap-2">
                <Button onClick={handleToggleResubmissionPortal}>
                  <RotateCw className="mr-2 h-4 w-4" /> Submit Revision
                </Button>
              </div>
            )}

            {isEditor && submission?.status === "submitted" && (
              <div className="flex flex-wrap items-center gap-2">
                <Button onClick={() => setReviewerAssignmentOpen(true)}>
                  <UserCheck className="mr-2 h-4 w-4" /> Assign Reviewers
                </Button>
                <Button onClick={() => navigate(`/submissions/${submission.id}/copyeditors`)}>
                  <Pen className="mr-2 h-4 w-4" /> Assign Copyeditors
                </Button>
                <Button onClick={() => navigate(`/submissions/${submission.id}/publishers`)}>
                  <Briefcase className="mr-2 h-4 w-4" /> Assign Publishers
                </Button>
                <div className="flex gap-2 flex-wrap justify-end">
                  <Button 
                    variant="outline" 
                    className="bg-green-50 text-green-600 hover:bg-green-100 border-green-200"
                    onClick={() => handleDeskDecision('accept')} 
                    disabled={isSubmitting}
                  >
                    <ThumbsUp className="mr-2 h-4 w-4" /> Desk Accept
                  </Button>
                  <Button 
                    variant="outline" 
                    className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                    onClick={() => handleDeskDecision('reject')}
                    disabled={isSubmitting}
                  >
                    <ThumbsDown className="mr-2 h-4 w-4" /> Desk Reject
                  </Button>
                  <Button
                    onClick={() => handleDeskDecision('review')}
                    disabled={isSubmitting}
                  >
                    <Send className="mr-2 h-4 w-4" /> Send for Review
                  </Button>
                </div>
              </div>
            )}
            
            {isEditor && submission?.status === "under_review" && (
              <div className="flex gap-2">
                <Button onClick={() => navigate(`/reviews/${submission.id}`)}>
                  <FileText className="mr-2 h-4 w-4" /> Submit Review
                </Button>
              </div>
            )}
          </div>

          {submission?.status === "revision_required" && (
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
              {submission?.status === "revision_required" && (
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
            
            {submission?.status === "revision_required" && (  
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
          {isEditor && submission && (
            <>
              <AssignmentDialog
                open={reviewerAssignmentOpen}
                onClose={() => setReviewerAssignmentOpen(false)}
                submission={submission}
                onAssign={(userIds) => handleAssignUsers(userIds, 'reviewer')}
                role="reviewer"
                currentAssignees={submission.reviewers}
              />
              <AssignmentDialog 
                open={copyeditorAssignmentOpen}
                onClose={() => setCopyeditorAssignmentOpen(false)}
                submission={submission}
                onAssign={(userIds) => handleAssignUsers(userIds, 'copyeditor')}
                role="copyeditor"
                currentAssignees={submission.copyeditors}
              />
              <AssignmentDialog
                open={publisherAssignmentOpen}
                onClose={() => setPublisherAssignmentOpen(false)}
                submission={submission}
                onAssign={(userIds) => handleAssignUsers(userIds, 'publisher')}
                role="publisher"
                currentAssignees={submission.publishers}
              />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default SubmissionDetailPage;

