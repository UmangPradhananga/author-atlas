
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useSubmissions } from "@/context/SubmissionContext";
import { Submission } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusCircle, Trash2 } from "lucide-react";

const SubmissionForm = () => {
  const { createSubmission } = useSubmissions();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    abstract: "",
    authors: [""],
    keywords: [""],
    coverLetter: "",
    category: "",
    document: "", // In a real app, this would be a file upload URL
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAuthorChange = (index: number, value: string) => {
    const updatedAuthors = [...formData.authors];
    updatedAuthors[index] = value;
    setFormData({ ...formData, authors: updatedAuthors });
  };

  const addAuthor = () => {
    setFormData({ ...formData, authors: [...formData.authors, ""] });
  };

  const removeAuthor = (index: number) => {
    if (formData.authors.length <= 1) return;
    const updatedAuthors = formData.authors.filter((_, i) => i !== index);
    setFormData({ ...formData, authors: updatedAuthors });
  };

  const handleKeywordChange = (index: number, value: string) => {
    const updatedKeywords = [...formData.keywords];
    updatedKeywords[index] = value;
    setFormData({ ...formData, keywords: updatedKeywords });
  };

  const addKeyword = () => {
    setFormData({ ...formData, keywords: [...formData.keywords, ""] });
  };

  const removeKeyword = (index: number) => {
    if (formData.keywords.length <= 1) return;
    const updatedKeywords = formData.keywords.filter((_, i) => i !== index);
    setFormData({ ...formData, keywords: updatedKeywords });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.abstract.trim()) {
      toast({
        title: "Error",
        description: "Abstract is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.authors[0].trim()) {
      toast({
        title: "Error",
        description: "At least one author is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Filter out empty values
      const cleanedAuthors = formData.authors.filter(author => author.trim() !== "");
      const cleanedKeywords = formData.keywords.filter(keyword => keyword.trim() !== "");
      
      const submission: Partial<Submission> = {
        ...formData,
        authors: cleanedAuthors,
        keywords: cleanedKeywords,
      };

      const newSubmission = await createSubmission(submission);
      
      toast({
        title: "Success",
        description: "Your submission has been created as a draft",
      });
      
      navigate(`/submissions/${newSubmission.id}`);
    } catch (error) {
      console.error("Error creating submission:", error);
      toast({
        title: "Error",
        description: "Failed to create submission. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Manuscript Information</CardTitle>
            <CardDescription>
              Enter the details of your manuscript submission.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title*</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter the title of your manuscript"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="abstract">Abstract*</Label>
              <Textarea
                id="abstract"
                name="abstract"
                value={formData.abstract}
                onChange={handleChange}
                placeholder="Enter the abstract of your manuscript"
                className="min-h-32"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Authors*</Label>
              {formData.authors.map((author, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    value={author}
                    onChange={(e) => handleAuthorChange(index, e.target.value)}
                    placeholder={`Author ${index + 1} name`}
                    required={index === 0}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAuthor(index)}
                    disabled={formData.authors.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={addAuthor}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Author
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Keywords</Label>
              {formData.keywords.map((keyword, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    value={keyword}
                    onChange={(e) => handleKeywordChange(index, e.target.value)}
                    placeholder={`Keyword ${index + 1}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeKeyword(index)}
                    disabled={formData.keywords.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={addKeyword}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Keyword
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category*</Label>
              <Input
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g., Computer Science, Medicine, Economics"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverLetter">Cover Letter</Label>
              <Textarea
                id="coverLetter"
                name="coverLetter"
                value={formData.coverLetter}
                onChange={handleChange}
                placeholder="Enter your cover letter to the editor"
                className="min-h-24"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="document">Manuscript PDF Link*</Label>
              <Input
                id="document"
                name="document"
                value={formData.document}
                onChange={handleChange}
                placeholder="Enter a link to your manuscript PDF"
                required
              />
              <p className="text-xs text-muted-foreground">
                In a real application, this would be a file upload component.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save as Draft"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </form>
  );
};

export default SubmissionForm;
