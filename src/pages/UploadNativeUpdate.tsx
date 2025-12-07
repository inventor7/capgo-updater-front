import { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  ToggleLeft,
} from "lucide-react";
import { apiService } from "@/api/apiService";

export const UploadNativeUpdate = () => {
  const [file, setFile] = useState<File | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    version: "",
    version_code: "",
    platform: "android",
    channel: "stable",
    environment: "prod",
    required: false,
    release_notes: "",
  });
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!file) {
      errors.file = "Please select a file to upload";
    } else {
      const ext = file.name.toLowerCase().split(".").pop();
      if (formData.platform === "android" && ext !== "apk") {
        errors.file = "Android platform requires an APK file";
      }
      if (formData.platform === "ios" && ext !== "ipa") {
        errors.file = "iOS platform requires an IPA file";
      }
    }

    if (!formData.version.trim()) {
      errors.version = "Version is required";
    } else if (!/^\d+\.\d+\.\d+$/.test(formData.version)) {
      errors.version = "Version must follow semantic versioning (e.g., 1.2.3)";
    }

    if (!formData.version_code.trim()) {
      errors.version_code = "Version code is required";
    } else if (
      !/^\d+$/.test(formData.version_code) ||
      parseInt(formData.version_code) < 1
    ) {
      errors.version_code = "Version code must be a positive integer";
    }

    if (!formData.platform) {
      errors.platform = "Platform is required";
    }

    if (!formData.channel) {
      errors.channel = "Channel is required";
    }

    if (!formData.environment) {
      errors.environment = "Environment is required";
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
        setFormErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.file;
          return newErrors;
        });
      }
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific field error if it existed
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific field error if it existed
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Clear file error if platform changed
    if (name === "platform" && formErrors.file) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.file;
        return newErrors;
      });
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      required: checked,
    }));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      const ext = selectedFile.name.toLowerCase().split(".").pop();
      if (ext === "apk" || ext === "ipa") {
        setFile(selectedFile);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setUploadStatus("uploading");
    setUploadError(null);

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      if (file) {
        formDataToSend.append("file", file);
      }
      formDataToSend.append("version", formData.version);
      formDataToSend.append("version_code", formData.version_code);
      formDataToSend.append("platform", formData.platform);
      formDataToSend.append("channel", formData.channel);
      formDataToSend.append("environment", formData.environment);
      formDataToSend.append("required", formData.required.toString());
      if (formData.release_notes.trim()) {
        formDataToSend.append("release_notes", formData.release_notes);
      }

      // Upload native update using API service
      await apiService.uploadNativeUpdate(formDataToSend);

      setUploadStatus("success");
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus("error");
      setUploadError("Failed to upload native update. Please try again.");
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
      version: "",
      version_code: "",
      platform: "android",
      channel: "stable",
      environment: "prod",
      required: false,
      release_notes: "",
    });
    setUploadStatus("idle");
    setUploadError(null);
    setFormErrors({});
  };

  const getAcceptedFileTypes = () => {
    if (formData.platform === "android") return ".apk";
    if (formData.platform === "ios") return ".ipa";
    return ".apk,.ipa";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Upload Native Update
        </h1>
        <p className="text-muted-foreground">
          Upload an APK or IPA file for native app distribution
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Native Update Information</CardTitle>
          <CardDescription>
            Provide details about the native update to be uploaded
          </CardDescription>
        </CardHeader>
        <CardContent>
          {uploadError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          )}

          {uploadStatus === "success" && (
            <Alert className="mb-6">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-700">
                Native update uploaded successfully! Your update has been
                uploaded and is now available.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Platform Selection First - affects file type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="platform">Platform *</Label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Select
                    value={formData.platform}
                    onValueChange={(value) =>
                      handleSelectChange("platform", value)
                    }
                    disabled={uploadStatus === "uploading"}
                  >
                    <SelectTrigger className="pl-9">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="android">Android (APK)</SelectItem>
                      <SelectItem value="ios">iOS (IPA)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formErrors.platform && (
                  <p className="text-sm text-red-500">{formErrors.platform}</p>
                )}
              </div>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="native-file">
                {formData.platform === "android" ? "APK" : "IPA"} File *
              </Label>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  formErrors.file
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 hover:border-primary"
                }`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={triggerFileInput}
              >
                <input
                  type="file"
                  id="native-file"
                  ref={fileInputRef}
                  className="hidden"
                  accept={getAcceptedFileTypes()}
                  onChange={handleFileChange}
                />

                {file ? (
                  <div className="flex flex-col items-center">
                    <File className="w-10 h-10 text-primary mb-3" />
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Click to change file
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="w-10 h-10 text-muted-foreground mb-3" />
                    <p className="font-medium">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formData.platform === "android" ? "APK" : "IPA"} files
                      only (MAX. 200MB)
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
                    disabled={uploadStatus === "uploading"}
                    className="pl-9"
                  />
                </div>
                {formErrors.version && (
                  <p className="text-sm text-red-500">{formErrors.version}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Semantic version (e.g. 1.2.3)
                </p>
              </div>

              {/* Version Code */}
              <div className="space-y-2">
                <Label htmlFor="version_code">Version Code *</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="version_code"
                    name="version_code"
                    type="number"
                    min="1"
                    value={formData.version_code}
                    onChange={handleInputChange}
                    placeholder="e.g. 42"
                    disabled={uploadStatus === "uploading"}
                    className="pl-9"
                  />
                </div>
                {formErrors.version_code && (
                  <p className="text-sm text-red-500">
                    {formErrors.version_code}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Numeric build number for comparison
                </p>
              </div>

              {/* Channel */}
              <div className="space-y-2">
                <Label htmlFor="channel">Channel *</Label>
                <div className="relative">
                  <ToggleLeft className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Select
                    value={formData.channel}
                    onValueChange={(value) =>
                      handleSelectChange("channel", value)
                    }
                    disabled={uploadStatus === "uploading"}
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
                    onValueChange={(value) =>
                      handleSelectChange("environment", value)
                    }
                    disabled={uploadStatus === "uploading"}
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
                  <p className="text-sm text-red-500">
                    {formErrors.environment}
                  </p>
                )}
              </div>
            </div>

            {/* Release Notes */}
            <div className="space-y-2">
              <Label htmlFor="release_notes">Release Notes (Optional)</Label>
              <Textarea
                id="release_notes"
                name="release_notes"
                value={formData.release_notes}
                onChange={handleInputChange}
                placeholder="What's new in this version..."
                disabled={uploadStatus === "uploading"}
                rows={4}
              />
            </div>

            {/* Required Update */}
            <div className="flex items-start space-x-3">
              <div className="pt-0.5">
                <Checkbox
                  id="required"
                  checked={formData.required}
                  onCheckedChange={handleCheckboxChange}
                  disabled={uploadStatus === "uploading"}
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
                disabled={uploadStatus === "uploading"}
              >
                Reset
              </Button>
              <Button
                type="submit"
                disabled={
                  uploadStatus === "uploading" ||
                  !file ||
                  !formData.version ||
                  !formData.version_code
                }
              >
                {uploadStatus === "uploading" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Upload Native Update"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
