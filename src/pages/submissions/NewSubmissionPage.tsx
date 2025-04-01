
import SubmissionForm from "@/components/submissions/SubmissionForm";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

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

      <SubmissionForm />
    </div>
  );
};

export default NewSubmissionPage;
