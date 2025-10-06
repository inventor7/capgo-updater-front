import React from 'react';
import { AppSidebar } from '@/components/navigation/Sidebar';
import { Header } from '@/components/navigation/Header';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto py-6 px-4">
          {children}
        </main>
      </div>
    </div>
  );
}