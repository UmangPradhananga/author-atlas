import { useState } from "react";                                                                                                        
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useSubmissions } from "@/context/SubmissionContext";
import { Submission, PeerReviewType } from "@/types";
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { PlusCircle, Trash2, Upload, FileText, AlertCircle, Eye, EyeOff, User, Plus, Minus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CreateJournalRequest } from "@/types/journal";

// Define types for manuscript files
interface ManuscriptFile {
  id: string;
  file: File | null;
  title: string;
  type: string; // e.g., "main", "supplementary", "data", "code"
}

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
    peerReviewType: "double_blind" as PeerReviewType, // Default to double-blind review
  });

  // New state for handling multiple manuscript files
  const [manuscriptFiles, setManuscriptFiles] = useState<ManuscriptFile[]>([
    { 
      id: "main-manuscript", 
      file: null, 
      title: "Main Manuscript", 
      type: "main" 
    },
    { 
      id: "supplementary-1", 
      file: null, 
      title: "Supplementary File 1", 
      type: "supplementary" 
    }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  // Updated file handling for multiple manuscripts
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileId: string) => {
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
      
      // For main manuscript, check if it's a PDF
      const fileItem = manuscriptFiles.find(f => f.id === fileId);
      if (fileItem?.type === 'main' && file.type !== 'application/pdf') {
        toast({
          title: "Invalid file type",
          description: "Main manuscript must be a PDF file",
          variant: "destructive",
        });
        return;
      }
      
      // Update the file in the manuscriptFiles array
      setManuscriptFiles(prev => 
        prev.map(item => 
          item.id === fileId ? { ...item, file } : item
        )
      );
      
      // Set the main document reference if it's the main manuscript
      if (fileItem?.type === 'main') {
        setFormData({
          ...formData,
          document: file.name // In real app, this would be the file URL after upload
        });
      }
    }
  };

  // Add a new manuscript file entry
  const addManuscriptFile = () => {
    const newId = `supplementary-${manuscriptFiles.length}`;
    setManuscriptFiles([
      ...manuscriptFiles,
      {
        id: newId,
        file: null,
        title: `Supplementary File ${manuscriptFiles.length}`,
        type: "supplementary"
      }
    ]);
  };

  // Remove a manuscript file entry
  const removeManuscriptFile = (fileId: string) => {
    // Don't allow removing the main manuscript
    if (fileId === "main-manuscript") return;
    
    setManuscriptFiles(prev => prev.filter(item => item.id !== fileId));
  };

  // Update the title of a manuscript file
  const updateManuscriptTitle = (fileId: string, newTitle: string) => {
    setManuscriptFiles(prev => 
      prev.map(item => 
        item.id === fileId ? { ...item, title: newTitle } : item
      )
    );
  };

  // Existing functions for handling authors and keywords
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
    
    // Check if main manuscript is uploaded
    const mainManuscript = manuscriptFiles.find(f => f.id === "main-manuscript");
    if (!mainManuscript?.file) {
      toast({
        title: "Error",
        description: "Main manuscript file is required",
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
      
      // Prepare file information (in a real app, these would be URLs after upload)
      const files = manuscriptFiles
        .filter(item => item.file !== null)
        .map(item => ({
          filename: item.file!.name,
          title: item.title,
          type: item.type,
          size: item.file!.size
        }));
      
      const submission: Partial<CreateJournalRequest> = {
        ...formData,
        AuthorIds: cleanedAuthors,
        Keywords: cleanedKeywords,
        Document: mainManuscript?.file?.name || "", // Main document
        // In a real implementation, we would store the files information in a dedicated field
      };

      const newSubmission = await createSubmission(submission);
      
      toast({
        title: "Success",
        description: "Your submission has been created as a draft",
      });
      
      navigate(`/submissions`); // Redirect to the submission details page
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
            {/* Manuscript files section with add/remove buttons */}
            <div className="space-y-4">
              {manuscriptFiles.map((fileItem) => (
                <div key={fileItem.id} className="space-y-2 border rounded-lg p-4 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={fileItem.id} className="font-medium">
                        {fileItem.type === 'main' ? 'Main Manuscript (PDF)*' : 'Supplementary File'}
                      </Label>
                      {fileItem.type !== 'main' && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeManuscriptFile(fileItem.id)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <Input
                      placeholder="File title"
                      value={fileItem.title}
                      onChange={(e) => updateManuscriptTitle(fileItem.id, e.target.value)}
                      className="max-w-[200px]"
                    />
                  </div>

                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor={fileItem.id}
                      className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {fileItem.file ? (
                          <>
                            <FileText className="w-6 h-6 mb-2 text-primary" />
                            <p className="text-sm text-primary font-semibold">{fileItem.file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(fileItem.file.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </>
                        ) : (
                          <>
                            <Upload className="w-6 h-6 mb-2 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">
                              {fileItem.type === 'main' 
                                ? 'Upload main manuscript (PDF only)' 
                                : 'Upload supplementary file'
                              }
                            </p>
                          </>
                        )}
                      </div>
                      <input 
                        id={fileItem.id} 
                        type="file" 
                        accept={fileItem.type === 'main' ? ".pdf" : undefined}
                        className="hidden" 
                        onChange={(e) => handleFileChange(e, fileItem.id)}
                      />
                    </label>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                className="mt-2 w-full"
                onClick={addManuscriptFile}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Supplementary File
              </Button>
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
              <Label htmlFor="peerReviewType">Peer Review Type*</Label>
              <TooltipProvider>
                <Select 
                  value={formData.peerReviewType} 
                  onValueChange={(value) => handleSelectChange("peerReviewType", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select peer review type" />
                  </SelectTrigger>
                  <SelectContent>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SelectItem value="open" className="flex items-center">
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-2" />
                            <span>Open Review</span>
                          </div>
                        </SelectItem>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <p>Authors and reviewers are visible to each other. Encourages accountability and transparency.</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SelectItem value="single_blind" className="flex items-center">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2" />
                            <span>Single-Blind Review</span>
                          </div>
                        </SelectItem>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <p>Reviewers know author identities, but authors don't know who reviewed their work.</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SelectItem value="double_blind" className="flex items-center">
                          <div className="flex items-center">
                            <EyeOff className="h-4 w-4 mr-2" />
                            <span>Double-Blind Review</span>
                          </div>
                        </SelectItem>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <p>Both authors and reviewers remain anonymous to each other. Helps reduce bias in the review process.</p>
                      </TooltipContent>
                    </Tooltip>
                  </SelectContent>
                </Select>
              </TooltipProvider>
              <p className="text-xs text-muted-foreground">
                Select how you prefer your manuscript to be reviewed. This affects which reviewers will be selected.
              </p>
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
