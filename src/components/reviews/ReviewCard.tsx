
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Review, Submission } from "@/types";
import { format } from "date-fns";
import { AlertTriangle, CheckCircle, Clock, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface ReviewCardProps {
  submission: Submission;
  review?: Review;
}

const ReviewCard = ({ submission, review }: ReviewCardProps) => {
  const navigate = useNavigate();
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  const isDueSoon = review && !review.completed && new Date(review.dueDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const isOverdue = review && !review.completed && new Date(review.dueDate) < new Date();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg line-clamp-1">{submission.title}</CardTitle>
          {review && (
            review.completed ? (
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            ) : isOverdue ? (
              <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Overdue
              </Badge>
            ) : isDueSoon ? (
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                <Clock className="h-3 w-3 mr-1" />
                Due Soon
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                <Clock className="h-3 w-3 mr-1" />
                Assigned
              </Badge>
            )
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {submission.abstract}
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
          <div className="flex items-center">
            <User className="h-4 w-4 mr-1 text-muted-foreground" />
            <span className="text-sm">
              {submission.authors.slice(0, 2).join(', ')}
              {submission.authors.length > 2 && ' et al.'}
            </span>
          </div>
          {review && (
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
              <span className="text-sm">Due: {formatDate(review.dueDate)}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          size="sm"
          className="w-full"
          onClick={() => navigate(`/reviews/${submission.id}`)}
        >
          {review?.completed ? 'View Review' : 'Review Manuscript'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ReviewCard;
