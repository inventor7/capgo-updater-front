// This component is not used - the app uses app-sidebar.tsx and SidebarInset pattern
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {children}
    </div>
  );
}