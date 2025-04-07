
import React, { useState } from "react";
import { Submission } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useSubmissions } from "@/context/SubmissionContext";
import { useToast } from "@/components/ui/use-toast";
import { ChevronLeft, Upload, FileUp } from "lucide-react";

interface ResubmissionPortalProps {
  submission: Submission;
  onClose: () => void;
}

const ResubmissionPortal: React.FC<ResubmissionPortalProps> = ({ submission, onClose }) => {
  const { updateSubmission } = useSubmissions();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [document, setDocument] = useState(submission.document);
  const [responseToReviewers, setResponseToReviewers] = useState("");
  const [changesSummary, setChangesSummary] = useState("");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await updateSubmission(submission.id, {
        status: "under_review",
        document: document,
        resubmissionDetails: {
          responseToReviewers,
          changesSummary,
          resubmissionDate: new Date().toISOString(),
          previousVersion: submission.document
        },
        updatedDate: new Date().toISOString()
      });
      
      toast({
        title: "Revision Submitted",
        description: "Your revised manuscript has been successfully submitted for review.",
      });
      
      onClose();
    } catch (error) {
      console.error("Error submitting revision:", error);
      toast({
        title: "Error",
        description: "Failed to submit revision. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onClose}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Submission
        </Button>
        <h1 className="text-2xl font-bold">Resubmission Portal</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Submit Revised Manuscript</CardTitle>
          <CardDescription>
            Respond to the reviewers' comments and upload your revised manuscript.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="document">Revised Manuscript</Label>
              <div className="flex items-center gap-4">
                <Input 
                  id="document" 
                  value={document} 
                  onChange={(e) => setDocument(e.target.value)}
                  placeholder="Enter document URL or upload a new file" 
                  className="flex-1"
                  required
                />
                <Button type="button" variant="outline">
                  <FileUp className="mr-2 h-4 w-4" /> Upload
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Upload your revised manuscript or provide a URL to the document.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="changesSummary">Summary of Changes</Label>
              <Textarea
                id="changesSummary"
                value={changesSummary}
                onChange={(e) => setChangesSummary(e.target.value)}
                placeholder="Provide a brief summary of changes made in this revision"
                className="min-h-20"
                required
              />
              <p className="text-xs text-muted-foreground">
                Summarize the key changes you've made in response to the feedback.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="responseToReviewers">Response to Reviewers</Label>
              <Textarea
                id="responseToReviewers"
                value={responseToReviewers}
                onChange={(e) => setResponseToReviewers(e.target.value)}
                placeholder="Address each point raised by the reviewers"
                className="min-h-40"
                required
              />
              <p className="text-xs text-muted-foreground">
                Provide a point-by-point response to all reviewer comments and explain how you've addressed them.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button variant="outline" className="mr-2" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" /> Submit Revision
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ResubmissionPortal;
