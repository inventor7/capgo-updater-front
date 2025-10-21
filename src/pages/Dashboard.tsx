import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  Download, 
  Smartphone, 
  Users,
  Activity,
  BarChart3,
  ArrowUpIcon,
  ArrowDownIcon,
  Loader2
} from "lucide-react";
import { apiService } from "@/api/apiService";

type DashboardStats = {
  totalBundles: number;
  activeDevices: number;
  activeChannels: number;
  totalDownloads: number;
};

export const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard stats
        const statsResponse = await apiService.getDashboardStats();
        
        setStats(statsResponse.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Prepare stats data for display
  const statsDisplay = stats ? [
    {
      title: "Total Bundles",
      value: stats.totalBundles,
      change: "+12%",
      changeType: "positive" as const,
      icon: Package,
      description: "Available app updates"
    },
    {
      title: "Active Devices",
      value: stats.activeDevices,
      change: "+5%",
      changeType: "positive" as const,
      icon: Smartphone,
      description: "Currently active devices"
    },
    {
      title: "Active Channels",
      value: stats.activeChannels,
      change: "0%",
      changeType: "neutral" as const,
      icon: Users,
      description: "Update channel variations"
    },
    {
      title: "Total Downloads",
      value: stats.totalDownloads,
      change: "+18%",
      changeType: "positive" as const,
      icon: Download,
      description: "Successful bundle downloads"
    }
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-12">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your Capgo Self-Hosted Update Server
        </p>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive p-4 rounded-md">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsDisplay.map((stat, index) => (
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
              <div className={`text-xs mt-1 flex items-center ${
                stat.changeType === 'positive' ? 'text-emerald-500' :
                stat.changeType === "neutral" ? 'text-muted-foreground' : 'text-muted-foreground'
              }`}>
                {stat.changeType === 'positive' && (
                  <ArrowUpIcon className="mr-1 h-3 w-3" />
                )}
                {stat.changeType === "neutral" && (
                  <ArrowDownIcon className="mr-1 h-3 w-3" />
                )}
                {stat.change} from last month
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and Recent Activity Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-full mr-3 mt-0.5">
                  <Activity className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">New bundle uploaded</p>
                  <p className="text-sm text-muted-foreground">v1.2.3 for iOS</p>
                  <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-full mr-3 mt-0.5">
                  <Activity className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Download completed</p>
                  <p className="text-sm text-muted-foreground">Device: iPhone12,3 requested v1.2.2</p>
                  <p className="text-xs text-muted-foreground mt-1">4 hours ago</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-full mr-3 mt-0.5">
                  <Activity className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Channel assignment</p>
                  <p className="text-sm text-muted-foreground">Device: 1a2b3c... assigned to beta channel</p>
                  <p className="text-xs text-muted-foreground mt-1">1 day ago</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-full mr-3 mt-0.5">
                  <Activity className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Update applied</p>
                  <p className="text-sm text-muted-foreground">Device: 4d5e6f... updated to v1.2.1</p>
                  <p className="text-xs text-muted-foreground mt-1">1 day ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Active Devices by Platform</CardTitle>
            <CardDescription>Current platform distribution</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-64">
            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    Android
                  </span>
                  <span className="text-sm">78%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
                    iOS
                  </span>
                  <span className="text-sm">18%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                    Web
                  </span>
                  <span className="text-sm">4%</span>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-32 h-32 rounded-full border-8 border-gray-200">
                  <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-blue-500 rounded-tl-full"></div>
                  <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-emerald-500 rounded-tr-full"></div>
                  <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-purple-500 rounded-bl-full"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Updates */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Updates</CardTitle>
            <CardDescription>Latest bundles pushed to channels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b last:border-0 last:pb-0">
                <div>
                  <div className="font-medium">v1.2.3</div>
                  <div className="text-sm text-muted-foreground">
                    iOS, Stable channel
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">2 hours ago</div>
              </div>
              <div className="flex items-center justify-between pb-2 border-b last:border-0 last:pb-0">
                <div>
                  <div className="font-medium">v1.2.2</div>
                  <div className="text-sm text-muted-foreground">
                    Android, Beta channel
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">1 day ago</div>
              </div>
              <div className="flex items-center justify-between pb-2 border-b last:border-0 last:pb-0">
                <div>
                  <div className="font-medium">v1.1.9</div>
                  <div className="text-sm text-muted-foreground">
                    Web, Stable channel
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">3 days ago</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks you might want to perform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="flex flex-col items-center justify-center h-24">
                <Package className="h-6 w-6 mb-2" />
                <span>Upload Bundle</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center justify-center h-24">
                <BarChart3 className="h-6 w-6 mb-2" />
                <span>View Stats</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center justify-center h-24">
                <Users className="h-6 w-6 mb-2" />
                <span>Manage Channels</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center justify-center h-24">
                <Smartphone className="h-6 w-6 mb-2" />
                <span>View Devices</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};