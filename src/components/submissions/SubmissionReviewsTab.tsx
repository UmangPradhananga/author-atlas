
import React from "react";
import { Review, SubmissionStatus } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface SubmissionReviewsTabProps {
  reviews: Review[];
  submissionStatus: SubmissionStatus;
  formatDate: (date?: string) => string;
  isEditor: boolean;
  isReviewer: boolean;
}

const SubmissionReviewsTab: React.FC<SubmissionReviewsTabProps> = ({
  reviews,
  submissionStatus,
  formatDate,
  isEditor,
  isReviewer,
}) => {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium mb-2">No Reviews Yet</h3>
        <p className="text-muted-foreground">
          {submissionStatus === 'draft' || submissionStatus === 'submitted'
            ? "This submission hasn't been assigned for review yet."
            : "No reviews have been submitted for this manuscript."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <Card key={review.id} className="transition-all">
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
  );
};

export default SubmissionReviewsTab;
