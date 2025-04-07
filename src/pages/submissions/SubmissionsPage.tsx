
import { useState, useEffect } from "react";
import { useSubmissions } from "@/context/SubmissionContext";
import { useAuth } from "@/context/AuthContext";
import { Submission, SubmissionStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import SubmissionCard from "@/components/submissions/SubmissionCard";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";

const SubmissionsPage = () => {
  const { user } = useAuth();
  const { userSubmissions, loading, error, fetchSubmissions } = useSubmissions();
  const [searchParams] = useSearchParams();
  const statusParam = searchParams.get('status') as SubmissionStatus | null;
  const [activeTab, setActiveTab] = useState<string>(statusParam || "all");
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([]);
  const navigate = useNavigate();

  // Set active tab based on URL param when component mounts
  useEffect(() => {
    if (statusParam) {
      setActiveTab(statusParam);
    }
  }, [statusParam]);

  // Filter submissions when tab changes or submissions change
  useEffect(() => {
    if (!userSubmissions) {
      setFilteredSubmissions([]);
      return;
    }

    if (activeTab === "all") {
      setFilteredSubmissions(userSubmissions);
    } else {
      setFilteredSubmissions(
        userSubmissions.filter(
          (submission) => submission.status === activeTab
        )
      );
    }
  }, [activeTab, userSubmissions]);

  // Refresh submissions when component mounts
  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "all") {
      navigate("/submissions");
    } else {
      navigate(`/submissions?status=${value}`);
    }
  };

  const isAuthor = user?.role === "author";
  
  // Fix: Add default empty array to avoid undefined errors
  const submissionStatuses = [...new Set((userSubmissions || []).map(s => s.status))];
  
  // Create tabs based on available statuses
  const renderTabs = () => {
    return (
      <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-8">
          <TabsTrigger value="all">All Submissions</TabsTrigger>
          {submissionStatuses.includes('draft') && (
            <TabsTrigger value="draft">Drafts</TabsTrigger>
          )}
          {submissionStatuses.includes('submitted') && (
            <TabsTrigger value="submitted">Submitted</TabsTrigger>
          )}
          {submissionStatuses.includes('under_review') && (
            <TabsTrigger value="under_review">Under Review</TabsTrigger>
          )}
          {submissionStatuses.includes('revision_required') && (
            <TabsTrigger value="revision_required">Revisions</TabsTrigger>
          )}
          {submissionStatuses.includes('accepted') && (
            <TabsTrigger value="accepted">Accepted</TabsTrigger>
          )}
          {submissionStatuses.includes('rejected') && (
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          )}
          {submissionStatuses.includes('published') && (
            <TabsTrigger value="published">Published</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubmissions.map((submission) => (
              <SubmissionCard key={submission.id} submission={submission} />
            ))}
          </div>
          
          {filteredSubmissions.length === 0 && (
            <div className="text-center py-16">
              <h3 className="text-xl font-medium mb-2">No submissions found</h3>
              <p className="text-muted-foreground mb-6">
                {activeTab === "all"
                  ? "You haven't created any submissions yet."
                  : `You don't have any submissions with status: ${activeTab}.`}
              </p>
              {isAuthor && (
                <Button onClick={() => navigate("/submissions/new")}>
                  <Plus className="mr-2 h-4 w-4" /> Create New Submission
                </Button>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Submissions</h1>
          <p className="text-muted-foreground">
            {isAuthor 
              ? "Manage your manuscript submissions" 
              : "Browse and manage journal submissions"}
          </p>
        </div>
        
        {isAuthor && (
          <Button onClick={() => navigate("/submissions/new")}>
            <Plus className="mr-2 h-4 w-4" /> New Submission
          </Button>
        )}
      </div>

      {false ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p>Loading submissions...</p>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => fetchSubmissions()}>Retry</Button>
        </div>
      ) : userSubmissions && userSubmissions.length > 0 ? (
        renderTabs()
      ) : (
        <div className="text-center py-16 bg-muted/20 rounded-lg border border-dashed">
          <h3 className="text-xl font-medium mb-2">No submissions found</h3>
          <p className="text-muted-foreground mb-6">
            {isAuthor
              ? "You haven't created any submissions yet."
              : "There are no submissions to display."}
          </p>
          {isAuthor && (
            <Button onClick={() => navigate("/submissions/new")}>
              <Plus className="mr-2 h-4 w-4" /> Create New Submission
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default SubmissionsPage;
