import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://dubnvfvlaiqzbimgaqvp.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1Ym52ZnZsYWlxemJpbWdhcXZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MzA0MzAsImV4cCI6MjA3NTEwNjQzMH0.SbQ3dNb7gazStIcmsiLAGswiIOVRC2IaY2Irs6P20Aw';
const BUCKET_NAME = process.env.BUCKET_NAME || 'updates';

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Create Supabase client with service role key for storage operations (if available)
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1Ym52ZnZsYWlxemJpbWdhcXZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTUzMDQzMCwiZXhwIjoyMDc1MTA2NDMwfQ.AhH-PsZEmmvtXN93hlCP7tHpRER_oftbOG8R7ROkLa8"; // fallback to anon key if service key not provided
const supabaseStorage = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Dashboard API service
export const dashboardApiService = {
  // Dashboard stats
  getDashboardStats: async () => {
    try {
      // Get total bundles
      const { count: totalBundles, error: bundlesError } = await supabase
        .from('updates')
        .select('*', { count: 'exact', head: true });

      if (bundlesError) throw bundlesError;

      // Get active devices
      const { data: devicesData, error: devicesError } = await supabase
        .from('device_channels')
        .select('device_id');

      if (devicesError) throw devicesError;

      const activeDevices = new Set(devicesData.map(d => d.device_id)).size;

      // Get active channels
      const { data: channelsData, error: channelsError } = await supabase
        .from('updates')
        .select('channel');

      if (channelsError) throw channelsError;

      const activeChannels = new Set(channelsData.map(c => c.channel)).size;

      // Get total downloads
      const { count: totalDownloads, error: downloadsError } = await supabase
        .from('update_stats')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'downloaded');

      if (downloadsError) throw downloadsError;

      return {
        totalBundles: totalBundles || 0,
        activeDevices: activeDevices || 0,
        activeChannels: activeChannels || 0,
        totalDownloads: totalDownloads || 0
      };
    } catch (error) {
      console.error('Dashboard stats error:', error);
      throw error;
    }
  },

  // Bundles API
  getDashboardBundles: async () => {
    try {
      const { data, error } = await supabase
        .from('updates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Bundles fetch error:', error);
      throw error;
    }
  },

  createBundle: async (data: { 
    platform: string; 
    version: string; 
    download_url: string; 
    checksum?: string; 
    session_key?: string; 
    channel: string; 
    environment: string; 
    required: boolean; 
    active: boolean;
    created_by?: string;
  }) => {
    try {
      const { data: result, error } = await supabase
        .from('updates')
        .insert([data])
        .select();

      if (error) throw error;
      return result[0];
    } catch (error) {
      console.error('Bundle creation error:', error);
      throw error;
    }
  },

  updateBundle: async (id: number, data: { 
    platform?: string; 
    version?: string; 
    download_url?: string; 
    checksum?: string; 
    session_key?: string; 
    channel?: string; 
    environment?: string; 
    required?: boolean; 
    active?: boolean 
  }) => {
    try {
      const { data: result, error } = await supabase
        .from('updates')
        .update(data)
        .eq('id', id)
        .select();

      if (error) throw error;
      return result[0];
    } catch (error) {
      console.error('Bundle update error:', error);
      throw error;
    }
  },

  deleteBundle: async (id: number) => {
    try {
      const { error } = await supabase
        .from('updates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Bundle deletion error:', error);
      throw error;
    }
  },

  // Channels API
  getDashboardChannels: async () => {
    try {
      // Get all unique channels with their details
      const { data: updatesData, error: updatesError } = await supabase
        .from('updates')
        .select('channel, platform, environment, created_at');

      if (updatesError) throw updatesError;

      // Get channel assignments
      const { data: allChannels, error: channelsError } = await supabase
        .from('device_channels')
        .select('channel');

      if (channelsError) throw channelsError;

      // Manual grouping for device counts
      const channelCounts: Record<string, number> = {};
      allChannels.forEach(item => {
        channelCounts[item.channel] = (channelCounts[item.channel] || 0) + 1;
      });

      // Create a map of channels with aggregated data
      const channelMap: Record<string, any> = {};
      
      // Process updates to get channel details
      updatesData.forEach(update => {
        if (!channelMap[update.channel]) {
          channelMap[update.channel] = {
            id: update.channel,
            name: update.channel.charAt(0).toUpperCase() + update.channel.slice(1),
            platforms: new Set(),
            environments: new Set(),
            created_at: update.created_at,
            device_count: 0
          };
        }
        
        channelMap[update.channel].platforms.add(update.platform);
        channelMap[update.channel].environments.add(update.environment);
        if (new Date(update.created_at) > new Date(channelMap[update.channel].created_at)) {
          channelMap[update.channel].created_at = update.created_at;
        }
      });

      // Add device counts
      Object.entries(channelCounts).forEach(([channel, count]) => {
        if (channelMap[channel]) {
          channelMap[channel].device_count = count || 0;
        }
      });

      // Convert to array format
      const channels = Object.values(channelMap).map(channel => ({
        id: channel.id,
        name: channel.name,
        platforms: Array.from(channel.platforms),
        environments: Array.from(channel.environments),
        created_at: channel.created_at,
        device_count: channel.device_count
      }));

      return channels;
    } catch (error) {
      console.error('Channels fetch error:', error);
      throw error;
    }
  },

  updateChannel: async (id: string, data: { name: string; public: boolean }) => {
    try {
      // Channel updates would typically happen through bundle management
      // This is a placeholder implementation
      return { message: 'Channels are managed through bundle updates' };
    } catch (error) {
      console.error('Channel update error:', error);
      throw error;
    }
  },

  deleteChannel: async (id: string) => {
    try {
      // Delete all bundles associated with this channel
      const { error } = await supabase
        .from('updates')
        .delete()
        .eq('channel', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Channel deletion error:', error);
      throw error;
    }
  },

  // Devices API
  getDashboardDevices: async () => {
    try {
      const { data, error } = await supabase
        .from('device_channels')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Devices fetch error:', error);
      throw error;
    }
  },

  updateDeviceChannel: async (id: number, channel: string) => {
    try {
      const { data, error } = await supabase
        .from('device_channels')
        .update({ channel, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Device channel update error:', error);
      throw error;
    }
  },

  deleteDevice: async (id: number) => {
    try {
      const { error } = await supabase
        .from('device_channels')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Device deletion error:', error);
      throw error;
    }
  },

  // Stats API
  getDashboardStatsData: async () => {
    try {
      const { data, error } = await supabase
        .from('update_stats')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100); // Limit to last 100 records for performance

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Stats data fetch error:', error);
      throw error;
    }
  },
};