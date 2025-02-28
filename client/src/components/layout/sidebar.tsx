import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, User, Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPath, setCurrentPath] = useLocation();
  const [news, setNews] = useState([]);
  const [isNewsOpen, setIsNewsOpen] = useState(false);
  const [expandedNews, setExpandedNews] = useState(null);

  useEffect(() => {
    // Fetch news when component mounts
    const fetchNews = async () => {
      try {
        const response = await apiRequest("/api/news");
        const newsData = await response.json();
        setNews(newsData);
      } catch (error) {
        console.error("Failed to fetch news:", error);
      }
    };

    fetchNews();
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleNewsPanel = () => {
    setIsNewsOpen(!isNewsOpen);
  };

  const toggleNewsItem = (id) => {
    if (expandedNews === id) {
      setExpandedNews(null);
    } else {
      setExpandedNews(id);
    }
  };

  const closeSidebar = () => {
    setIsOpen(false);
    setIsNewsOpen(false);
  };

  return (
    <>
      {/* Hamburger Menu Button */}
      <Button 
        className="fixed top-4 left-4 z-50 p-2" 
        variant="ghost" 
        onClick={toggleSidebar}
      >
        <Menu size={24} />
      </Button>

      {/* Overlay to close sidebar when clicking outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-40"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed top-0 left-0 h-full w-64 bg-card shadow-lg z-50 p-6 flex flex-col"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Menu</h2>
              <Button variant="ghost" size="icon" onClick={closeSidebar}>
                <X size={20} />
              </Button>
            </div>

            <nav className="flex flex-col space-y-2">
              <Link 
                href="/dashboard" 
                onClick={closeSidebar}
                className={`flex items-center p-2 rounded-md hover:bg-accent transition-colors ${
                  currentPath === "/dashboard" ? "bg-accent/50" : ""
                }`}
              >
                <Menu className="mr-2" size={18} />
                <span>Dashboard</span>
              </Link>

              <Link 
                href="/profile" 
                onClick={closeSidebar}
                className={`flex items-center p-2 rounded-md hover:bg-accent transition-colors ${
                  currentPath === "/profile" ? "bg-accent/50" : ""
                }`}
              >
                <User className="mr-2" size={18} />
                <span>Profile</span>
              </Link>

              <Link 
                href="/news" 
                onClick={closeSidebar}
                className={`flex items-center p-2 rounded-md hover:bg-accent transition-colors ${
                  currentPath === "/news" ? "bg-accent/50" : ""
                }`}
              >
                <Bell className="mr-2" size={18} />
                <span>News</span>
              </Link>
            </nav>

            <div className="mt-auto px-2 text-xs text-muted-foreground">
              <span
                onClick={() => window.open("https://t.me/NezukoChk0wner", "_blank")}
                className="hover:text-primary transition-colors cursor-pointer"
              >
                Crafted by Nezuko
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}