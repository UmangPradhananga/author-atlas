
import { useState, useMemo } from "react";
import { Review, Submission, ReviewDecision } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useAuth } from "@/context/AuthContext";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ReviewFormProps {
  submission: Submission;
  review?: Review;
  onSubmit: (reviewData: Partial<Review>) => Promise<void>;
  isSubmitting: boolean;
}

type CriteriaKey = 'methodology' | 'relevance' | 'clarity' | 'originality' | 'overall';

const criteriaLabels: Record<CriteriaKey, string> = {
  methodology: 'Research Methodology',
  relevance: 'Relevance to Field',
  clarity: 'Clarity & Presentation',
  originality: 'Originality & Innovation',
  overall: 'Overall Assessment',
};

const editorCriteriaLabels: Record<string, string> = {
  overall: 'Overall Assessment',
  novelty: 'Novelty & Innovation',
  importance: 'Importance to Field',
  presentation: 'Presentation Quality',
  techQuality: 'Technical Quality',
};

const ratingLabels = [
  "Poor", 
  "Below Average",
  "Average", 
  "Good", 
  "Very Good",
  "Excellent",
  "Outstanding",
  "Exceptional",
  "Superior",
  "Perfect"
];

const ReviewForm = ({ submission, review, onSubmit, isSubmitting }: ReviewFormProps) => {
  const { user } = useAuth();
  const isEditor = user?.role === 'editor' || user?.role === 'admin';
  
  // Use different initial criteria based on role
  const initialCriteria = useMemo(() => {
    if (review?.criteria) {
      const scaled: Record<string, number> = {};
      (Object.keys(review.criteria)).forEach(key => {
        const originalValue = review.criteria[key as keyof typeof review.criteria];
        // If previous value was on a 1-5 scale, convert to 1-10 scale
        scaled[key] = originalValue <= 5 ? originalValue * 2 : originalValue;
      });
      return scaled;
    }
    
    // Different default criteria for editors vs reviewers
    if (isEditor) {
      return {
        overall: 1,
        novelty: 1,
        importance: 1,
        presentation: 1,
        techQuality: 1,
      };
    }
    
    return {
      methodology: 1,
      relevance: 1,
      clarity: 1,
      originality: 1,
      overall: 1,
    };
  }, [review, isEditor]);
  
  const [formData, setFormData] = useState<Partial<Review>>({
    decision: review?.decision || undefined,
    comments: review?.comments || '',
    privateComments: review?.privateComments || '',
    criteria: initialCriteria,
  });

  const [includePrivateComments, setIncludePrivateComments] = useState(Boolean(review?.privateComments));

  const handleCriteriaChange = (criterion: string, value: number[]) => {
    setFormData({
      ...formData,
      criteria: {
        ...formData.criteria!,
        [criterion]: value[0]
      }
    });
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDecisionChange = (value: string) => {
    setFormData({ ...formData, decision: value as ReviewDecision });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If private comments checkbox is unchecked, remove privateComments
    const reviewData = { ...formData };
    if (!includePrivateComments) {
      reviewData.privateComments = '';
    }
    
    onSubmit(reviewData);
  };

  // Define which criteria labels to use based on role
  const criteriaItems = useMemo(() => {
    const labels = isEditor ? editorCriteriaLabels : criteriaLabels;
    
    return Object.entries(labels).map(([key, label]) => {
      const value = formData.criteria![key] || 1;
      
      return (
        <div key={key} className="space-y-3 border rounded-md p-4">
          <div className="flex justify-between items-center">
            <Label className="text-base font-medium">{label}</Label>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-semibold">{value}</span>
              <span className="text-sm text-muted-foreground">/10</span>
            </div>
          </div>
          <div className="py-2">
            <Slider
              defaultValue={[value]}
              min={1}
              max={10}
              step={1}
              onValueChange={(val) => handleCriteriaChange(key, val)}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Poor</span>
            <span>Perfect</span>
          </div>
        </div>
      );
    });
  }, [formData.criteria, isEditor]);

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {isEditor && (
          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-600">
              You are providing an editorial assessment, which includes additional criteria and considerations.
            </AlertDescription>
          </Alert>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>{isEditor ? "Editorial Assessment" : "Review Criteria"}</CardTitle>
            <CardDescription>
              Rate each aspect of the manuscript on a scale of 1-10.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {criteriaItems}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{isEditor ? "Editorial Comments" : "Review Comments"}</CardTitle>
            <CardDescription>
              Provide your feedback on the manuscript.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="comments">
                {isEditor ? "Comments to Author" : "Comments to Author"}
              </Label>
              <Textarea
                id="comments"
                name="comments"
                value={formData.comments}
                onChange={handleTextChange}
                placeholder={isEditor 
                  ? "Enter your editorial comments for the author" 
                  : "Enter your comments for the author"
                }
                className="min-h-32"
                required
              />
              <p className="text-xs text-muted-foreground">
                These comments will be visible to the author.
              </p>
            </div>

            <div className="flex items-start space-x-2 py-2">
              <Checkbox 
                id="includePrivateComments" 
                checked={includePrivateComments}
                onCheckedChange={(checked) => setIncludePrivateComments(!!checked)} 
              />
              <div className="grid gap-1.5 leading-none">
                <Label 
                  htmlFor="includePrivateComments" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {isEditor 
                    ? "Include confidential comments" 
                    : "Include private comments to editor"
                  }
                </Label>
                <p className="text-xs text-muted-foreground">
                  {isEditor 
                    ? "These comments will only be visible to the editorial team." 
                    : "These comments will only be visible to editors."
                  }
                </p>
              </div>
            </div>

            {includePrivateComments && (
              <div className="space-y-2">
                <Label htmlFor="privateComments">
                  {isEditor ? "Confidential Comments" : "Private Comments to Editor"}
                </Label>
                <Textarea
                  id="privateComments"
                  name="privateComments"
                  value={formData.privateComments}
                  onChange={handleTextChange}
                  placeholder={isEditor 
                    ? "Enter confidential comments for the editorial team" 
                    : "Enter your private comments for the editor"
                  }
                  className="min-h-24"
                />
              </div>
            )}

            <div className="space-y-2 pt-4">
              <Label htmlFor="decision">
                {isEditor ? "Editorial Decision" : "Recommendation"}
              </Label>
              <Select
                value={formData.decision}
                onValueChange={handleDecisionChange}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={
                    isEditor 
                      ? "Select your editorial decision" 
                      : "Select your recommendation"
                  } />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="accept">Accept</SelectItem>
                  <SelectItem value="minor_revisions">Accept with Minor Revisions</SelectItem>
                  <SelectItem value="major_revisions">Major Revisions Required</SelectItem>
                  <SelectItem value="reject">Reject</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : isEditor ? "Submit Editorial Assessment" : "Submit Review"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </form>
  );
};

export default ReviewForm;
