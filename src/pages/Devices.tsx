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
  Smartphone, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Loader2
} from "lucide-react";
import { apiService } from "@/api/apiService";

// Define the type for device data
export type Device = {
  id: string;
  device_id: string;
  app_id: string;
  platform: "android" | "ios" | "web";
  channel: "stable" | "beta" | "dev";
  last_seen: string;
  last_version: string;
  status: "active" | "inactive";
  os_version: string;
  app_version: string;
  model?: string;
};

export const Devices = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterChannel, setFilterChannel] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch devices from API
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setLoading(true);
        const response = await apiService.getDashboardDevices();
        // Handle different possible response structures
        if (Array.isArray(response.data)) {
          setDevices(response.data);
        } else if (response.data?.devices) {
          setDevices(response.data.devices);
        } else {
          setDevices([]);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching devices:', err);
        setError('Failed to load devices. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  // Filter devices based on search and filters
  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.device_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          device.app_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          device.model?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = filterPlatform === 'all' || device.platform.toLowerCase() === filterPlatform;
    const matchesChannel = filterChannel === 'all' || device.channel.toLowerCase() === filterChannel;
    const matchesStatus = filterStatus === 'all' || device.status === filterStatus;
    
    return matchesSearch && matchesPlatform && matchesChannel && matchesStatus;
  });

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this device?')) {
      return;
    }
    
    try {
      await apiService.deleteDevice(id);
      setDevices(devices.filter(device => device.id !== id));
    } catch (err) {
      console.error('Error removing device:', err);
      setError('Failed to remove device. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-12">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading devices...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Devices</h1>
        <p className="text-muted-foreground">
          Manage connected devices and their update status
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
                placeholder="Search devices..."
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
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
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
                  <TableHead>Device ID</TableHead>
                  <TableHead>App ID</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Last Seen</TableHead>
                  <TableHead>Last Version</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDevices.length > 0 ? (
                  filteredDevices.map((device) => (
                    <TableRow key={device.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <Smartphone className="w-5 h-5 text-blue-500 mr-2" />
                          <span className="font-mono text-xs truncate max-w-[120px] md:max-w-[200px]">
                            {device.device_id.substring(0, 8)}...
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs truncate max-w-[100px]">
                          {device.app_id}
                        </span>
                      </TableCell>
                      <TableCell className="capitalize">{device.platform}</TableCell>
                      <TableCell>
                        <Badge variant={
                          device.channel === 'stable' ? 'default' : 
                          device.channel === 'beta' ? 'secondary' : 'outline'
                        }>
                          {device.channel.charAt(0).toUpperCase() + device.channel.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {device.model || `${device.platform} Device`}
                      </TableCell>
                      <TableCell>
                        {new Date(device.last_seen).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{device.last_version}</TableCell>
                      <TableCell>
                        <Badge variant={device.status === 'active' ? 'default' : 'destructive'}>
                          {device.status}
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
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit device
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600" 
                              onClick={() => handleDelete(device.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove device
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      {error ? 'Error loading data' : 'No devices found'}
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