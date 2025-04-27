import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSubmissions } from "@/context/SubmissionContext";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import AssignmentDialog from "@/components/submissions/AssignmentDialog";
import { useToast } from "@/components/ui/use-toast";
import { editorApi } from "@/api/apiService";

const CopyeditorAssignmentPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSubmissionById } = useSubmissions();
  const [isAssigningCopyeditors, setIsAssigningCopyeditors] = useState(true);
  const { toast } = useToast();
  
  const submission = id ? getSubmissionById(id) : undefined;

  const handleAssignCopyeditors = async (userIds: string[]) => {
    if (!submission) return;
    
    try {
      // Use dedicated assignCopyEditor service instead of generic updateSubmission
      // Note: The API expects a single copyEditorId, so we'll use the first ID in the array
      if (userIds.length > 0) {
        const copyEditorId = userIds[0];
        const publisherId = ""; // You may need to set an appropriate publisher ID
        
        // Call the specialized assignCopyEditor service - database will be updated here
        await editorApi.assignCopyEditor(submission.id, copyEditorId, publisherId);
        
        toast({
          title: "Assignment Updated",
          description: "Successfully assigned copyeditors to this submission.",
        });
        
        // Navigate back to the submission page - data will be refreshed when the page loads
        navigate(`/submissions/${submission.id}`);
      }
    } catch (error) {
      console.error("Error assigning copyeditors:", error);
      toast({
        title: "Error",
        description: "Failed to assign copyeditors. Please try again.",
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
        <h1 className="text-2xl font-bold mb-2">Assign Copyeditors</h1>
        <p className="text-muted-foreground">
          Manage copyeditor assignments for: {submission.title}
        </p>
      </div>

      <AssignmentDialog
        open={isAssigningCopyeditors}
        onClose={() => navigate(`/submissions/${submission.id}`)}
        submission={submission}
        onAssign={handleAssignCopyeditors}
        role="copyeditor"
        title="Copyeditors"
        currentAssignees={submission.copyeditors}
      />
    </div>
  );
};

export default CopyeditorAssignmentPage;
