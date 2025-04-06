
import { useState, useEffect } from "react";
import { submissionsApi } from "@/api/apiService";
import { useAuth } from "@/context/AuthContext";
import { Submission, PeerReviewType } from "@/types";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Clock, User, Info } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const ReviewsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [peerReviewFilter, setPeerReviewFilter] = useState<string>("all");

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

  // Filter submissions based on peer review type
  useEffect(() => {
    if (!submissions) {
      setFilteredSubmissions([]);
      return;
    }

    if (peerReviewFilter === "all") {
      setFilteredSubmissions(submissions);
    } else {
      setFilteredSubmissions(
        submissions.filter(
          (submission) => submission.peerReviewType === peerReviewFilter
        )
      );
    }
  }, [peerReviewFilter, submissions]);

  // If not a reviewer or editor, redirect to dashboard
  if (user && user.role !== "reviewer" && user.role !== "editor" && user.role !== "admin") {
    navigate("/dashboard");
    return null;
  }

  const pendingReviews = filteredSubmissions.filter(submission => 
    submission.status === "under_review" && 
    submission.reviews?.some(review => !review.completed)
  );

  const completedReviews = filteredSubmissions.filter(submission => 
    submission.reviews?.some(review => review.completed)
  );

  const assignableSubmissions = filteredSubmissions.filter(submission => 
    submission.status === "submitted" && 
    (user?.role === "editor" || user?.role === "admin")
  );

  // Get corresponding review for a submission for the current reviewer
  const getReviewForSubmission = (submission: Submission) => {
    if (!user || !submission.reviews) return undefined;
    return submission.reviews.find(review => review.reviewerId === user.id);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  const getPeerReviewLabel = (type: PeerReviewType): string => {
    switch (type) {
      case 'open': return 'Open Review';
      case 'single_blind': return 'Single-Blind';
      case 'double_blind': return 'Double-Blind';
      default: return type;
    }
  };

  const renderReviewTypeTooltip = (type: PeerReviewType) => {
    let tooltipContent = '';
    switch (type) {
      case 'open':
        tooltipContent = 'Both authors and reviewers know each others identities';
        break;
      case 'single_blind':
        tooltipContent = 'Reviewers know author identities, but authors dont know reviewers';
        break;
      case 'double_blind':
        tooltipContent = 'Both authors and reviewers remain anonymous to each other';
        break;
    }
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-help">
              {getPeerReviewLabel(type)}
              <Info className="ml-1 h-3 w-3" />
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">{tooltipContent}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const renderSubmissionCard = (submission: Submission) => {
    const review = getReviewForSubmission(submission);
    const isDueSoon = review && !review.completed && new Date(review.dueDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const isOverdue = review && !review.completed && new Date(review.dueDate) < new Date();

    return (
      <Card key={submission.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg line-clamp-1">{submission.title}</CardTitle>
            {review && (
              review.completed ? (
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              ) : isOverdue ? (
                <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Overdue
                </Badge>
              ) : isDueSoon ? (
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                  <Clock className="h-3 w-3 mr-1" />
                  Due Soon
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                  <Clock className="h-3 w-3 mr-1" />
                  Assigned
                </Badge>
              )
            )}
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {submission.abstract}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1 text-muted-foreground" />
              <span className="text-sm">
                {submission.authors.slice(0, 2).join(', ')}
                {submission.authors.length > 2 && ' et al.'}
              </span>
            </div>
            {renderReviewTypeTooltip(submission.peerReviewType)}
            {review && (
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                <span className="text-sm">Due: {formatDate(review.dueDate)}</span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            variant="outline" 
            size="sm"
            className="w-full"
            onClick={() => navigate(`/reviews/${submission.id}`)}
          >
            {review?.completed ? 'View Review' : 'Review Manuscript'}
          </Button>
        </CardFooter>
      </Card>
    );
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
        <>
          <div className="flex justify-between items-center">
            <div className="w-64">
              <Select
                value={peerReviewFilter}
                onValueChange={setPeerReviewFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by review type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Review Types</SelectItem>
                  <SelectItem value="open">Open Review</SelectItem>
                  <SelectItem value="single_blind">Single-Blind Review</SelectItem>
                  <SelectItem value="double_blind">Double-Blind Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

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
                  {pendingReviews.map(renderSubmissionCard)}
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
                  {completedReviews.map(renderSubmissionCard)}
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
                    {assignableSubmissions.map(renderSubmissionCard)}
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
        </>
      )}
    </div>
  );
};

export default ReviewsPage;
