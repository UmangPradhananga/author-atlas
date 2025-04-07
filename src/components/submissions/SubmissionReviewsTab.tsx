
import React from "react";
import { Review, SubmissionStatus, PeerReviewType } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

interface SubmissionReviewsTabProps {
  reviews: Review[];
  submissionStatus: SubmissionStatus;
  formatDate: (date?: string) => string;
  isEditor: boolean;
  isReviewer: boolean;
  peerReviewType: PeerReviewType;
}

const SubmissionReviewsTab: React.FC<SubmissionReviewsTabProps> = ({
  reviews,
  submissionStatus,
  formatDate,
  isEditor,
  isReviewer,
  peerReviewType,
}) => {
  // Helper function to get appropriate label for criteria
  const getCriteriaLabel = (key: string, isEditorReview: boolean): string => {
    if (isEditorReview) {
      // Editor review criteria
      switch (key) {
        case 'overall': return 'Overall Assessment';
        case 'novelty': return 'Novelty & Innovation';
        case 'importance': return 'Importance to Field';
        case 'presentation': return 'Presentation Quality';
        case 'techQuality': return 'Technical Quality';
        default: return key.charAt(0).toUpperCase() + key.slice(1);
      }
    } else {
      // Regular reviewer criteria
      switch (key) {
        case 'methodology': return 'Research Methodology';
        case 'relevance': return 'Relevance to Field';
        case 'clarity': return 'Clarity & Presentation';
        case 'originality': return 'Originality & Innovation';
        case 'overall': return 'Overall Assessment';
        default: return key.charAt(0).toUpperCase() + key.slice(1);
      }
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
        tooltipContent = "Both authors and reviewers know each other's identities";
        break;
      case 'single_blind':
        tooltipContent = "Reviewers know author identities, but authors don't know reviewers";
        break;
      case 'double_blind':
        tooltipContent = "Both authors and reviewers remain anonymous to each other";
        break;
    }
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center cursor-help">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                {getPeerReviewLabel(type)}
              </Badge>
              <Info className="ml-1 h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">{tooltipContent}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium mb-2">No Reviews Yet</h3>
        <p className="text-muted-foreground mb-4">
          {submissionStatus === 'draft' || submissionStatus === 'submitted'
            ? "This submission hasn't been assigned for review yet."
            : "No reviews have been submitted for this manuscript."}
        </p>
        <div className="flex justify-center">
          {renderReviewTypeTooltip(peerReviewType)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <div className="text-lg font-medium">
          Peer Review Process:
        </div>
        {renderReviewTypeTooltip(peerReviewType)}
      </div>
      
      {reviews.map((review) => {
        // Determine if this is an editor review by looking at a unique editor criterion
        const isEditorReview = review.criteria && 
                             (review.criteria.hasOwnProperty('novelty') || 
                              review.criteria.hasOwnProperty('importance') ||
                              review.criteria.hasOwnProperty('techQuality'));
        
        return (
          <Card key={review.id} className="transition-all">
            <CardHeader>
              <CardTitle className="flex justify-between">
                <span>
                  {isEditorReview ? "Editorial Assessment" : "Review"} #{review.id.split('-')[1]}
                </span>
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
                      <h3 className="font-semibold mb-2">
                        {isEditorReview ? "Confidential Comments" : "Private Comments for Editor"}
                      </h3>
                      <p className="whitespace-pre-wrap">{review.privateComments}</p>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="font-semibold mb-2">Ratings</h3>
                    <div className="space-y-4">
                      {Object.entries(review.criteria).map(([key, rating]) => {
                        // Convert old 5-scale ratings to 10-scale if needed
                        const displayRating = rating <= 5 && key !== 'overall' ? rating * 2 : rating;
                        const percentage = (displayRating / 10) * 100;
                        
                        return (
                          <div key={key} className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">
                                {getCriteriaLabel(key, isEditorReview)}
                              </span>
                              <span className="text-sm font-medium">{displayRating}/10</span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">
                      {isEditorReview ? "Editorial Decision" : "Recommendation"}
                    </h3>
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
        );
      })}
    </div>
  );
};

export default SubmissionReviewsTab;
