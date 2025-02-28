
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import Sidebar from "@/components/layout/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type News } from "@shared/schema";

export default function NewsPage() {
  const [expandedNews, setExpandedNews] = useState<number | null>(null);

  const { data: news } = useQuery<News[]>({
    queryKey: ["/api/news"],
  });

  const toggleNewsItem = (id: number) => {
    if (expandedNews === id) {
      setExpandedNews(null);
    } else {
      setExpandedNews(id);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="pl-64 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-3xl font-bold text-primary mb-8">News</h1>
          
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-6">
              {news && news.length > 0 ? (
                news.map((item) => (
                  <Card key={item.id || item.title} className="overflow-hidden">
                    <CardHeader 
                      className="cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => toggleNewsItem(item.id)}
                    >
                      <div className="flex justify-between items-center">
                        <CardTitle>{item.title}</CardTitle>
                        {item.createdAt && (
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(item.createdAt), "MMM d, yyyy h:mm a")}
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    
                    <AnimatePresence>
                      {expandedNews === item.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <CardContent className="pt-0">
                            <p className="whitespace-pre-wrap">{item.content}</p>
                          </CardContent>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">No news available</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        </motion.div>
      </main>
    </div>
  );
}
