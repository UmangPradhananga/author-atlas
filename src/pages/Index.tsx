
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  BookOpen, 
  FileEdit, 
  CheckCircle, 
  FileText, 
  Users, 
  ArrowRight,
  ChevronRight,
  BarChart,
  PieChart,
  LineChart
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      {/* Hero Section with improved gradient */}
      <section className="py-20 md:py-32 bg-gradient-to-r from-journal-purple/20 via-journal-blue/20 to-journal-indigo/20">
        <div className="app-container text-center">
          <div className="animate-fade-in">
            <BookOpen className="h-16 w-16 mx-auto mb-6 text-journal-blue" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-journal-blue to-journal-purple">
              Journal Management System
            </h1>
            <p className="text-xl mb-10 max-w-3xl mx-auto text-muted-foreground">
              A comprehensive platform for managing academic journal submissions, 
              peer reviews, and publications with role-based access control.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {!user ? (
                <Button size="lg" className="bg-gradient-to-r from-journal-blue to-journal-purple hover:from-journal-darkBlue hover:to-journal-darkPurple transition-all duration-300" onClick={() => navigate("/login")}>
                  Sign In
                </Button>
              ) : (
                <Button size="lg" className="bg-gradient-to-r from-journal-blue to-journal-purple hover:from-journal-darkBlue hover:to-journal-darkPurple transition-all duration-300" onClick={() => navigate("/dashboard")}>
                  Go to Dashboard
                </Button>
              )}
              <Button size="lg" variant="outline" className="border-2 hover:bg-secondary/50 transition-all duration-300" onClick={() => navigate("/articles")}>
                Browse Articles
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with card hover effects */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-background to-secondary/30">
        <div className="app-container">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">Key Features</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">Comprehensive tools for academic journal management, from submission to publication</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 border rounded-xl bg-card shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="rounded-full bg-journal-blue/10 w-16 h-16 flex items-center justify-center mb-4">
                <FileEdit className="h-8 w-8 text-journal-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Submission Management</h3>
              <p className="text-muted-foreground mb-4">
                Authors can easily submit manuscripts, track their status, and respond to reviewer comments.
              </p>
            </div>
            <div className="p-6 border rounded-xl bg-card shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="rounded-full bg-journal-purple/10 w-16 h-16 flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-journal-purple" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Peer Review Process</h3>
              <p className="text-muted-foreground mb-4">
                Streamlined review assignments, structured evaluation forms, and efficient communication.
              </p>
            </div>
            <div className="p-6 border rounded-xl bg-card shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="rounded-full bg-journal-indigo/10 w-16 h-16 flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-journal-indigo" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Editorial Workflow</h3>
              <p className="text-muted-foreground mb-4">
                Tools for editors to manage submissions, assign reviewers, and make publication decisions.
              </p>
            </div>
            <div className="p-6 border rounded-xl bg-card shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="rounded-full bg-journal-blue/10 w-16 h-16 flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-journal-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Role-Based Access</h3>
              <p className="text-muted-foreground mb-4">
                Customized interfaces and permissions for admins, editors, reviewers, authors, and readers.
              </p>
            </div>
            <div className="p-6 border rounded-xl bg-card shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="rounded-full bg-journal-indigo/10 w-16 h-16 flex items-center justify-center mb-4">
                <BookOpen className="h-8 w-8 text-journal-indigo" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Published Articles</h3>
              <p className="text-muted-foreground mb-4">
                Readers can browse, search, and access published articles with comprehensive metadata.
              </p>
            </div>
            <div className="p-6 border rounded-xl bg-card shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="rounded-full bg-journal-purple/10 w-16 h-16 flex items-center justify-center mb-4">
                <BarChart className="h-8 w-8 text-journal-purple" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Analytics & Reports</h3>
              <p className="text-muted-foreground mb-4">
                Comprehensive dashboards with visual charts to track submissions, reviews, and publication metrics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section (New) */}
      <section className="py-16 bg-card">
        <div className="app-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Platform Statistics</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Our growing community of researchers and academics</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-journal-blue mb-2">500+</div>
              <p className="text-muted-foreground">Published Articles</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-journal-purple mb-2">1,200+</div>
              <p className="text-muted-foreground">Active Researchers</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-journal-indigo mb-2">50+</div>
              <p className="text-muted-foreground">Journal Categories</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-journal-blue mb-2">92%</div>
              <p className="text-muted-foreground">Review Completion</p>
            </div>
          </div>
        </div>
      </section>

      {/* Improved CTA Section */}
      <section className="py-20 bg-gradient-to-r from-journal-darkBlue to-journal-darkPurple">
        <div className="app-container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-white/80 max-w-2xl mx-auto">
            Join our journal management system to streamline your academic publishing workflow.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" variant="secondary" className="hover:bg-white transition-colors duration-300" onClick={() => navigate("/login")}>
              Sign In Now
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10 transition-colors duration-300" onClick={() => navigate("/articles")}>
              Explore Articles
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
