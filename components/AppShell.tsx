// components/AppShell.tsx

import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

type AppShellProps = {
  children: React.ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto flex max-w-6xl">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="min-w-0 flex-1 p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}