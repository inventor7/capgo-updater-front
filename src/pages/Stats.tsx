import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Search, 
  Filter, 
  Download, 
  Eye, 
  Activity,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react";
import { apiService } from "@/api/apiService";

// Define the type for statistics data
export type Stat = {
  id: string;
  action: string;
  bundle_id: string;
  device_id: string;
  app_id: string;
  platform: "android" | "ios" | "web";
  status: "downloaded" | "installed" | "failed" | "checksum_fail";
  timestamp: string;
  version: string;
  details?: string;
};

export const Stats = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('last7days');
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await apiService.getDashboardStatsData();
        // Handle different possible response structures
        if (Array.isArray(response.data)) {
          setStats(response.data);
        } else if (response.data?.stats) {
          setStats(response.data.stats);
        } else {
          setStats([]);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Failed to load statistics. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Filter stats based on search and filters
  const filteredStats = stats.filter(stat => {
    const matchesSearch = stat.device_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          stat.app_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          stat.bundle_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = filterPlatform === 'all' || stat.platform.toLowerCase() === filterPlatform;
    const matchesStatus = filterStatus === 'all' || stat.status === filterStatus;
    
    return matchesSearch && matchesPlatform && matchesStatus;
  });

  // Calculate summary stats
  const totalDownloads = filteredStats.filter(s => s.action === 'download').length;
  const successfulDownloads = filteredStats.filter(s => s.status === 'installed').length;
  const failedDownloads = filteredStats.filter(s => s.status === 'failed' || s.status === 'checksum_fail').length;
  const successfulUpdates = filteredStats.filter(s => s.status === 'installed').length;

  const statCards = [
    {
      title: "Total Downloads",
      value: totalDownloads.toString(),
      icon: Download,
      description: "Successful bundle downloads"
    },
    {
      title: "Successful Updates",
      value: successfulUpdates.toString(),
      icon: CheckCircle,
      description: "Successfully applied updates"
    },
    {
      title: "Failed Updates",
      value: failedDownloads.toString(),
      icon: XCircle,
      description: "Updates that failed"
    },
    {
      title: "Active Devices",
      value: "142",
      icon: Activity,
      description: "Devices connected in the last 24 hours"
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-12">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading statistics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Statistics</h1>
        <p className="text-muted-foreground">
          Analytics and performance metrics for your update server
        </p>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive p-4 rounded-md">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 space-y-4 md:space-y-0">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search statistics..."
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
              </select>
            </div>
            
            <div className="flex items-center">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Status</option>
                <option value="downloaded">Downloaded</option>
                <option value="installed">Installed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <select
                value={filterDateRange}
                onChange={(e) => setFilterDateRange(e.target.value)}
                className="border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="today">Today</option>
                <option value="last7days">Last 7 Days</option>
                <option value="last30days">Last 30 Days</option>
                <option value="last90days">Last 90 Days</option>
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
                  <TableHead>Action</TableHead>
                  <TableHead>Device ID</TableHead>
                  <TableHead>App ID</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Bundle ID</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead className="text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStats.length > 0 ? (
                  filteredStats.map((stat) => (
                    <TableRow key={stat.id}>
                      <TableCell>
                        <Badge variant={
                          stat.action === 'download' ? 'default' : 
                          stat.action === 'finish_download' || stat.action === 'set' || stat.action === 'applied' ? 'secondary' : 
                          'destructive'
                        }>
                          {stat.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs truncate max-w-[80px]">
                          {stat.device_id.substring(0, 8)}...
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{stat.app_id}</TableCell>
                      <TableCell className="capitalize">{stat.platform}</TableCell>
                      <TableCell>
                        <span className="font-mono text-xs truncate max-w-[100px]">
                          {stat.bundle_id}
                        </span>
                      </TableCell>
                      <TableCell>{stat.version}</TableCell>
                      <TableCell>
                        <Badge variant={
                          stat.status === 'installed' ? 'default' : 
                          stat.status === 'downloaded' ? 'secondary' : 
                          'destructive'
                        }>
                          {stat.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(stat.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      {error ? 'Error loading data' : 'No statistics found'}
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