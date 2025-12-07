import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './style.css';
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import {
  Dashboard,
  UploadBundle,
  Bundles,
  Channels,
  Devices,
  Stats,
  NativeUpdates,
  UploadNativeUpdate
} from "./pages";

function App() {
  return (
    <Router>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/bundles/upload" element={<UploadBundle />} />
              <Route path="/bundles" element={<Bundles />} />
              <Route path="/channels" element={<Channels />} />
              <Route path="/devices" element={<Devices />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/native-updates" element={<NativeUpdates />} />
              <Route path="/native-updates/upload" element={<UploadNativeUpdate />} />
            </Routes>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </Router>
  );
}

export default App;