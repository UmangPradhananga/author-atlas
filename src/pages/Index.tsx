
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  BookOpen, 
  FileEdit, 
  CheckCircle, 
  FileText, 
  Users, 
  ArrowRight,
  ChevronRight 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-r from-journal-blue/10 to-journal-purple/10">
        <div className="app-container text-center">
          <BookOpen className="h-16 w-16 mx-auto mb-6 text-journal-blue" />
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Journal Management System
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto text-muted-foreground">
            A comprehensive platform for managing academic journal submissions, 
            peer reviews, and publications with role-based access control.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {!user ? (
              <Button size="lg" onClick={() => navigate("/login")}>
                Sign In
              </Button>
            ) : (
              <Button size="lg" onClick={() => navigate("/dashboard")}>
                Go to Dashboard
              </Button>
            )}
            <Button size="lg" variant="outline" onClick={() => navigate("/articles")}>
              Browse Articles
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="app-container">
          <h2 className="text-3xl font-bold mb-12 text-center">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow">
              <FileEdit className="h-10 w-10 mb-4 text-journal-blue" />
              <h3 className="text-xl font-semibold mb-3">Submission Management</h3>
              <p className="text-muted-foreground mb-4">
                Authors can easily submit manuscripts, track their status, and respond to reviewer comments.
              </p>
            </div>
            <div className="p-6 border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow">
              <CheckCircle className="h-10 w-10 mb-4 text-journal-blue" />
              <h3 className="text-xl font-semibold mb-3">Peer Review Process</h3>
              <p className="text-muted-foreground mb-4">
                Streamlined review assignments, structured evaluation forms, and efficient communication.
              </p>
            </div>
            <div className="p-6 border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow">
              <FileText className="h-10 w-10 mb-4 text-journal-blue" />
              <h3 className="text-xl font-semibold mb-3">Editorial Workflow</h3>
              <p className="text-muted-foreground mb-4">
                Tools for editors to manage submissions, assign reviewers, and make publication decisions.
              </p>
            </div>
            <div className="p-6 border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow">
              <Users className="h-10 w-10 mb-4 text-journal-blue" />
              <h3 className="text-xl font-semibold mb-3">Role-Based Access</h3>
              <p className="text-muted-foreground mb-4">
                Customized interfaces and permissions for admins, editors, reviewers, authors, and readers.
              </p>
            </div>
            <div className="p-6 border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow">
              <BookOpen className="h-10 w-10 mb-4 text-journal-blue" />
              <h3 className="text-xl font-semibold mb-3">Published Articles</h3>
              <p className="text-muted-foreground mb-4">
                Readers can browse, search, and access published articles with comprehensive metadata.
              </p>
            </div>
            <div className="p-6 border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow">
              <ArrowRight className="h-10 w-10 mb-4 text-journal-blue" />
              <h3 className="text-xl font-semibold mb-3">API Ready</h3>
              <p className="text-muted-foreground mb-4">
                Built with a service layer architecture to easily connect to real backend systems.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-journal-blue">
        <div className="app-container text-center">
          <h2 className="text-3xl font-bold mb-6 text-white">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-white/80 max-w-2xl mx-auto">
            Join our journal management system to streamline your academic publishing workflow.
          </p>
          <Button size="lg" variant="secondary" onClick={() => navigate("/login")}>
            Sign In Now
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;
