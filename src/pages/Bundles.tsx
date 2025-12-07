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
  FileText,
  MoreHorizontal,
  Loader2
} from "lucide-react";
import { apiService } from "@/api/apiService";

// Define the type for bundle data
export type Bundle = {
  id: string;
  platform: "android" | "ios" | "web";
  version: string;
  download_url: string;
  checksum?: string;
  session_key?: string;
  channel: "stable" | "beta" | "dev";
  environment: "prod" | "staging" | "dev";
  required: boolean;
  active: boolean;
  created_at: string;
  created_by?: string;
};

export const Bundles = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterChannel, setFilterChannel] = useState('all');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterEnvironment, setFilterEnvironment] = useState('all');
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch bundles from API
  useEffect(() => {
    const fetchBundles = async () => {
      try {
        setLoading(true);
        const response = await apiService.getDashboardBundles();
        // Handle different possible response structures
        if (Array.isArray(response.data)) {
          setBundles(response.data);
        } else if (response.data?.updates) {
          setBundles(response.data.updates);
        } else {
          setBundles([]);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching bundles:', err);
        setError('Failed to load bundles. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBundles();
  }, []);

  // Filter bundles based on search and filters
  const filteredBundles = bundles.filter(bundle => {
    const matchesSearch = bundle.version.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          bundle.channel.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesChannel = filterChannel === 'all' || bundle.channel === filterChannel;
    const matchesPlatform = filterPlatform === 'all' || bundle.platform === filterPlatform;
    const matchesEnvironment = filterEnvironment === 'all' || bundle.environment === filterEnvironment;
    
    return matchesSearch && matchesChannel && matchesPlatform && matchesEnvironment;
  });

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this bundle?')) {
      return;
    }
    
    try {
      await apiService.deleteBundle(id);
      setBundles(bundles.filter(bundle => bundle.id !== id));
    } catch (err) {
      console.error('Error deleting bundle:', err);
      setError('Failed to delete bundle. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-12">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading bundles...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bundles</h1>
        <p className="text-muted-foreground">
          Manage app bundles for distribution
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
                placeholder="Search bundles..."
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
                value={filterPlatform}
                onChange={(e) => setFilterPlatform(e.target.value)}
                className="border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Platforms</option>
                <option value="android">Android</option>
                <option value="ios">iOS</option>
                <option value="web">Web</option>
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
            
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Version</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Environment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Required</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBundles.length > 0 ? (
                  filteredBundles.map((bundle) => (
                    <TableRow key={bundle.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <FileText className="w-5 h-5 text-blue-500 mr-2" />
                          <span className="font-medium">{bundle.version}</span>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{bundle.platform}</TableCell>
                      <TableCell>
                        <Badge variant={
                          bundle.channel === 'stable' ? 'default' : 
                          bundle.channel === 'beta' ? 'secondary' : 'outline'
                        }>
                          {bundle.channel.charAt(0).toUpperCase() + bundle.channel.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          bundle.environment === 'prod' ? 'default' : 
                          bundle.environment === 'staging' ? 'secondary' : 'outline'
                        }>
                          {bundle.environment.charAt(0).toUpperCase() + bundle.environment.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(bundle.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={bundle.active ? 'default' : 'destructive'}>
                          {bundle.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={bundle.required ? 'default' : 'outline'}>
                          {bundle.required ? 'Yes' : 'No'}
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
                            <DropdownMenuItem onClick={() => window.open(bundle.download_url, '_blank')}>
                              <Download className="mr-2 h-4 w-4" />
                              Download bundle
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600" 
                              onClick={() => handleDelete(bundle.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete bundle
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      {error ? 'Error loading data' : 'No bundles found'}
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