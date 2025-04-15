import { useState, useEffect } from "react";
import { submissionsApi } from "@/api/apiService";
import { useAuth } from "@/context/AuthContext";
import { Submission, PeerReviewType } from "@/types";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Clock, User, Info, Search, Filter, SortAsc, SortDesc, Calendar, Send, ThumbsUp, ThumbsDown } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { useSubmissions } from "@/context/SubmissionContext";
import { useToast } from "@/components/ui/use-toast";
import ReviewerAssignmentDialog from "@/components/submissions/ReviewerAssignmentDialog";

const ReviewsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([]);
  const [displayedSubmissions, setDisplayedSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("pending");
  
  // Filtering and sorting
  const [peerReviewFilter, setPeerReviewFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<string>("dueDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [dateFilter, setDateFilter] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  const [isAssigningReviewers, setIsAssigningReviewers] = useState(false);
  const { updateSubmission } = useSubmissions();
  const { toast } = useToast();

  useEffect(() => {
    const fetchReviewSubmissions = async () => {
      if (!user) return;

      try {
        // For reviewer role
        if (user.role === "reviewer") {
          const reviewerSubmissions = await submissionsApi.getReviewerSubmissions(user.id);
          setSubmissions(reviewerSubmissions);
        } 
        // For editor or admin roles
        else if (user.role === "editor" || user.role === "admin") {
          const allSubmissions = await submissionsApi.getAllSubmissions();
          // Only get the under_review submissions
          const reviewSubmissions = allSubmissions.filter(
            (sub) => sub.status === "under_review" || sub.status === "submitted"
          );
          setSubmissions(reviewSubmissions);
        }
      } catch (err) {
        console.error("Error fetching reviewer submissions:", err);
        setError("Failed to load review submissions");
      } finally {
        setLoading(false);
      }
    };

    fetchReviewSubmissions();
  }, [user]);

  // Filter submissions based on peer review type and tab selection
  useEffect(() => {
    if (!submissions) {
      setFilteredSubmissions([]);
      return;
    }

    let result = [...submissions];
    
    // Apply peer review type filter
    if (peerReviewFilter !== "all") {
      result = result.filter(
        (submission) => submission.peerReviewType === peerReviewFilter
      );
    }
    
    // Apply tab filter
    if (activeTab === "pending") {
      result = result.filter(submission => 
        submission.status === "under_review" && 
        submission.reviews?.some(review => !review.completed)
      );
    } else if (activeTab === "completed") {
      result = result.filter(submission => 
        submission.reviews?.some(review => review.completed)
      );
    } else if (activeTab === "assignable") {
      result = result.filter(submission => 
        submission.status === "submitted" && 
        (user?.role === "editor" || user?.role === "admin")
      );
    }
    
    setFilteredSubmissions(result);
  }, [peerReviewFilter, submissions, activeTab, user]);

  // Apply search, sort, and additional filters
  useEffect(() => {
    let result = [...filteredSubmissions];
    
    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(submission => 
        submission.title.toLowerCase().includes(query) || 
        submission.abstract.toLowerCase().includes(query) ||
        submission.authors.some(author => author.toLowerCase().includes(query))
      );
    }
    
    // Apply date filter
    if (dateFilter) {
      const today = new Date();
      let filterDate = new Date();
      
      switch (dateFilter) {
        case "today":
          filterDate = today;
          break;
        case "week":
          filterDate = new Date(today.setDate(today.getDate() - 7));
          break;
        case "month":
          filterDate = new Date(today.setMonth(today.getMonth() - 1));
          break;
      }
      
      result = result.filter(submission => {
        // For pending reviews, filter by due date
        if (activeTab === "pending") {
          const review = getReviewForSubmission(submission);
          if (review && !review.completed) {
            const dueDate = new Date(review.dueDate);
            return dueDate >= filterDate;
          }
          return false;
        }
        // For completed reviews, filter by completion date
        else if (activeTab === "completed") {
          const review = getReviewForSubmission(submission);
          if (review && review.completed && review.submittedDate) {
            const completedDate = new Date(review.submittedDate);
            return completedDate >= filterDate;
          }
          return false;
        }
        return true;
      });
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let fieldA, fieldB;
      
      if (sortField === "title") {
        fieldA = a.title.toLowerCase();
        fieldB = b.title.toLowerCase();
      } else if (sortField === "dueDate") {
        const reviewA = getReviewForSubmission(a);
        const reviewB = getReviewForSubmission(b);
        fieldA = reviewA ? new Date(reviewA.dueDate).getTime() : 0;
        fieldB = reviewB ? new Date(reviewB.dueDate).getTime() : 0;
      } else if (sortField === "updatedDate") {
        fieldA = new Date(a.updatedDate).getTime();
        fieldB = new Date(b.updatedDate).getTime();
      } else {
        // Default sort by due date
        const reviewA = getReviewForSubmission(a);
        const reviewB = getReviewForSubmission(b);
        fieldA = reviewA ? new Date(reviewA.dueDate).getTime() : 0;
        fieldB = reviewB ? new Date(reviewB.dueDate).getTime() : 0;
      }
      
      if (sortDirection === "asc") {
        return fieldA < fieldB ? -1 : fieldA > fieldB ? 1 : 0;
      } else {
        return fieldA > fieldB ? -1 : fieldA < fieldB ? 1 : 0;
      }
    });
    
    setDisplayedSubmissions(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [filteredSubmissions, searchQuery, sortField, sortDirection, dateFilter, activeTab]);

  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return displayedSubmissions.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(displayedSubmissions.length / itemsPerPage);

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      if (currentPage <= 3) {
        endPage = Math.min(maxPagesToShow - 1, totalPages - 1);
      } else if (currentPage >= totalPages - 2) {
        startPage = Math.max(2, totalPages - (maxPagesToShow - 2));
      }
      
      if (startPage > 2) {
        pageNumbers.push('ellipsis');
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      if (endPage < totalPages - 1) {
        pageNumbers.push('ellipsis');
      }
      
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  if (user && user.role !== "reviewer" && user.role !== "editor" && user.role !== "admin") {
    navigate("/dashboard");
    return null;
  }

  const handleSortChange = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getReviewForSubmission = (submission: Submission) => {
    if (!user || !submission.reviews) return undefined;
    return submission.reviews.find(review => review.reviewerId === user.id);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  const getPeerReviewLabel = (type: PeerReviewType): string => {
    switch (type) {
      case 'open': return 'Open Review';
      case 'single_blind': return 'Single-Blind';
      case 'double_blind': return 'Double-Blind';
      default: return type;
    }
  };

  const renderReviewTypeTooltip = (type: PeerReviewType) => {
    let tooltipContent = '';
    switch (type) {
      case 'open':
        tooltipContent = 'Both authors and reviewers know each others identities';
        break;
      case 'single_blind':
        tooltipContent = 'Reviewers know author identities, but authors dont know reviewers';
        break;
      case 'double_blind':
        tooltipContent = 'Both authors and reviewers remain anonymous to each other';
        break;
    }
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-help">
              {getPeerReviewLabel(type)}
              <Info className="ml-1 h-3 w-3" />
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">{tooltipContent}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const handleDeskDecision = async (submission: Submission, decision: 'accept' | 'reject' | 'review') => {
    try {
      if (decision === 'review') {
        setIsAssigningReviewers(true);
        return;
      }

      await updateSubmission(submission.id, {
        status: decision === 'accept' ? 'accepted' : 'rejected',
        decision: {
          status: decision,
          comments: `Desk ${decision} by editor`,
          date: new Date().toISOString()
        }
      });

      toast({
        title: "Decision Made",
        description: `Submission has been ${decision}ed.`,
      });

      // Refresh the page to update the list
      window.location.reload();
    } catch (error) {
      console.error("Error making desk decision:", error);
      toast({
        title: "Error",
        description: "Failed to process the decision. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAssignReviewers = async (userIds: string[]) => {
    if (!submissions) return;
    
    try {
      await updateSubmission(submissions.id, {
        status: 'under_review',
        reviewers: userIds,
        reviews: userIds.map(reviewerId => {
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 14);
          
          return {
            id: `rev-${Math.random().toString(36).substring(2, 9)}`,
            submissionId: submissions.id,
            reviewerId: reviewerId,
            completed: false,
            comments: '',
            dueDate: dueDate.toISOString(),
            criteria: {
              methodology: 0,
              relevance: 0,
              clarity: 0,
              originality: 0,
              overall: 0
            }
          };
        })
      });

      toast({
        title: "Reviewers Assigned",
        description: "Successfully assigned reviewers and moved submission to review.",
      });

      setIsAssigningReviewers(false);
      // Refresh the page to update the list
      window.location.reload();
    } catch (error) {
      console.error("Error assigning reviewers:", error);
      toast({
        title: "Error",
        description: "Failed to assign reviewers. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Modify the renderSubmissionCard function to include desk decision buttons
  const renderSubmissionCard = (submission: Submission) => {
    const review = getReviewForSubmission(submission);
    const isDueSoon = review && !review.completed && new Date(review.dueDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const isOverdue = review && !review.completed && new Date(review.dueDate) < new Date();

    const renderDeskDecisionButtons = () => {
      if (activeTab !== 'assignable' || submission.status !== 'submitted') return null;

      return (
        <div className="flex gap-2 mt-4">
          <Button 
            variant="outline" 
            className="flex-1 bg-green-50 text-green-600 hover:bg-green-100 border-green-200"
            onClick={() => handleDeskDecision(submission, 'accept')}
          >
            <ThumbsUp className="h-4 w-4 mr-2" /> Desk Accept
          </Button>
          <Button 
            variant="outline"
            className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
            onClick={() => handleDeskDecision(submission, 'reject')}
          >
            <ThumbsDown className="h-4 w-4 mr-2" /> Desk Reject
          </Button>
          <Button
            className="flex-1"
            onClick={() => handleDeskDecision(submission, 'review')}
          >
            <Send className="h-4 w-4 mr-2" /> Submit for Review
          </Button>
        </div>
      );
    };

    return (
      <Card key={submission.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg line-clamp-1">{submission.title}</CardTitle>
            {review && (
              review.completed ? (
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              ) : isOverdue ? (
                <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Overdue
                </Badge>
              ) : isDueSoon ? (
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                  <Clock className="h-3 w-3 mr-1" />
                  Due Soon
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                  <Clock className="h-3 w-3 mr-1" />
                  Assigned
                </Badge>
              )
            )}
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {submission.abstract}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1 text-muted-foreground" />
              <span className="text-sm">
                {submission.authors.slice(0, 2).join(', ')}
                {submission.authors.length > 2 && ' et al.'}
              </span>
            </div>
            {renderReviewTypeTooltip(submission.peerReviewType)}
            {review && (
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                <span className="text-sm">Due: {formatDate(review.dueDate)}</span>
              </div>
            )}
          </div>
          {renderDeskDecisionButtons()}
        </CardContent>
        <CardFooter>
          <Button 
            variant="outline" 
            size="sm"
            className="w-full"
            onClick={() => navigate(`/reviews/${submission.id}`)}
          >
            {review?.completed ? 'View Review' : 'Review Manuscript'}
          </Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Review Management</h1>
        <p className="text-muted-foreground">
          {user?.role === "reviewer" 
            ? "Manage your assigned manuscript reviews" 
            : "Manage review process for submitted manuscripts"}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p>Loading reviews...</p>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-destructive mb-4">{error}</p>
          <button
            className="text-primary underline"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-16">
          <h3 className="text-xl font-medium mb-2">No Reviews Assigned</h3>
          <p className="text-muted-foreground">
            You don't have any manuscripts assigned for review.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reviews..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72">
                  <div className="space-y-4">
                    <h4 className="font-medium">Filter Options</h4>
                    
                    <div className="space-y-2">
                      <Label htmlFor="review-type-filter">Review Type</Label>
                      <Select
                        value={peerReviewFilter}
                        onValueChange={setPeerReviewFilter}
                      >
                        <SelectTrigger id="review-type-filter">
                          <SelectValue placeholder="Filter by review type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Review Types</SelectItem>
                          <SelectItem value="open">Open Review</SelectItem>
                          <SelectItem value="single_blind">Single-Blind Review</SelectItem>
                          <SelectItem value="double_blind">Double-Blind Review</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="date-filter">Date Range</Label>
                      <Select 
                        value={dateFilter || ""} 
                        onValueChange={(value) => setDateFilter(value || null)}
                      >
                        <SelectTrigger id="date-filter">
                          <SelectValue placeholder="Filter by date" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Time</SelectItem>
                          <SelectItem value="today">Today</SelectItem>
                          <SelectItem value="week">Past Week</SelectItem>
                          <SelectItem value="month">Past Month</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="items-per-page">Items per page</Label>
                      <Select 
                        value={itemsPerPage.toString()} 
                        onValueChange={(value) => {
                          setItemsPerPage(parseInt(value));
                          setCurrentPage(1);
                        }}
                      >
                        <SelectTrigger id="items-per-page">
                          <SelectValue placeholder="Items per page" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="6">6</SelectItem>
                          <SelectItem value="9">9</SelectItem>
                          <SelectItem value="12">12</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => {
                        setSearchQuery("");
                        setPeerReviewFilter("all");
                        setDateFilter(null);
                        setSortField("dueDate");
                        setSortDirection("asc");
                        setItemsPerPage(6);
                      }}
                    >
                      Reset Filters
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleSortChange("dueDate")}
                className="flex items-center gap-1"
              >
                <Calendar className="h-4 w-4" />
                Due Date
                {sortField === "dueDate" && (
                  sortDirection === "asc" 
                    ? <SortAsc className="h-3 w-3 ml-1" /> 
                    : <SortDesc className="h-3 w-3 ml-1" />
                )}
              </Button>
            </div>
          </div>

          <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="pending">
                Pending Reviews
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed Reviews
              </TabsTrigger>
              {(user?.role === "editor" || user?.role === "admin") && (
                <TabsTrigger value="assignable">
                  To Be Assigned
                </TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-6">
              {displayedSubmissions.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getPaginatedData().map(renderSubmissionCard)}
                  </div>
                  
                  {totalPages > 1 && (
                    <div className="mt-6">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious 
                              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                          
                          {getPageNumbers().map((pageNum, index) => (
                            <PaginationItem key={index}>
                              {pageNum === 'ellipsis' ? (
                                <span className="flex h-9 w-9 items-center justify-center">...</span>
                              ) : (
                                <PaginationLink
                                  isActive={currentPage === pageNum}
                                  onClick={() => typeof pageNum === 'number' && setCurrentPage(pageNum)}
                                  className="cursor-pointer"
                                >
                                  {pageNum}
                                </PaginationLink>
                              )}
                            </PaginationItem>
                          ))}
                          
                          <PaginationItem>
                            <PaginationNext 
                              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-xl font-medium mb-2">
                    {activeTab === "pending" 
                      ? "No Pending Reviews" 
                      : activeTab === "completed" 
                        ? "No Completed Reviews" 
                        : "No Submissions To Assign"}
                  </h3>
                  <p className="text-muted-foreground">
                    {searchQuery || peerReviewFilter !== "all" || dateFilter
                      ? "No reviews match your filter criteria."
                      : activeTab === "pending" 
                        ? "You don't have any pending reviews at the moment." 
                        : activeTab === "completed" 
                          ? "You haven't completed any reviews yet."
                          : "There are no submissions waiting for reviewer assignment."}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>

      {isAssigningReviewers && (
        <ReviewerAssignmentDialog 
          open={isAssigningReviewers}
          onClose={() => setIsAssigningReviewers(false)}
          submission={submissions}
          onAssignReviewers={handleAssignReviewers}
        />
      )}
    </>
      )}
    </div>
  );
};

export default ReviewsPage;
