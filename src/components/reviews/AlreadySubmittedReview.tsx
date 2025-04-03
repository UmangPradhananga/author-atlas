
import React from "react";

interface AlreadySubmittedReviewProps {
  isEditor?: boolean;
}

const AlreadySubmittedReview: React.FC<AlreadySubmittedReviewProps> = ({ isEditor }) => {
  return (
    <div className="text-center py-8 bg-muted rounded-lg">
      <h3 className="text-xl font-medium mb-2">Review Already Submitted</h3>
      <p className="text-muted-foreground mb-6">
        {isEditor 
          ? "This review has been submitted and recorded in the system." 
          : "You have already submitted your review for this manuscript."}
      </p>
    </div>
  );
};

export default AlreadySubmittedReview;
