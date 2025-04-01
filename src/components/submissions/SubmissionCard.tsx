
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users } from "lucide-react";
import { Submission } from "@/types";
import { useNavigate } from "react-router-dom";
import SubmissionStatusBadge from "./SubmissionStatusBadge";
import { format } from "date-fns";

interface SubmissionCardProps {
  submission: Submission;
}

const SubmissionCard = ({ submission }: SubmissionCardProps) => {
  const navigate = useNavigate();
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg line-clamp-1">{submission.title}</CardTitle>
          <SubmissionStatusBadge status={submission.status} />
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
          {submission.abstract}
        </p>
        <div className="flex flex-wrap gap-2 mb-2">
          {submission.keywords.slice(0, 3).map((keyword, index) => (
            <span 
              key={index} 
              className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full text-xs"
            >
              {keyword}
            </span>
          ))}
          {submission.keywords.length > 3 && (
            <span className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full text-xs">
              +{submission.keywords.length - 3} more
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(submission.submittedDate)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{submission.authors.length} authors</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          size="sm"
          className="w-full"
          onClick={() => navigate(`/submissions/${submission.id}`)}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SubmissionCard;
