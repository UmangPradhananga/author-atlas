import { useState, useEffect } from "react";
import { useSubmissions } from "@/context/SubmissionContext";
import { useAuth } from "@/context/AuthContext";
import { Submission, SubmissionStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import SubmissionCard from "@/components/submissions/SubmissionCard";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  Filter, 
  Plus, 
  Search, 
  SortAsc, 
  SortDesc, 
  Calendar, 
  BookOpen 
} from "lucide-react";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

const SubmissionsPage = () => {
  const { user } = useAuth();
  const { userSubmissions, loading, error, fetchSubmissions } = useSubmissions();
  const [searchParams] = useSearchParams();
  const statusParam = searchParams.get('status') as SubmissionStatus | null;
  const [activeTab, setActiveTab] = useState<string>(statusParam || "all");
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([]);
  const [displayedSubmissions, setDisplayedSubmissions] = useState<Submission[]>([]);
  const navigate = useNavigate();

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  // Filter and search states
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<string>("updatedDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<string | null>(null);

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

    let result = [...userSubmissions];

    // Filter by tab (status)
    if (activeTab !== "all") {
      result = result.filter(
        (submission) => submission.status === activeTab
      );
    }

    setFilteredSubmissions(result);
  }, [activeTab, userSubmissions]);

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
    
    // Apply category filter
    if (categoryFilter) {
      result = result.filter(submission => submission.category === categoryFilter);
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
        case "year":
          filterDate = new Date(today.setFullYear(today.getFullYear() - 1));
          break;
      }
      
      result = result.filter(submission => {
        const submissionDate = new Date(submission.updatedDate);
        return submissionDate >= filterDate;
      });
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let fieldA, fieldB;
      
      switch (sortField) {
        case "title":
          fieldA = a.title.toLowerCase();
          fieldB = b.title.toLowerCase();
          break;
        case "updatedDate":
          fieldA = new Date(a.updatedDate).getTime();
          fieldB = new Date(b.updatedDate).getTime();
          break;
        case "submittedDate":
          fieldA = new Date(a.submittedDate).getTime();
          fieldB = new Date(b.submittedDate).getTime();
          break;
        default:
          fieldA = new Date(a.updatedDate).getTime();
          fieldB = new Date(b.updatedDate).getTime();
      }
      
      if (sortDirection === "asc") {
        return fieldA < fieldB ? -1 : fieldA > fieldB ? 1 : 0;
      } else {
        return fieldA > fieldB ? -1 : fieldA < fieldB ? 1 : 0;
      }
    });
    
    setDisplayedSubmissions(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [filteredSubmissions, searchQuery, sortField, sortDirection, categoryFilter, dateFilter]);

  // Get paginated data
  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return displayedSubmissions.slice(startIndex, endIndex);
  };

  // Calculate total pages
  const totalPages = Math.ceil(displayedSubmissions.length / itemsPerPage);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total pages is less than max pages to show
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);
      
      // Calculate start and end of middle pages
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if we're near the beginning or end
      if (currentPage <= 3) {
        endPage = Math.min(maxPagesToShow - 1, totalPages - 1);
      } else if (currentPage >= totalPages - 2) {
        startPage = Math.max(2, totalPages - (maxPagesToShow - 2));
      }
      
      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pageNumbers.push('ellipsis');
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pageNumbers.push('ellipsis');
      }
      
      // Always show last page
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

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

  // Get unique categories from submissions
  const getUniqueCategories = () => {
    if (!userSubmissions) return [];
    const categories = [...new Set(userSubmissions.map(s => s.category))];
    return categories.filter(Boolean) as string[];
  };

  // Toggle sort direction or change sort field
  const handleSortChange = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const isAuthor = user?.role === "author";
  
  // Fix: Add default empty array to avoid undefined errors
  const submissionStatuses = [...new Set((userSubmissions || []).map(s => s.status))];
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };
  
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
          <div className="flex flex-col space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search submissions..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleSortChange("updatedDate")}
                  className="flex items-center gap-1"
                >
                  <Calendar className="h-4 w-4" />
                  Date Updated
                  {sortField === "updatedDate" && (
                    sortDirection === "asc" 
                      ? <SortAsc className="h-3 w-3 ml-1" /> 
                      : <SortDesc className="h-3 w-3 ml-1" />
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleSortChange("title")}
                  className="flex items-center gap-1"
                >
                  <BookOpen className="h-4 w-4" />
                  Title
                  {sortField === "title" && (
                    sortDirection === "asc" 
                      ? <SortAsc className="h-3 w-3 ml-1" /> 
                      : <SortDesc className="h-3 w-3 ml-1" />
                  )}
                </Button>
                
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
                        <Label htmlFor="category-filter">Category</Label>
                        <Select 
                          value={categoryFilter || ""} 
                          onValueChange={(value) => setCategoryFilter(value || null)}
                        >
                          <SelectTrigger id="category-filter">
                            <SelectValue placeholder="Filter by category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">All Categories</SelectItem>
                            {getUniqueCategories().map(category => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="date-filter">Date</Label>
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
                            <SelectItem value="year">Past Year</SelectItem>
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
                          setSortField("updatedDate");
                          setSortDirection("desc");
                          setCategoryFilter(null);
                          setDateFilter(null);
                          setItemsPerPage(6);
                        }}
                      >
                        Reset Filters
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            {displayedSubmissions.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getPaginatedData().map((submission) => (
                    <SubmissionCard key={submission.id} submission={submission} />
                  ))}
                </div>
                
                {/* Pagination component */}
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
            )}
            
            {displayedSubmissions.length === 0 && (
              <div className="text-center py-16">
                <h3 className="text-xl font-medium mb-2">No submissions found</h3>
                <p className="text-muted-foreground mb-6">
                  {activeTab === "all"
                    ? searchQuery || categoryFilter || dateFilter 
                      ? "No submissions match your filter criteria."
                      : "You haven't created any submissions yet."
                    : `You don't have any submissions with status: ${activeTab}.`}
                </p>
                {isAuthor && (
                  <Button onClick={() => navigate("/submissions/new")}>
                    <Plus className="mr-2 h-4 w-4" /> Create New Submission
                  </Button>
                )}
              </div>
            )}
          </div>
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

      {loading ? (
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
