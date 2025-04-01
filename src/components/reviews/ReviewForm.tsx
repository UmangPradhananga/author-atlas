
import { useState } from "react";
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

const ReviewForm = ({ submission, review, onSubmit, isSubmitting }: ReviewFormProps) => {
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

  const renderRatingLabel = (value: number) => {
    if (value === 0) return 'Not Rated';
    if (value === 1) return 'Poor (1)';
    if (value === 2) return 'Fair (2)';
    if (value === 3) return 'Good (3)';
    if (value === 4) return 'Very Good (4)';
    if (value === 5) return 'Excellent (5)';
    return `${value}`;
  };

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
            {Object.entries(criteriaLabels).map(([key, label]) => (
              <div key={key} className="space-y-1">
                <div className="flex justify-between">
                  <Label>{label}</Label>
                  <span className="text-sm">
                    {renderRatingLabel(formData.criteria![key as CriteriaKey])}
                  </span>
                </div>
                <Slider
                  value={[formData.criteria![key as CriteriaKey]]}
                  min={0}
                  max={5}
                  step={1}
                  onValueChange={(value) => handleCriteriaChange(key as CriteriaKey, value)}
                />
              </div>
            ))}
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
