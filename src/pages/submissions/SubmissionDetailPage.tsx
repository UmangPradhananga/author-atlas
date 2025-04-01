
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
import { SubmissionStatus } from "@/types";
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
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import SubmissionStatusBadge from "@/components/submissions/SubmissionStatusBadge";

const SubmissionDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { getSubmissionById, updateSubmission, submitForReview } = useSubmissions();
  const [activeTab, setActiveTab] = useState("details");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const submission = id ? getSubmissionById(id) : undefined;
  const isAuthor = user?.id === submission?.correspondingAuthor;
  const isEditor = user?.role === "editor" || user?.role === "admin";
  const isReviewer = user?.role === "reviewer" && submission?.reviewers?.includes(user.id);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMMM d, yyyy");
    } catch (e) {
      return "N/A";
    }
  };

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

  return (
    <div className="space-y-6">
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
            <Button variant="outline" onClick={() => navigate(`/submissions/${submission.id}/revise`)}>
              <Edit className="mr-2 h-4 w-4" /> Submit Revision
            </Button>
          </div>
        )}
        
        {isEditor && submission.status === "submitted" && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => {
              // In a real app, this would open a dialog to assign reviewers
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
          <div className="flex gap-2">
            <Button variant="outline" className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200" onClick={() => {
              // In a real app, this would update the submission status
              toast({
                title: "Request Revisions",
                description: "This would request revisions from the author in a real application.",
              });
            }}>
              <Edit className="mr-2 h-4 w-4" /> Request Revisions
            </Button>
            <Button variant="outline" className="bg-green-50 text-green-600 hover:bg-green-100 border-green-200" onClick={() => {
              // In a real app, this would update the submission status
              toast({
                title: "Accept Submission",
                description: "This would accept the submission in a real application.",
              });
            }}>
              <ThumbsUp className="mr-2 h-4 w-4" /> Accept
            </Button>
            <Button variant="outline" className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200" onClick={() => {
              // In a real app, this would update the submission status
              toast({
                title: "Reject Submission",
                description: "This would reject the submission in a real application.",
              });
            }}>
              <ThumbsDown className="mr-2 h-4 w-4" /> Reject
            </Button>
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          {submission.status === "revision_required" && (
            <TabsTrigger value="feedback">Editor Feedback</TabsTrigger>
          )}
          {submission.decision && (
            <TabsTrigger value="decision">Decision</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="details" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-6 md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Abstract</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{submission.abstract}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Authors</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {submission.authors.map((author, index) => (
                      <li key={index} className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>
                          {author}
                          {submission.correspondingAuthor === user?.id && index === 0 && (
                            <Badge variant="outline" className="ml-2">Corresponding Author</Badge>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cover Letter</CardTitle>
                </CardHeader>
                <CardContent>
                  {submission.coverLetter ? (
                    <p className="whitespace-pre-wrap">{submission.coverLetter}</p>
                  ) : (
                    <p className="text-muted-foreground italic">No cover letter provided.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Manuscript</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full" asChild>
                    <a href={submission.document} target="_blank" rel="noopener noreferrer">
                      <FileText className="mr-2 h-4 w-4" /> View Manuscript
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Keywords</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {submission.keywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm text-muted-foreground">Category</dt>
                      <dd className="flex items-center">
                        <Tag className="h-4 w-4 mr-1 text-muted-foreground" /> {submission.category}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Submission Date</dt>
                      <dd className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-muted-foreground" /> {formatDate(submission.submittedDate)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Last Updated</dt>
                      <dd className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-muted-foreground" /> {formatDate(submission.updatedDate)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Status</dt>
                      <dd>
                        <SubmissionStatusBadge status={submission.status} />
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="reviews" className="space-y-6 mt-6">
          {submission.reviews && submission.reviews.length > 0 ? (
            <div className="space-y-6">
              {submission.reviews.map((review) => (
                <Card key={review.id}>
                  <CardHeader>
                    <CardTitle className="flex justify-between">
                      <span>Review #{review.id.split('-')[1]}</span>
                      {review.completed ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Completed</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                          <Clock className="h-3 w-3 mr-1" /> Pending
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {review.completed 
                        ? `Submitted on ${formatDate(review.submittedDate)}`
                        : `Due on ${formatDate(review.dueDate)}`
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {review.completed ? (
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold mb-2">Comments</h3>
                          <p className="whitespace-pre-wrap">{review.comments}</p>
                        </div>
                        
                        {(isEditor || isReviewer) && review.privateComments && (
                          <div>
                            <h3 className="font-semibold mb-2">Private Comments for Editor</h3>
                            <p className="whitespace-pre-wrap">{review.privateComments}</p>
                          </div>
                        )}
                        
                        <div>
                          <h3 className="font-semibold mb-2">Ratings</h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2">
                            <div>
                              <p className="text-sm text-muted-foreground">Methodology</p>
                              <p className="font-medium">{review.criteria.methodology}/5</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Relevance</p>
                              <p className="font-medium">{review.criteria.relevance}/5</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Clarity</p>
                              <p className="font-medium">{review.criteria.clarity}/5</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Originality</p>
                              <p className="font-medium">{review.criteria.originality}/5</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Overall Rating</p>
                              <p className="font-medium">{review.criteria.overall}/5</p>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="font-semibold mb-2">Decision</h3>
                          <Badge className={
                            review.decision === 'accept' 
                              ? 'bg-green-100 text-green-800 border-green-200'
                              : review.decision === 'reject'
                                ? 'bg-red-100 text-red-800 border-red-200'
                                : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                          }>
                            {review.decision === 'accept' 
                              ? 'Accept'
                              : review.decision === 'minor_revisions'
                                ? 'Minor Revisions'
                                : review.decision === 'major_revisions'
                                  ? 'Major Revisions'
                                  : review.decision === 'reject'
                                    ? 'Reject'
                                    : 'No Decision'
                            }
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <Clock className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">
                          This review has not been completed yet.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">No Reviews Yet</h3>
              <p className="text-muted-foreground">
                {submission.status === 'draft' || submission.status === 'submitted'
                  ? "This submission hasn't been assigned for review yet."
                  : "No reviews have been submitted for this manuscript."}
              </p>
            </div>
          )}
        </TabsContent>
        
        {submission.status === "revision_required" && (
          <TabsContent value="feedback" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Revision Required</CardTitle>
                <CardDescription>
                  The editor has requested revisions for your submission
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Editor Comments</h3>
                    <p className="whitespace-pre-wrap">{submission.decision?.comments}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Decision Date</h3>
                    <p>{formatDate(submission.decision?.date)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
        
        {submission.decision && (
          <TabsContent value="decision" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Editor's Decision</CardTitle>
                <CardDescription>
                  Decision made on {formatDate(submission.decision.date)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Decision</h3>
                    <Badge className={
                      submission.decision.status === 'accept' 
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : submission.decision.status === 'reject'
                          ? 'bg-red-100 text-red-800 border-red-200'
                          : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                    }>
                      {submission.decision.status === 'accept' 
                        ? 'Accept'
                        : submission.decision.status === 'reject'
                          ? 'Reject'
                          : 'Revision Required'
                      }
                    </Badge>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Comments</h3>
                    <p className="whitespace-pre-wrap">{submission.decision.comments}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default SubmissionDetailPage;
