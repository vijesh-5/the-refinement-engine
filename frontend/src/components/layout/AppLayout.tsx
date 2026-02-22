import { AppSidebar } from "./AppSidebar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <AppSidebar />
      <main className="flex-1 ml-64 h-screen overflow-hidden">
        {children}
      </main>
    </div>
  );
}
