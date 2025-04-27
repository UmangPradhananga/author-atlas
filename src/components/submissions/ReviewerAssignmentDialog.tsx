
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usersApi } from "@/api/apiService";
import { User, Submission } from "@/types";
import { CheckCircle, Search, UserCheck, UserPlus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ReviewerAssignmentDialogProps {
  open: boolean;
  onClose: () => void;
  submission: Submission;
  onAssignReviewers: (reviewerIds: string[]) => Promise<void>;
}

const ReviewerAssignmentDialog = ({
  open,
  onClose,
  submission,
  onAssignReviewers,
}: ReviewerAssignmentDialogProps) => {
  const [reviewers, setReviewers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReviewerIds, setSelectedReviewerIds] = useState<string[]>(
    submission.reviewers || []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  // Fetch reviewers
  useEffect(() => {
    const fetchReviewers = async () => {
      try {
        setLoading(true);
        const users = await usersApi.getUsersByRole("reviewer");
        setReviewers(users);
      } catch (error) {
        console.error("Failed to fetch reviewers:", error);
        toast({
          title: "Error",
          description: "Failed to load reviewers. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchReviewers();
    }
  }, [open, toast]);

  const handleSelectReviewer = (reviewerId: string) => {
    setSelectedReviewerIds((prev) => {
      if (prev.includes(reviewerId)) {
        return prev.filter((id) => id !== reviewerId);
      } else {
        return [...prev, reviewerId];
      }
    });
  };

  const handleSave = async () => {
    try {
      setSubmitting(true);
      await onAssignReviewers(selectedReviewerIds);
      toast({
        title: "Reviewers Assigned",
        description: `Successfully assigned ${selectedReviewerIds.length} reviewers to this submission.`,
      });
      onClose();
    } catch (error) {
      console.error("Failed to assign reviewers:", error);
      toast({
        title: "Error",
        description: "Failed to assign reviewers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredReviewers = reviewers.filter((reviewer) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      reviewer.fullName.toLowerCase().includes(query) ||
      reviewer.email.toLowerCase().includes(query) ||
      reviewer.affiliation?.toLowerCase().includes(query)
    );
  });

  const isReviewerAlreadyAssigned = (reviewerId: string) => {
    return submission.reviewers?.includes(reviewerId) || false;
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Assign Reviewers
          </DialogTitle>
          <DialogDescription>
            Assign reviewers to the submission: <strong>{submission.title}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reviewers..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="mt-0.5"
            >
              Clear
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="flex flex-col items-center gap-2">
                <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground">Loading reviewers...</p>
              </div>
            </div>
          ) : filteredReviewers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No reviewers found</p>
            </div>
          ) : (
            <ScrollArea className="h-[300px] rounded-md border">
              <div className="p-4 space-y-2">
                {filteredReviewers.map((reviewer) => {
                  const isAssigned = isReviewerAlreadyAssigned(reviewer.userId);
                  return (
                    <div
                      key={reviewer.userId}
                      className={`flex items-center space-x-2 p-2 rounded ${
                        selectedReviewerIds.includes(reviewer.userId)
                          ? "bg-accent"
                          : "hover:bg-muted"
                      }`}
                    >
                      <Checkbox
                        id={`reviewer-${reviewer.userId}`}
                        checked={selectedReviewerIds.includes(reviewer.userId)}
                        onCheckedChange={() => handleSelectReviewer(reviewer.userId)}
                      />
                      <div className="flex-1 grid gap-0.5">
                        <Label
                          htmlFor={`reviewer-${reviewer.userId}`}
                          className="cursor-pointer font-medium flex items-center"
                        >
                          {reviewer.fullName}
                          {isAssigned && (
                            <span className="ml-2 inline-flex items-center text-xs text-green-600 font-medium">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Already assigned
                            </span>
                          )}
                        </Label>
                        <div className="text-xs text-muted-foreground">
                          {reviewer.email}
                          {reviewer.affiliation && ` • ${reviewer.affiliation}`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {selectedReviewerIds.length} reviewers selected
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedReviewerIds([])}
              disabled={selectedReviewerIds.length === 0}
            >
              Deselect All
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={submitting || selectedReviewerIds.length === 0}>
            {submitting ? "Saving..." : "Assign Reviewers"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewerAssignmentDialog;
