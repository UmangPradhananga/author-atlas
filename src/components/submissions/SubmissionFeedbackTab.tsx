
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SubmissionFeedbackTabProps {
  decision?: {
    status: 'accept' | 'reject' | 'revision';
    comments: string;
    date: string;
  };
  formatDate: (date?: string) => string;
}

const SubmissionFeedbackTab: React.FC<SubmissionFeedbackTabProps> = ({
  decision,
  formatDate,
}) => {
  if (!decision) {
    return (
      <div className="text-center py-6">
        <p>No feedback available.</p>
      </div>
    );
  }
  
  return (
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
            <p className="whitespace-pre-wrap">{decision.comments}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Decision Date</h3>
            <p>{formatDate(decision.date)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubmissionFeedbackTab;
