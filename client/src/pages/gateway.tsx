import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import Sidebar from "@/components/layout/sidebar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type Gateway, type CardCheckResponse } from "@shared/schema";

export default function GatewayPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [cards, setCards] = useState("");
  const [results, setResults] = useState<CardCheckResponse[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  const { data: gateway } = useQuery<Gateway>({
    queryKey: [`/api/gateways/${id}`],
  });

  const checkCard = useMutation({
    mutationFn: async (card: string) => {
      const userId = localStorage.getItem("userId");
      const res = await apiRequest(
        "POST",
        `/api/gateways/${id}/check?userId=${userId}`,
        { card }
      );
      return res.json() as Promise<CardCheckResponse>;
    },
  });

  const handleStartCheck = async () => {
    const cardsList = cards.split("\n").filter(Boolean);
    if (!cardsList.length) return;

    setIsChecking(true);
    setResults([]);

    for (const card of cardsList) {
      if (!isChecking) break;

      try {
        const result = await checkCard.mutateAsync(card);
        setResults((prev) => [...prev, result]);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to check card. Insufficient credits?",
          variant: "destructive",
        });
        break;
      }
    }

    setIsChecking(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="pl-64 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          <h1 className="text-3xl font-bold text-primary mb-8">
            {gateway?.name || "Card Checker"}
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <Textarea
                className="h-[300px] font-mono"
                placeholder={t("gateway.input")}
                value={cards}
                onChange={(e) => setCards(e.target.value)}
              />
              <div className="mt-4 flex gap-4">
                <Button
                  onClick={handleStartCheck}
                  disabled={isChecking || !cards}
                >
                  {t("gateway.start")}
                </Button>
                {isChecking && (
                  <Button
                    variant="secondary"
                    onClick={() => setIsChecking(false)}
                  >
                    {t("gateway.stop")}
                  </Button>
                )}
              </div>
            </div>

            <ScrollArea className="h-[400px]">
              {results.map((result, index) => (
                <Card key={index} className="mb-4">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <span>{result.emoji}</span>
                      <span
                        className={
                          result.status === "APPROVED"
                            ? "text-green-500"
                            : "text-red-500"
                        }
                      >
                        {result.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {result.msg}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </ScrollArea>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
