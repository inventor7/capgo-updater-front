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
  Plus, 
  Layers, 
  Eye, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Loader2
} from "lucide-react";
import { apiService } from "@/api/apiService";

// Define the type for channel data
export type Channel = {
  id: string;
  name: string;
  platform: "android" | "ios" | "web" | "all";
  public: boolean;
  allow_self_set: boolean;
  created_at: string;
  active_bundles?: number;
  description?: string;
};

export const Channels = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterVisibility, setFilterVisibility] = useState('all');
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch channels from API
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        setLoading(true);
        const response = await apiService.getDashboardChannels();
        // Handle different possible response structures
        if (Array.isArray(response.data)) {
          setChannels(response.data);
        } else if (response.data?.channels) {
          setChannels(response.data.channels);
        } else {
          setChannels([]);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching channels:', err);
        setError('Failed to load channels. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, []);

  // Filter channels based on search and filters
  const filteredChannels = channels.filter(channel => {
    const matchesSearch = channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          channel.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = filterPlatform === 'all' || channel.platform.toLowerCase() === filterPlatform;
    const matchesVisibility = filterVisibility === 'all' || 
                             (filterVisibility === 'public' && channel.public) || 
                             (filterVisibility === 'private' && !channel.public);
    
    return matchesSearch && matchesPlatform && matchesVisibility;
  });

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this channel?')) {
      return;
    }
    
    try {
      await apiService.deleteChannel(id);
      setChannels(channels.filter(channel => channel.id !== id));
    } catch (err) {
      console.error('Error deleting channel:', err);
      setError('Failed to delete channel. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-12">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading channels...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Channels</h1>
        <p className="text-muted-foreground">
          Manage update channels for your applications
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
                placeholder="Search channels..."
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
                <option value="web">Web</option>
                <option value="all">All</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <select
                value={filterVisibility}
                onChange={(e) => setFilterVisibility(e.target.value)}
                className="border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Visibility</option>
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
            
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Channel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead>Self-Set</TableHead>
                  <TableHead>Active Bundles</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredChannels.length > 0 ? (
                  filteredChannels.map((channel) => (
                    <TableRow key={channel.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Layers className="w-5 h-5 text-purple-500 mr-2" />
                          {channel.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{channel.id}</span>
                      </TableCell>
                      <TableCell className="capitalize">{channel.platform}</TableCell>
                      <TableCell>
                        <Badge variant={channel.public ? 'default' : 'destructive'}>
                          {channel.public ? 'Public' : 'Private'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={channel.allow_self_set ? 'default' : 'outline'}>
                          {channel.allow_self_set ? 'Allowed' : 'Restricted'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {channel.active_bundles || 0} bundles
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(channel.created_at).toLocaleDateString()}
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
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit channel
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDelete(channel.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete channel
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      {error ? 'Error loading data' : 'No channels found'}
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