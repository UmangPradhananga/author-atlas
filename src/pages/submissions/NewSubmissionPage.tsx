
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import SubmissionForm from "@/components/submissions/SubmissionForm";
import { Eye, EyeOff, User } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const NewSubmissionPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if not an author
  useEffect(() => {
    if (user && user.role !== 'Author') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2">New Submission</h1>
        <p className="text-muted-foreground">
          Create a new manuscript submission for peer review.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SubmissionForm />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Peer Review Types</CardTitle>
              <CardDescription>
                Choose the review type that best suits your submission.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-primary" />
                    <h3 className="font-medium">Open Review</h3>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    Authors and reviewers are visible to each other. Encourages accountability and constructive dialogue.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    <h3 className="font-medium">Single-Blind Review</h3>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    Reviewers know author identities, but authors don't know who reviewed their work.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <EyeOff className="h-4 w-4 text-primary" />
                    <h3 className="font-medium">Double-Blind Review</h3>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    Both authors and reviewers remain anonymous to each other. Helps reduce bias in the review process.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Submission Guidelines</CardTitle>
              <CardDescription>
                Review these guidelines before submitting your manuscript.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                <li>Manuscript should be well-structured with clear sections</li>
                <li>Include comprehensive literature review</li>
                <li>Provide detailed methodology</li>
                <li>Ensure proper citation format</li>
                <li>All figures and tables should be properly labeled</li>
                <li>Submit in PDF format (max 20MB)</li>
                <li>Proofread for grammar and spelling</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>File Requirements</CardTitle>
              <CardDescription>
                Ensure your files meet these requirements.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                <li>Main manuscript: PDF format</li>
                <li>Supplementary files: ZIP archive (if applicable)</li>
                <li>Maximum file size: 20MB per file</li>
                <li>Figures should be at least 300 DPI resolution</li>
                <li>Tables should be embedded in the manuscript</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NewSubmissionPage;
