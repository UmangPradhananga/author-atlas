
import React from "react";
import { Submission } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SubmissionDetailsProps {
  submission: Submission;
}

const SubmissionDetails: React.FC<SubmissionDetailsProps> = ({ submission }) => {
  return (
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
  );
};

export default SubmissionDetails;
