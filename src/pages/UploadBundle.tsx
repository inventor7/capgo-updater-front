import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Upload, 
  File, 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  Package, 
  Smartphone, 
  Hash,
  ToggleLeft
} from "lucide-react";
import { apiService } from "@/api/apiService";

export const UploadBundle = () => {
  const [file, setFile] = useState<File | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    version: '',
    platform: 'android',
    channel: 'stable',
    environment: 'prod',
    required: false,
  });
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!file) {
      errors.file = 'Please select a file to upload';
    } else if (!file.name.endsWith('.zip')) {
      errors.file = 'Only ZIP files are allowed';
    }
    
    if (!formData.version.trim()) {
      errors.version = 'Version is required';
    } else if (!/^\d+\.\d+\.\d+$/.test(formData.version)) {
      errors.version = 'Version must follow semantic versioning (e.g., 1.2.3)';
    }
    
    if (!formData.platform) {
      errors.platform = 'Platform is required';
    }
    
    if (!formData.channel) {
      errors.channel = 'Channel is required';
    }
    
    if (!formData.environment) {
      errors.environment = 'Environment is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Clear file error if it existed
      if (formErrors.file) {
        setFormErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.file;
          return newErrors;
        });
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific field error if it existed
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific field error if it existed
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      required: checked
    }));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      if (selectedFile.type === 'application/zip' || selectedFile.name.endsWith('.zip')) {
        setFile(selectedFile);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setUploadStatus('uploading');
    setUploadError(null);

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      if (file) {
        formDataToSend.append('bundle', file);
      }
      formDataToSend.append('version', formData.version);
      formDataToSend.append('platform', formData.platform);
      formDataToSend.append('channel', formData.channel);
      formDataToSend.append('environment', formData.environment);
      formDataToSend.append('required', formData.required.toString());

      for (const [key, value] of formDataToSend.entries()) {
  console.log(key, value);
}

      // Upload bundle using API service
      await apiService.uploadBundle(formDataToSend);
      
      setUploadStatus('success');
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setUploadError('Failed to upload bundle. Please try again.');
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const resetForm = () => {
    setFile(null);
    setFormData({
      version: '',
      platform: 'android',
      channel: 'stable',
      environment: 'prod',
      required: false,
    });
    setUploadStatus('idle');
    setUploadError(null);
    setFormErrors({});
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload New Bundle</h1>
        <p className="text-muted-foreground">
          Upload a new app bundle for distribution
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bundle Information</CardTitle>
          <CardDescription>
            Provide details about the new bundle to be uploaded
          </CardDescription>
        </CardHeader>
        <CardContent>
          {uploadError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          )}

          {uploadStatus === 'success' && (
            <Alert className="mb-6">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-700">
                Bundle uploaded successfully! Your bundle has been uploaded and is now available.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="bundle-file">Bundle File *</Label>
              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  formErrors.file ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-primary'
                }`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={triggerFileInput}
              >
                <input
                  type="file"
                  id="bundle-file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".zip"
                  onChange={handleFileChange}
                />
                
                {file ? (
                  <div className="flex flex-col items-center">
                    <File className="w-10 h-10 text-primary mb-3" />
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Click to change file</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="w-10 h-10 text-muted-foreground mb-3" />
                    <p className="font-medium">Click to upload or drag and drop</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      ZIP files only (MAX. 100MB)
                    </p>
                  </div>
                )}
              </div>
              {formErrors.file && (
                <p className="text-sm text-red-500">{formErrors.file}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Version */}
              <div className="space-y-2">
                <Label htmlFor="version">Version *</Label>
                <div className="relative">
                  <Package className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="version"
                    name="version"
                    value={formData.version}
                    onChange={handleInputChange}
                    placeholder="e.g. 1.2.3"
                    disabled={uploadStatus === 'uploading'}
                    className="pl-9"
                  />
                </div>
                {formErrors.version && (
                  <p className="text-sm text-red-500">{formErrors.version}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Semantic version (e.g. 1.2.3) for the bundle
                </p>
              </div>

              {/* Platform */}
              <div className="space-y-2">
                <Label htmlFor="platform">Platform *</Label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Select 
                    value={formData.platform} 
                    onValueChange={(value) => handleSelectChange('platform', value)}
                    disabled={uploadStatus === 'uploading'}
                  >
                    <SelectTrigger className="pl-9">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="android">Android</SelectItem>
                      <SelectItem value="ios">iOS</SelectItem>
                      <SelectItem value="web">Web</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formErrors.platform && (
                  <p className="text-sm text-red-500">{formErrors.platform}</p>
                )}
              </div>

              {/* Channel */}
              <div className="space-y-2">
                <Label htmlFor="channel">Channel *</Label>
                <div className="relative">
                  <ToggleLeft className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Select 
                    value={formData.channel} 
                    onValueChange={(value) => handleSelectChange('channel', value)}
                    disabled={uploadStatus === 'uploading'}
                  >
                    <SelectTrigger className="pl-9">
                      <SelectValue placeholder="Select channel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stable">Stable</SelectItem>
                      <SelectItem value="beta">Beta</SelectItem>
                      <SelectItem value="dev">Development</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formErrors.channel && (
                  <p className="text-sm text-red-500">{formErrors.channel}</p>
                )}
              </div>

              {/* Environment */}
              <div className="space-y-2">
                <Label htmlFor="environment">Environment *</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Select 
                    value={formData.environment} 
                    onValueChange={(value) => handleSelectChange('environment', value)}
                    disabled={uploadStatus === 'uploading'}
                  >
                    <SelectTrigger className="pl-9">
                      <SelectValue placeholder="Select environment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prod">Production</SelectItem>
                      <SelectItem value="staging">Staging</SelectItem>
                      <SelectItem value="dev">Development</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formErrors.environment && (
                  <p className="text-sm text-red-500">{formErrors.environment}</p>
                )}
              </div>
            </div>

            {/* Required Update */}
            <div className="flex items-start space-x-3">
              <div className="pt-0.5">
                <Checkbox
                  id="required"
                  checked={formData.required}
                  onCheckedChange={handleCheckboxChange}
                  disabled={uploadStatus === 'uploading'}
                />
              </div>
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="required"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Required Update
                </label>
                <p className="text-sm text-muted-foreground">
                  Users will be forced to update to this version
                </p>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={resetForm}
                disabled={uploadStatus === 'uploading'}
              >
                Reset
              </Button>
              <Button 
                type="submit" 
                disabled={uploadStatus === 'uploading' || !file || !formData.version}
              >
                {uploadStatus === 'uploading' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload Bundle'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};