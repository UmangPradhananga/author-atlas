
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Submission, ResubmissionDetails } from "@/types";
import { Separator } from "@/components/ui/separator";
import { Calendar, FileText, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SubmissionFeedbackTabProps {
  decision?: {
    status: 'accept' | 'reject' | 'revision';
    comments: string;
    date: string;
  };
  formatDate: (date?: string) => string;
  resubmissionDetails?: ResubmissionDetails;
}

const SubmissionFeedbackTab: React.FC<SubmissionFeedbackTabProps> = ({
  decision,
  formatDate,
  resubmissionDetails,
}) => {
  if (!decision) {
    return (
      <div className="text-center py-6">
        <p>No feedback available.</p>
      </div>
    );
  }
  
  const isMinorRevision = decision.comments.includes("minor revision");
  const isMajorRevision = decision.comments.includes("major revision");
  
  const revisionType = isMinorRevision ? "Minor Revisions" : isMajorRevision ? "Major Revisions" : "Revisions";
  
  return (
    <div className="space-y-6">
      <Alert className="bg-amber-50 border-amber-200">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        <AlertTitle className="text-amber-700">{revisionType} Required</AlertTitle>
        <AlertDescription className="text-amber-600">
          Please carefully review the feedback below and submit your revised manuscript.
        </AlertDescription>
      </Alert>
      
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

      {resubmissionDetails && (
        <Card>
          <CardHeader>
            <CardTitle>Revision History</CardTitle>
            <CardDescription>
              Details of your manuscript revision
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Resubmitted on:</span>
                </div>
                <span>{formatDate(resubmissionDetails.resubmissionDate)}</span>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-semibold mb-2">Summary of Changes</h3>
                <p className="whitespace-pre-wrap">{resubmissionDetails.changesSummary}</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Response to Reviewers</h3>
                <p className="whitespace-pre-wrap">{resubmissionDetails.responseToReviewers}</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold">Document Versions</h3>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm" className="justify-start" asChild>
                    <a href="#" target="_blank" rel="noopener noreferrer">
                      <FileText className="mr-2 h-4 w-4" /> Current Version
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start" asChild>
                    <a href={resubmissionDetails.previousVersion} target="_blank" rel="noopener noreferrer">
                      <FileText className="mr-2 h-4 w-4" /> Previous Version
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SubmissionFeedbackTab;
