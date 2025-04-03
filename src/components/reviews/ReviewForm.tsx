
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  "Very Good"
];

const ReviewForm = ({ submission, review, onSubmit, isSubmitting }: ReviewFormProps) => {
  const { user } = useAuth();
  const isEditor = user?.role === 'editor' || user?.role === 'admin';
  
  const [formData, setFormData] = useState<Partial<Review>>({
    decision: review?.decision || undefined,
    comments: review?.comments || '',
    privateComments: review?.privateComments || '',
    criteria: review?.criteria || {
      methodology: 0,
      relevance: 0,
      clarity: 0,
      originality: 0,
      overall: 0,
    },
  });

  const handleCriteriaChange = (criterion: CriteriaKey, value: number) => {
    setFormData({
      ...formData,
      criteria: {
        ...formData.criteria!,
        [criterion]: value
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
    
    // Radio button rating system for editors
    if (isEditor) {
      return (
        <div key={key} className="border rounded-md p-4">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-base font-medium">{label}</Label>
            <div className="text-sm text-muted-foreground">
              {value === 0 ? 'Not Rated' : `${value}/5`}
            </div>
          </div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((ratingValue) => (
              <div key={ratingValue} className="flex items-center space-x-3">
                <Checkbox 
                  id={`${key}-${ratingValue}`}
                  checked={value === ratingValue}
                  onCheckedChange={() => handleCriteriaChange(criteriaKey, ratingValue)}
                />
                <Label 
                  htmlFor={`${key}-${ratingValue}`}
                  className="cursor-pointer text-sm font-normal"
                >
                  {ratingValue} - {ratingLabels[ratingValue - 1]}
                </Label>
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    // For reviewers, use radio buttons as shown in the image
    return (
      <div key={key} className="space-y-3">
        <Label>{label} {value > 0 && <span className="text-muted-foreground">({value}/5)</span>}</Label>
        <RadioGroup 
          value={value.toString()}
          onValueChange={(val) => handleCriteriaChange(criteriaKey, parseInt(val))}
          className="flex flex-col space-y-1"
        >
          {[1, 2, 3, 4, 5].map((val) => (
            <div key={val} className="flex items-center space-x-2">
              <RadioGroupItem value={val.toString()} id={`${key}-${val}`} />
              <Label htmlFor={`${key}-${val}`} className="cursor-pointer font-normal">
                {ratingLabels[val-1]}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    );
  }), [formData.criteria, isEditor]);

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Rating Criteria</CardTitle>
            <CardDescription>
              Rate each aspect of the manuscript on a scale of 1-5.
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
