
import React from "react";
import { Submission, User } from "@/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, Users, Tag } from "lucide-react";
import SubmissionStatusBadge from "./SubmissionStatusBadge";

interface SubmissionDetailsViewProps {
  submission: Submission;
  formatDate: (date?: string) => string;
  user: User | null;
}

const SubmissionDetailsView: React.FC<SubmissionDetailsViewProps> = ({ 
  submission, 
  formatDate,
  user
}) => {
  return (
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
  );
};

export default SubmissionDetailsView;
