
import React, { useState } from "react";
import { Submission } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ResubmissionDialogProps {
  submission: Submission;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (comments: string) => Promise<void>;
}

const ResubmissionDialog: React.FC<ResubmissionDialogProps> = ({
  submission,
  open,
  onOpenChange,
  onConfirm,
}) => {
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!comments.trim()) {
      toast({
        title: "Comments Required",
        description: "Please provide feedback for the author on what to revise.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(comments);
      setComments("");
      onOpenChange(false);
      toast({
        title: "Resubmission Requested",
        description: "The author can now submit a revised version.",
      });
    } catch (error) {
      console.error("Error requesting resubmission:", error);
      toast({
        title: "Error",
        description: "Failed to request resubmission. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request Manuscript Revision</DialogTitle>
          <DialogDescription>
            This will allow the author to submit a revised version of their manuscript: <span className="font-semibold">{submission.title}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="comments">
                Feedback for Author <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Provide specific feedback on what needs revision..."
                className="min-h-[120px]"
              />
              <p className="text-xs text-muted-foreground">
                These comments will be visible to the author as guidance for their revision.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Request Revision"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResubmissionDialog;
