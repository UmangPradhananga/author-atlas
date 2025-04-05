
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SubmissionDecisionTabProps {
  decision?: {
    status: 'accept' | 'reject' | 'revision';
    comments: string;
    date: string;
  };
  formatDate: (date?: string) => string;
}

const SubmissionDecisionTab: React.FC<SubmissionDecisionTabProps> = ({
  decision,
  formatDate,
}) => {
  if (!decision) {
    return (
      <div className="text-center py-6">
        <p>No decision has been made yet.</p>
      </div>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Editor's Decision</CardTitle>
        <CardDescription>
          Decision made on {formatDate(decision.date)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Decision</h3>
            <Badge className={
              decision.status === 'accept' 
                ? 'bg-green-100 text-green-800 border-green-200'
                : decision.status === 'reject'
                  ? 'bg-red-100 text-red-800 border-red-200'
                  : 'bg-yellow-100 text-yellow-800 border-yellow-200'
            }>
              {decision.status === 'accept' 
                ? 'Accept'
                : decision.status === 'reject'
                  ? 'Reject'
                  : 'Revision Required'
              }
            </Badge>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Comments</h3>
            <p className="whitespace-pre-wrap">{decision.comments}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubmissionDecisionTab;
