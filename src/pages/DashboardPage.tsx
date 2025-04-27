import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { dashboardApi } from "@/api/apiService";
import { DashboardStats } from "@/types";
import { FileText, Users, CheckCircle, XCircle, Clock, BookOpen, LineChart, PieChart, BarChart, Activity, Bell } from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import SubmissionChart from "@/components/dashboard/SubmissionChart";
import DecisionChart from "@/components/dashboard/DecisionChart";
import ReviewTimeChart from "@/components/dashboard/ReviewTimeChart";
import CategoryDistributionChart from "@/components/dashboard/CategoryDistributionChart";
import TrendComparisonChart from "@/components/dashboard/TrendComparisonChart";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const categoryData = [
    { name: 'Computer Science', value: 45 },
    { name: 'Medicine', value: 35 },
    { name: 'Biology', value: 28 },
    { name: 'Physics', value: 15 },
    { name: 'Chemistry', value: 12 },
    { name: 'Mathematics', value: 8 }
  ];
                   
  const trendComparisonData = [
    { month: 'Jan', submissions: 40, published: 20, rejected: 10 },
    { month: 'Feb', submissions: 35, published: 15, rejected: 12 },
    { month: 'Mar', submissions: 50, published: 22, rejected: 18 },
    { month: 'Apr', submissions: 45, published: 25, rejected: 15 },
    { month: 'May', submissions: 60, published: 30, rejected: 20 },
    { month: 'Jun', submissions: 75, published: 35, rejected: 25 },
  ];

  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (!user) return;

      try {
        const dashboardStats = await dashboardApi.getStats(user.fullName);
        setStats(dashboardStats);
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        setError("Failed to load dashboard statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [user]);

  if (!user) {
    navigate("/login");
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  const renderRoleDashboard = () => {
    switch (user.role) {
      case "Admin":
        return <AdminDashboard stats={stats!} categoryData={categoryData} trendComparisonData={trendComparisonData} />;
      case "Editor":
        return <EditorDashboard stats={stats!} categoryData={categoryData} trendComparisonData={trendComparisonData} />;
      case "Reviewer":
        return <ReviewerDashboard stats={stats!} />;
      case "Author":
        return <AuthorDashboard stats={stats!} />;
      default:
        return <ReaderDashboard stats={stats!} />;
        
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user.fullName}. Here's your {user.role} dashboard overview.
        </p>
      </div>
      
      {stats && renderRoleDashboard()}
    </div>
  );
};

interface DashboardComponentProps {
  stats: DashboardStats;
  categoryData?: {name: string, value: number}[];
  trendComparisonData?: {month: string, submissions: number, published: number, rejected: number}[];
}

const AdminDashboard = ({ stats, categoryData, trendComparisonData }: DashboardComponentProps) => {
  const navigate = useNavigate();
  
  const recentActivities = [
    { id: 1, user: "Dr. John Smith", action: "Submitted manuscript", target: "Quantum Computing Applications", time: "10 minutes ago" },
    { id: 2, user: "Dr. Sarah Johnson", action: "Completed review for", target: "AI in Medical Diagnostics", time: "45 minutes ago" },
    { id: 3, user: "Dr. Emma Wilson", action: "Requested revision for", target: "Climate Change Metrics", time: "2 hours ago" },
    { id: 4, user: "Prof. Michael Lee", action: "Published article", target: "Neural Networks: A New Approach", time: "3 hours ago" },
    { id: 5, user: "Dr. Robert Chen", action: "Assigned reviewers to", target: "Genetics and Evolution", time: "5 hours ago" },
  ];

  const journalMetrics = [
    { name: "Acceptance Rate", value: 38, target: 40 },
    { name: "Average Review Time", value: 75, target: 100 },
    { name: "Reviewer Response Rate", value: 82, target: 90 },
    { name: "Submission Growth", value: 65, target: 70 },
  ];
  
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Submissions"
          value={stats.totalSubmissions}
          icon={<FileText />}
          trend={{ value: 12, isPositive: true }}
          onClick={() => navigate('/submissions')}
        />
        <StatsCard
          title="Pending Reviews"
          value={stats.pendingReviews}
          icon={<Clock />}
          onClick={() => navigate('/reviews')}
        />
        <StatsCard
          title="Published Articles"
          value={stats.publishedArticles}
          icon={<BookOpen />}
          trend={{ value: 8, isPositive: true }}
          onClick={() => navigate('/articles')}
        />
        <StatsCard
          title="Active Users"
          value="125"
          icon={<Users />}
          trend={{ value: 5, isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="col-span-2 bg-card rounded-lg border shadow-sm">
          <div className="p-6 border-b">
            <h3 className="text-2xl font-semibold leading-none tracking-tight">Recent Activity</h3>
          </div>
          <div className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActivities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium">{activity.user}</TableCell>
                    <TableCell>
                      {activity.action} <span className="font-semibold">{activity.target}</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{activity.time}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4">
              <Button variant="outline" size="sm" onClick={() => navigate("/activities")} className="w-full">
                View All Activities
              </Button>
            </div>
          </div>
        </div>
        
        <div className="col-span-1 bg-card rounded-lg border shadow-sm">
          <div className="p-6 border-b">
            <h3 className="text-2xl font-semibold leading-none tracking-tight">Journal Metrics</h3>
          </div>
          <div className="p-6 space-y-6">
            {journalMetrics.map((metric) => (
              <div key={metric.name} className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">{metric.name}</span>
                  <span className="text-sm font-medium">{metric.value}%</span>
                </div>
                <Progress value={metric.value} className="h-2" />
                <p className="text-xs text-muted-foreground">Target: {metric.target}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {trendComparisonData && (
          <TrendComparisonChart 
            data={trendComparisonData} 
            title="Submission & Publication Trends"
          />
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SubmissionChart
          data={stats.submissionTrends}
          title="Submission Trends"
        />
        <DecisionChart data={stats.decisionRates} />
        {categoryData && <CategoryDistributionChart data={categoryData} />}
      </div>

      <div className="flex justify-end mt-6">
        <Button onClick={() => navigate("/submissions")}>
          View All Submissions
        </Button>
      </div>
    </>
  );
};

const EditorDashboard = ({ stats, categoryData, trendComparisonData }: DashboardComponentProps) => {
  const navigate = useNavigate();
  
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="New Submissions"
          value={stats.totalSubmissions}
          icon={<FileText />}
          onClick={() => navigate('/submissions')}
        />
        <StatsCard
          title="Awaiting Decision"
          value={stats.underReviewSubmissions}
          icon={<Clock />}
          onClick={() => navigate('/submissions?status=under_review')}
        />
        <StatsCard
          title="Accepted"
          value={stats.acceptedSubmissions}
          icon={<CheckCircle />}
          onClick={() => navigate('/submissions?status=accepted')}
        />
        <StatsCard
          title="Rejected"
          value={stats.rejectedSubmissions}
          icon={<XCircle />}
          onClick={() => navigate('/submissions?status=rejected')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {trendComparisonData && (
          <TrendComparisonChart 
            data={trendComparisonData} 
            title="Submission & Publication Trends"
          />
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <SubmissionChart
          data={stats.submissionTrends}
          title="Submission Trends"
        />
        <ReviewTimeChart data={Array.isArray(stats.reviewTimes) ? stats.reviewTimes : [stats.reviewTimes]} />
        {categoryData && <CategoryDistributionChart data={categoryData} />}
      </div>

      <div className="flex justify-end mt-6">
        <Button variant="outline" className="mr-2" onClick={() => navigate("/reviews")}>
          View Review Queue
        </Button>
        <Button onClick={() => navigate("/submissions")}>
          Manage Submissions
        </Button>
      </div>
    </>
  );
};

const ReviewerDashboard = ({ stats }: DashboardComponentProps) => {
  const navigate = useNavigate();
  
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Assigned Reviews"
          value={stats.pendingReviews}
          icon={<Clock />}
          onClick={() => navigate('/reviews')}
        />
        <StatsCard
          title="Completed Reviews"
          value="14"
          icon={<CheckCircle />}
          onClick={() => navigate('/reviews?tab=completed')}
        />
        <StatsCard
          title="Average Review Time"
          value="7 days"
          icon={<FileText />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <ReviewTimeChart data={Array.isArray(stats.reviewTimes) ? stats.reviewTimes : [stats.reviewTimes]} />
        <DecisionChart data={stats.decisionRates} />
      </div>

      <div className="flex justify-end mt-6">
        <Button onClick={() => navigate("/reviews")}>
          View Review Assignments
        </Button>
      </div>
    </>
  );
};

const AuthorDashboard = ({ stats }: DashboardComponentProps) => {
  const navigate = useNavigate();
  
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          title="My Submissions"
          value="7"
          icon={<FileText />}
          onClick={() => navigate('/submissions')}
        />
        <StatsCard
          title="Under Review"
          value="2"
          icon={<Clock />}
          onClick={() => navigate('/submissions?status=under_review')}
        />
        <StatsCard
          title="Accepted"
          value="3"
          icon={<CheckCircle />}
          onClick={() => navigate('/submissions?status=accepted')}
        />
        <StatsCard
          title="Published"
          value="2"
          icon={<BookOpen />}
          onClick={() => navigate('/submissions?status=published')}
        />
      </div>

      <div className="flex justify-end mt-8">
        <Button variant="outline" className="mr-2" onClick={() => navigate("/articles")}>
          View Published Articles
        </Button>
        <Button onClick={() => navigate("/submissions/new")}>
          Submit New Manuscript
        </Button>
      </div>
    </>
  );
};

const ReaderDashboard = ({ stats }: DashboardComponentProps) => {
  const navigate = useNavigate();
  
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Available Articles"
          value={stats.publishedArticles}
          icon={<BookOpen />}
          onClick={() => navigate('/articles')}
        />
        <StatsCard
          title="Recently Published"
          value="12"
          icon={<FileText />}
          description="Articles published in the last month"
          onClick={() => navigate('/articles')}
        />
        <StatsCard
          title="Categories"
          value="8"
          icon={<FileText />}
        />
      </div>

      <div className="flex justify-center mt-10">
        <Button size="lg" onClick={() => navigate("/articles")}>
          Browse Articles
        </Button>
      </div>
    </>
  );
};

export default DashboardPage;
