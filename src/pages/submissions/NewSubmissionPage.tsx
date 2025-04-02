
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import RichTextEditor from "@/components/editor/RichTextEditor";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const NewSubmissionPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if not an author
  useEffect(() => {
    if (user && user.role !== 'author') {
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
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Manuscript Editor</CardTitle>
            <CardDescription>
              Write or paste your manuscript content here. Use the formatting toolbar to style your text.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RichTextEditor 
              placeholder="Begin typing your manuscript or paste your content here..."
              minHeight="500px"
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Submission Form</CardTitle>
              <CardDescription>
                Fill out the required details for your submission.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Complete the submission form with all required information.
              </p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => navigate('/submissions/new')}>
                Open Form
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Guidelines</CardTitle>
              <CardDescription>
                Review submission guidelines before submitting.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                <li>Manuscript should be well-structured with clear sections</li>
                <li>Include comprehensive literature review</li>
                <li>Provide detailed methodology</li>
                <li>Ensure proper citation format</li>
                <li>Proofread for grammar and spelling</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NewSubmissionPage;
