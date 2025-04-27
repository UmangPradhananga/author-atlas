import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";

const CopyEditorUpload: React.FC<{ submissionId: string }> = ({ submissionId }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({ title: "No file selected", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("submissionId", submissionId);

      await axios.post("/api/copyeditor/upload-edited-file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast({ title: "File uploaded successfully" });
      setFile(null);
    } catch (error) {
      toast({ title: "Upload failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input type="file" accept=".doc,.docx,.pdf" onChange={handleFileChange} />
      <Button onClick={handleUpload} disabled={uploading || !file}>
        {uploading ? "Uploading..." : "Upload Edited File"}
      </Button>
    </div>
  );
};

export default CopyEditorUpload;