
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
import { PlusCircle, Trash2, Upload, FileText, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
    document: "", // URL or file reference
  });

  const [fileInputs, setFileInputs] = useState({
    manuscript: null as File | null,
    supplementary: null as File | null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'manuscript' | 'supplementary') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (20MB max)
      if (file.size > 20 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 20MB",
          variant: "destructive",
        });
        return;
      }
      
      // For manuscript, check if it's a PDF
      if (fileType === 'manuscript' && file.type !== 'application/pdf') {
        toast({
          title: "Invalid file type",
          description: "Manuscript must be a PDF file",
          variant: "destructive",
        });
        return;
      }
      
      setFileInputs({
        ...fileInputs,
        [fileType]: file
      });
      
      // In a real app, we would upload the file and get a URL
      // For demo, we'll just set the filename as the document
      if (fileType === 'manuscript') {
        setFormData({
          ...formData,
          document: file.name // In real app, this would be the file URL after upload
        });
      }
    }
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
    
    if (!fileInputs.manuscript) {
      toast({
        title: "Error",
        description: "Manuscript file is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // In a real app, we would upload the files here and get URLs
      // For demo purposes, we'll just use the file names
      
      // Filter out empty values
      const cleanedAuthors = formData.authors.filter(author => author.trim() !== "");
      const cleanedKeywords = formData.keywords.filter(keyword => keyword.trim() !== "");
      
      const submission: Partial<Submission> = {
        ...formData,
        authors: cleanedAuthors,
        keywords: cleanedKeywords,
        // In a real app, document would be the URL of the uploaded file
        document: fileInputs.manuscript ? fileInputs.manuscript.name : "",
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
            <CardTitle>Manuscript Upload</CardTitle>
            <CardDescription>
              Upload your manuscript and any supplementary files.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="manuscript">Manuscript File (PDF)*</Label>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="manuscript"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {fileInputs.manuscript ? (
                        <>
                          <FileText className="w-8 h-8 mb-2 text-primary" />
                          <p className="text-sm text-primary font-semibold">{fileInputs.manuscript.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(fileInputs.manuscript.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                          <p className="mb-1 text-sm text-muted-foreground">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PDF (MAX 20MB)
                          </p>
                        </>
                      )}
                    </div>
                    <input 
                      id="manuscript" 
                      type="file" 
                      accept=".pdf" 
                      className="hidden" 
                      onChange={(e) => handleFileChange(e, 'manuscript')}
                    />
                  </label>
                </div>
              </div>
              {!fileInputs.manuscript && (
                <p className="text-xs text-muted-foreground">
                  Upload your complete manuscript in PDF format.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplementary">Supplementary Files (Optional)</Label>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="supplementary"
                    className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {fileInputs.supplementary ? (
                        <>
                          <FileText className="w-6 h-6 mb-1 text-primary" />
                          <p className="text-sm text-primary font-semibold">{fileInputs.supplementary.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(fileInputs.supplementary.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 mb-1 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">
                            Upload supplementary files (MAX 20MB)
                          </p>
                        </>
                      )}
                    </div>
                    <input 
                      id="supplementary" 
                      type="file" 
                      className="hidden" 
                      onChange={(e) => handleFileChange(e, 'supplementary')}
                    />
                  </label>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Include any additional files that support your manuscript.
              </p>
            </div>

            <Alert className="bg-muted/50 border-muted">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                Files are not actually uploaded in this demo. In a real application, files would be securely stored.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

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
