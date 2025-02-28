
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useNavigate } from "wouter";

type MobileLayoutProps = {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  title?: string;
};

export function MobileLayout({ children, sidebar, title }: MobileLayoutProps) {
  const isMobile = useIsMobile();
  const [showSidebar, setShowSidebar] = React.useState(false);
  const navigate = useNavigate();

  if (!isMobile) {
    return (
      <>
        {sidebar}
        {children}
      </>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 bg-background border-b flex items-center justify-between p-4">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSidebar(true)}
            className="mr-2"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold truncate">{title || "Nezuko Card Checker"}</h1>
        </div>
      </header>

      {/* Mobile sidebar with animation */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-200"
          onClick={() => setShowSidebar(false)}
        >
          <div
            className="absolute top-0 left-0 bottom-0 w-[85%] max-w-[300px] bg-background overflow-auto shadow-xl transition-transform duration-300 ease-in-out"
            style={{ transform: showSidebar ? 'translateX(0)' : 'translateX(-100%)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold">Menu</h2>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowSidebar(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="py-2">
              {sidebar}
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 p-4 overflow-auto">{children}</main>
    </div>
  );
}

export default MobileLayout;
