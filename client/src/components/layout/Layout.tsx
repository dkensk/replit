import BottomNav from "./BottomNav";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans pb-20">
      <main className="max-w-md mx-auto min-h-screen relative overflow-hidden">
        {/* Background Glow Effects */}
        <div className="fixed top-0 left-0 w-full h-96 bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none" />
        <div className="fixed bottom-0 right-0 w-full h-96 bg-blue-600/10 rounded-full blur-[100px] translate-y-1/2 pointer-events-none" />
        
        <div className="relative z-10">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
