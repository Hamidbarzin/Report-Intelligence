import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { uploadFiles } from "@/lib/api";

interface FileUploaderProps {
  onUploadComplete?: (reportId: number) => void;
}

export function FileUploader({ onUploadComplete }: FileUploaderProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [autoAnalyze, setAutoAnalyze] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles(prev => [...prev, ...files]);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for the report",
        variant: "destructive"
      });
      return;
    }

    if (selectedFiles.length === 0) {
      toast({
        title: "Error", 
        description: "Please select at least one file to upload",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const fileList = new DataTransfer();
      selectedFiles.forEach(file => fileList.items.add(file));

      const result = await uploadFiles(title, fileList.files);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      toast({
        title: "Success",
        description: "Files uploaded successfully",
      });

      // Reset form
      setSelectedFiles([]);
      setTitle("");
      setDescription("");
      
      onUploadComplete?.(result.reportId);
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Upload failed",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Card>
      <CardContent className="p-8">
        <h2 className="text-xl font-semibold mb-6">Upload New Report</h2>
        
        {/* File Upload Area */}
        <div 
          className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary/50 transition-colors mb-6"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          data-testid="upload-dropzone"
        >
          <div className="space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Drop files here or click to upload</h3>
              <p className="text-muted-foreground">فقط فایل‌های HTML پذیرفته می‌شوند</p>
              <p className="text-sm text-muted-foreground">Maximum file size: 20MB per file</p>
            </div>
            <Button asChild>
              <label>
                Select Files
                <input
                  type="file"
                  multiple
                  accept=".html,.htm"
                  onChange={handleFileSelect}
                  className="hidden"
                  data-testid="input-file-select"
                />
              </label>
            </Button>
          </div>
        </div>

        {/* Selected Files */}
        {selectedFiles.length > 0 && (
          <div className="space-y-4 mb-6">
            <h3 className="font-medium">Selected Files</h3>
            <div className="space-y-3">
              {selectedFiles.map((file, index) => (
                <div 
                  key={index} 
                  className="flex items-center space-x-3 p-3 bg-muted rounded-lg"
                  data-testid={`file-item-${index}`}
                >
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    data-testid={`button-remove-file-${index}`}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-4 mb-6" data-testid="upload-progress">
            <h3 className="font-medium">Uploading Files</h3>
            <Progress value={uploadProgress} className="w-full" />
            <p className="text-sm text-muted-foreground">{uploadProgress}% complete</p>
          </div>
        )}

        {/* Report Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title">Report Title</Label>
            <Input
              id="title"
              type="text"
              placeholder="Enter report title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              data-testid="input-title"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              rows={3}
              placeholder="Brief description of the report..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              data-testid="textarea-description"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="autoAnalyze"
                checked={autoAnalyze}
                onCheckedChange={setAutoAnalyze}
                data-testid="checkbox-auto-analyze"
              />
              <Label htmlFor="autoAnalyze">Auto-analyze after upload</Label>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button type="button" variant="secondary">
                Save Draft
              </Button>
              <Button 
                type="submit" 
                disabled={isUploading}
                data-testid="button-upload"
              >
                {isUploading ? "Uploading..." : "Upload & Process"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
