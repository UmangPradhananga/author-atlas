
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
  
  // Scale ratings from 1-5 to 1-10 for existing reviews
  const initialCriteria = useMemo(() => {
    if (review?.criteria) {
      const scaled: Record<CriteriaKey, number> = {} as Record<CriteriaKey, number>;
      (Object.keys(review.criteria) as CriteriaKey[]).forEach(key => {
        const originalValue = review.criteria[key];
        // If previous value was on a 1-5 scale, convert to 1-10 scale
        scaled[key] = originalValue <= 5 ? originalValue * 2 : originalValue;
      });
      return scaled;
    }
    return {
      methodology: 1,
      relevance: 1,
      clarity: 1,
      originality: 1,
      overall: 1,
    };
  }, [review]);
  
  const [formData, setFormData] = useState<Partial<Review>>({
    decision: review?.decision || undefined,
    comments: review?.comments || '',
    privateComments: review?.privateComments || '',
    criteria: initialCriteria,
  });

  const handleCriteriaChange = (criterion: CriteriaKey, value: number[]) => {
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
    onSubmit(formData);
  };

  const criteriaItems = useMemo(() => Object.entries(criteriaLabels).map(([key, label]) => {
    const criteriaKey = key as CriteriaKey;
    const value = formData.criteria![criteriaKey];
    
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
            onValueChange={(val) => handleCriteriaChange(criteriaKey, val)}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Poor</span>
          <span>Perfect</span>
        </div>
      </div>
    );
  }), [formData.criteria]);

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Rating Criteria</CardTitle>
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
            <CardTitle>Review Comments</CardTitle>
            <CardDescription>
              Provide your feedback on the manuscript.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="comments">Comments to Author</Label>
              <Textarea
                id="comments"
                name="comments"
                value={formData.comments}
                onChange={handleTextChange}
                placeholder="Enter your comments for the author"
                className="min-h-32"
                required
              />
              <p className="text-xs text-muted-foreground">
                These comments will be visible to the author.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="privateComments">Private Comments to Editor</Label>
              <Textarea
                id="privateComments"
                name="privateComments"
                value={formData.privateComments}
                onChange={handleTextChange}
                placeholder="Enter your private comments for the editor"
                className="min-h-24"
              />
              <p className="text-xs text-muted-foreground">
                These comments will only be visible to editors.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="decision">Recommendation</Label>
              <Select
                value={formData.decision}
                onValueChange={handleDecisionChange}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select your recommendation" />
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
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </form>
  );
};

export default ReviewForm;
