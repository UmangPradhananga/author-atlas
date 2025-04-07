
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { submissionsApi } from "@/api/apiService";
import { reviewsApi } from "@/api/reviewsApi";
import { Submission, Review, ReviewDecision } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ChevronLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useSubmissions } from "@/context/SubmissionContext";

const SubmissionReviewPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updateSubmission } = useSubmissions();

  // Form data for the review
  const [formData, setFormData] = useState<Partial<Review>>({
    decision: undefined,
    comments: '',
    privateComments: '',
    criteria: {
      methodology: 0,
      relevance: 0,
      clarity: 0,
      originality: 0,
      overall: 0,
    },
  });

  useEffect(() => {
    const fetchSubmissionDetails = async () => {
      if (!id || !user) return;

      try {
        // Fetch submission details
        const fetchedSubmission = await submissionsApi.getSubmissionById(id);
        
        if (!fetchedSubmission) {
          throw new Error("Submission not found");
        }
        
        setSubmission(fetchedSubmission);
        
        // Check if there's an existing review by this reviewer
        if (fetchedSubmission.reviews) {
          const existingReview = fetchedSubmission.reviews.find(
            r => r.reviewerId === user.id
          );
          
          if (existingReview) {
            setReview(existingReview);
            setFormData({
              decision: existingReview.decision,
              comments: existingReview.comments,
              privateComments: existingReview.privateComments || '',
              criteria: existingReview.criteria,
            });
          }
        }
      } catch (err) {
        console.error("Error fetching submission details:", err);
        setError("Failed to load submission details");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissionDetails();
  }, [id, user]);

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

  const handleCriteriaChange = (criterion: string, value: number[]) => {
    setFormData({
      ...formData,
      criteria: {
        ...formData.criteria!,
        [criterion]: value[0]
      }
    });
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDecisionChange = (value: string) => {
    setFormData({ ...formData, decision: value as ReviewDecision });
  };

  const handleSubmitReview = async () => {
    if (!submission || !user || !formData.decision) {
      toast({
        title: "Missing Information",
        description: "Please complete all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare review data
      const reviewToSubmit = {
        ...(review || {}),  // Use existing review data if available
        ...formData,
        submissionId: submission.id,
        reviewerId: user.id,
        completed: true,
        submittedDate: new Date().toISOString(),
      };
      
      // Submit the review
      const submittedReview = await reviewsApi.submitReview(
        submission.id, 
        reviewToSubmit
      );
      
      setReview(submittedReview);
      
      // If the decision is minor or major revisions, update the submission status
      if (formData.decision === "minor_revisions" || formData.decision === "major_revisions") {
        if (submission) {
          // Prepare decision message based on revision type
          const decisionMessage = formData.decision === "minor_revisions" 
            ? "The reviewer has suggested minor revisions. Please submit a revised version addressing the comments."
            : "The reviewer has requested major revisions. Please carefully address all concerns and submit a revised version.";
          
          // Update submission with revision_required status
          await updateSubmission(submission.id, {
            status: 'revision_required',
            decision: {
              status: 'revision',
              comments: decisionMessage,
              date: new Date().toISOString()
            }
          });
        }
      }
      
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p>Loading submission details...</p>
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

  const renderRatingLabel = (value: number) => {
    if (value === 0) return 'Not Rated';
    if (value === 1) return 'Poor (1)';
    if (value === 2) return 'Fair (2)';
    if (value === 3) return 'Good (3)';
    if (value === 4) return 'Very Good (4)';
    if (value === 5) return 'Excellent (5)';
    return `${value}`;
  };

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
      
      {review?.completed ? (
        <div className="text-center py-8 bg-muted rounded-lg">
          <h3 className="text-xl font-medium mb-2">Review Already Submitted</h3>
          <p className="text-muted-foreground mb-6">
            You have already submitted your review for this manuscript.
          </p>
        </div>
      ) : (
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSubmitReview(); }}>
          <Card>
            <CardHeader>
              <CardTitle>Rating Criteria</CardTitle>
              <CardDescription>
                Rate each aspect of the manuscript on a scale of 1-5.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Research Methodology</Label>
                    <span className="text-sm">
                      {renderRatingLabel(formData.criteria!.methodology)}
                    </span>
                  </div>
                  <Slider
                    value={[formData.criteria!.methodology]}
                    min={0}
                    max={5}
                    step={1}
                    onValueChange={(value) => handleCriteriaChange('methodology', value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Relevance to Field</Label>
                    <span className="text-sm">
                      {renderRatingLabel(formData.criteria!.relevance)}
                    </span>
                  </div>
                  <Slider
                    value={[formData.criteria!.relevance]}
                    min={0}
                    max={5}
                    step={1}
                    onValueChange={(value) => handleCriteriaChange('relevance', value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Clarity & Presentation</Label>
                    <span className="text-sm">
                      {renderRatingLabel(formData.criteria!.clarity)}
                    </span>
                  </div>
                  <Slider
                    value={[formData.criteria!.clarity]}
                    min={0}
                    max={5}
                    step={1}
                    onValueChange={(value) => handleCriteriaChange('clarity', value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Originality & Innovation</Label>
                    <span className="text-sm">
                      {renderRatingLabel(formData.criteria!.originality)}
                    </span>
                  </div>
                  <Slider
                    value={[formData.criteria!.originality]}
                    min={0}
                    max={5}
                    step={1}
                    onValueChange={(value) => handleCriteriaChange('originality', value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Overall Assessment</Label>
                    <span className="text-sm">
                      {renderRatingLabel(formData.criteria!.overall)}
                    </span>
                  </div>
                  <Slider
                    value={[formData.criteria!.overall]}
                    min={0}
                    max={5}
                    step={1}
                    onValueChange={(value) => handleCriteriaChange('overall', value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Review Comments</CardTitle>
              <CardDescription>
                Provide your feedback on the manuscript.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="comments">Comments to Author</Label>
                <Textarea
                  id="comments"
                  name="comments"
                  value={formData.comments}
                  onChange={handleTextChange}
                  placeholder="Enter your comments for the author"
                  className="min-h-32"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  These comments will be visible to the author.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="privateComments">Private Comments to Editor</Label>
                <Textarea
                  id="privateComments"
                  name="privateComments"
                  value={formData.privateComments}
                  onChange={handleTextChange}
                  placeholder="Enter your private comments for the editor"
                  className="min-h-24"
                />
                <p className="text-xs text-muted-foreground">
                  These comments will only be visible to editors.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="decision">Recommendation</Label>
                <Select
                  value={formData.decision}
                  onValueChange={handleDecisionChange}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your recommendation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="accept">Accept</SelectItem>
                    <SelectItem value="minor_revisions">Accept with Minor Revisions</SelectItem>
                    <SelectItem value="major_revisions">Major Revisions Required</SelectItem>
                    <SelectItem value="reject">Reject</SelectItem>
                  </SelectContent>
                </Select>
                {(formData.decision === "minor_revisions" || formData.decision === "major_revisions") && (
                  <p className="text-xs text-amber-600 mt-1">
                    This will automatically activate the resubmission portal for the author.
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}
    </div>
  );
};

export default SubmissionReviewPage;
