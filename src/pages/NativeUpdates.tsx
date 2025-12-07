import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  Download,
  Trash2,
  MoreHorizontal,
  Loader2,
  Smartphone,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { apiService } from "@/api/apiService";

// Define the type for native update data
export type NativeUpdate = {
  id: number;
  platform: "android" | "ios";
  version: string;
  version_code: number;
  download_url: string;
  checksum?: string;
  channel: string;
  environment: "prod" | "staging" | "dev";
  required: boolean;
  active: boolean;
  file_size?: number;
  release_notes?: string;
  created_at: string;
};

// Helper to format file size
const formatFileSize = (bytes?: number): string => {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export const NativeUpdates = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterChannel, setFilterChannel] = useState("all");
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [filterEnvironment, setFilterEnvironment] = useState("all");
  const [updates, setUpdates] = useState<NativeUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch native updates from API
  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        setLoading(true);
        const response = await apiService.getNativeUpdates();
        setUpdates(Array.isArray(response.data) ? response.data : []);
        setError(null);
      } catch (err) {
        console.error("Error fetching native updates:", err);
        setError("Failed to load native updates. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUpdates();
  }, []);

  // Filter updates based on search and filters
  const filteredUpdates = updates.filter((update) => {
    const matchesSearch =
      update.version.toLowerCase().includes(searchTerm.toLowerCase()) ||
      update.channel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (update.release_notes?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesChannel =
      filterChannel === "all" || update.channel === filterChannel;
    const matchesPlatform =
      filterPlatform === "all" || update.platform === filterPlatform;
    const matchesEnvironment =
      filterEnvironment === "all" || update.environment === filterEnvironment;

    return matchesSearch && matchesChannel && matchesPlatform && matchesEnvironment;
  });

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this native update?")) {
      return;
    }

    try {
      await apiService.deleteNativeUpdate(id.toString());
      setUpdates(updates.filter((update) => update.id !== id));
    } catch (err) {
      console.error("Error deleting native update:", err);
      setError("Failed to delete native update. Please try again.");
    }
  };

  const handleToggleActive = async (id: number, currentActive: boolean) => {
    try {
      await apiService.updateNativeUpdate(id.toString(), {
        active: !currentActive,
      });
      setUpdates(
        updates.map((update) =>
          update.id === id ? { ...update, active: !currentActive } : update
        )
      );
    } catch (err) {
      console.error("Error toggling native update status:", err);
      setError("Failed to update status. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-12">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading native updates...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Native Updates</h1>
        <p className="text-muted-foreground">
          Manage APK and IPA files for native app updates
        </p>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive p-4 rounded-md">
          {error}
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 space-y-4 md:space-y-0">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search native updates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={filterPlatform}
                onChange={(e) => setFilterPlatform(e.target.value)}
                className="border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Platforms</option>
                <option value="android">Android</option>
                <option value="ios">iOS</option>
              </select>
            </div>

            <div className="flex items-center">
              <select
                value={filterChannel}
                onChange={(e) => setFilterChannel(e.target.value)}
                className="border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Channels</option>
                <option value="stable">Stable</option>
                <option value="beta">Beta</option>
                <option value="dev">Development</option>
              </select>
            </div>

            <div className="flex items-center">
              <select
                value={filterEnvironment}
                onChange={(e) => setFilterEnvironment(e.target.value)}
                className="border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Environments</option>
                <option value="prod">Production</option>
                <option value="staging">Staging</option>
                <option value="dev">Development</option>
              </select>
            </div>

            <Button
              variant="default"
              onClick={() => (window.location.href = "/native-updates/upload")}
            >
              <Smartphone className="mr-2 h-4 w-4" />
              Upload Native
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Version</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Environment</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Required</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUpdates.length > 0 ? (
                  filteredUpdates.map((update) => (
                    <TableRow key={update.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <Smartphone className="w-5 h-5 text-green-500 mr-2" />
                          <span className="font-medium">{update.version}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">
                        {update.version_code}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            update.platform === "android"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {update.platform === "android" ? "Android" : "iOS"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            update.channel === "stable"
                              ? "default"
                              : update.channel === "beta"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {update.channel.charAt(0).toUpperCase() +
                            update.channel.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            update.environment === "prod"
                              ? "default"
                              : update.environment === "staging"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {update.environment.charAt(0).toUpperCase() +
                            update.environment.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatFileSize(update.file_size)}</TableCell>
                      <TableCell>
                        {new Date(update.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={update.active ? "default" : "destructive"}
                        >
                          {update.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={update.required ? "default" : "outline"}
                        >
                          {update.required ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() =>
                                window.open(update.download_url, "_blank")
                              }
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleToggleActive(update.id, update.active)
                              }
                            >
                              {update.active ? (
                                <>
                                  <ToggleLeft className="mr-2 h-4 w-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <ToggleRight className="mr-2 h-4 w-4" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDelete(update.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="h-24 text-center">
                      {error ? "Error loading data" : "No native updates found"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
