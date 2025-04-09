
import { useState, useEffect } from "react";
import { Submission, Review, ReviewDecision } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ReviewFormProps {
  submission: Submission | null;
  review?: Review;
  onSubmit: (review: Partial<Review>) => void;
  isSubmitting: boolean;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  submission,
  review,
  onSubmit,
  isSubmitting,
}) => {
  const [comments, setComments] = useState(review?.comments || "");
  const [privateComments, setPrivateComments] = useState(review?.privateComments || "");
  const [decision, setDecision] = useState<ReviewDecision | "">(review?.decision || "");
  const [methodology, setMethodology] = useState(review?.criteria?.methodology || 0);
  const [relevance, setRelevance] = useState(review?.criteria?.relevance || 0);
  const [clarity, setClarity] = useState(review?.criteria?.clarity || 0);
  const [originality, setOriginality] = useState(review?.criteria?.originality || 0);
  const [overall, setOverall] = useState(review?.criteria?.overall || 0);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!comments.trim()) {
      setError("Please provide comments for the author");
      return;
    }

    if (!decision) {
      setError("Please select a recommendation");
      return;
    }

    const reviewData: Partial<Review> = {
      comments,
      privateComments: privateComments.trim() ? privateComments : undefined,
      decision,
      criteria: {
        methodology,
        relevance,
        clarity,
        originality,
        overall,
      },
    };

    onSubmit(reviewData);
  };

  // Fix: Create a handler function that correctly handles the type conversion
  const handleDecisionChange = (value: string) => {
    // Cast the string value to ReviewDecision type if it's a valid decision
    if (value === "accept" || value === "minor_revisions" || value === "major_revisions" || value === "reject") {
      setDecision(value as ReviewDecision);
    } else {
      setDecision(""); // Handle empty selection
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Evaluation Criteria</CardTitle>
            <CardDescription>
              Rate the manuscript on the following criteria (1-10)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Methodology</Label>
                <span className="font-medium">{methodology}</span>
              </div>
              <Slider
                value={[methodology]}
                min={1}
                max={10}
                step={1}
                onValueChange={(value) => setMethodology(value[0])}
              />
              <p className="text-xs text-muted-foreground">
                Evaluate the soundness of the research methodology
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Relevance</Label>
                <span className="font-medium">{relevance}</span>
              </div>
              <Slider
                value={[relevance]}
                min={1}
                max={10}
                step={1}
                onValueChange={(value) => setRelevance(value[0])}
              />
              <p className="text-xs text-muted-foreground">
                Assess the relevance to the field and current research
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Clarity</Label>
                <span className="font-medium">{clarity}</span>
              </div>
              <Slider
                value={[clarity]}
                min={1}
                max={10}
                step={1}
                onValueChange={(value) => setClarity(value[0])}
              />
              <p className="text-xs text-muted-foreground">
                Evaluate the clarity of writing and presentation
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Originality</Label>
                <span className="font-medium">{originality}</span>
              </div>
              <Slider
                value={[originality]}
                min={1}
                max={10}
                step={1}
                onValueChange={(value) => setOriginality(value[0])}
              />
              <p className="text-xs text-muted-foreground">
                Assess the originality and innovation of the work
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Overall Rating</Label>
                <span className="font-medium">{overall}</span>
              </div>
              <Slider
                value={[overall]}
                min={1}
                max={10}
                step={1}
                onValueChange={(value) => setOverall(value[0])}
              />
              <p className="text-xs text-muted-foreground">
                Your overall assessment of the manuscript
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comments for Author</CardTitle>
            <CardDescription>
              Provide constructive feedback for the author
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Enter your comments for the author..."
              className="min-h-[200px]"
              required
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Private Comments</CardTitle>
            <CardDescription>
              These comments will only be visible to the editor (optional)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={privateComments}
              onChange={(e) => setPrivateComments(e.target.value)}
              placeholder="Enter any private comments for the editor..."
              className="min-h-[150px]"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommendation</CardTitle>
            <CardDescription>
              Provide your final recommendation for this manuscript
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={decision}
              onValueChange={handleDecisionChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your recommendation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="accept">Accept (No changes needed)</SelectItem>
                <SelectItem value="minor_revisions">
                  Accept with Minor Revisions
                </SelectItem>
                <SelectItem value="major_revisions">
                  Major Revisions Required
                </SelectItem>
                <SelectItem value="reject">Reject</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2 pt-4">
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
