
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSubmissions } from "@/context/SubmissionContext";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import AssignmentDialog from "@/components/submissions/AssignmentDialog";
import { useToast } from "@/components/ui/use-toast";

const PublisherAssignmentPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSubmissionById, updateSubmission } = useSubmissions();
  const [isAssigningPublishers, setIsAssigningPublishers] = useState(true);
  const { toast } = useToast();
  
  const submission = id ? getSubmissionById(id) : undefined;

  const handleAssignPublishers = async (userIds: string[]) => {
    if (!submission) return;
    
    try {
      await updateSubmission(submission.id, {
        publishers: userIds
      });
      
      toast({
        title: "Assignment Updated",
        description: "Successfully assigned publishers to this submission.",
      });
      
      navigate(`/submissions/${submission.id}`);
    } catch (error) {
      console.error("Error assigning publishers:", error);
      toast({
        title: "Error",
        description: "Failed to assign publishers. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!submission) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Submission Not Found</h2>
        <p className="mb-6">The submission you're looking for doesn't exist.</p>
        <Button onClick={() => navigate("/submissions")}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Submissions
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/submissions/${submission.id}`)}
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Submission
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold mb-2">Assign Publishers</h1>
        <p className="text-muted-foreground">
          Manage publisher assignments for: {submission.title}
        </p>
      </div>

      <AssignmentDialog
        open={isAssigningPublishers}
        onClose={() => navigate(`/submissions/${submission.id}`)}
        submission={submission}
        onAssign={handleAssignPublishers}
        role="publisher"
        title="Publishers"
        currentAssignees={submission.publishers}
      />
    </div>
  );
};

export default PublisherAssignmentPage;
