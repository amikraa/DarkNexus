import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth"; // Added import for useAuth


const schema = z.object({
  accessKey: z.string().min(1, "Access key is required"),
});

export default function Login() {
  const [_, setLocation] = useLocation();
  const { t } = useTranslation();
  const { toast } = useToast();
  const auth = useAuth(); // Use the auth hook

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      accessKey: "",
    },
  });

  const login = useMutation({
    mutationFn: async (data: z.infer<typeof schema>) => {
      const res = await apiRequest("/api/auth/login", "POST", { accessKey: data.accessKey });
      return res.json();
    },
    onSuccess: (data) => {
      auth.login({ username: data.name, password: data.accessKey });
      localStorage.setItem("userId", data.id.toString());
      setLocation("/dashboard");
    },
    onError: (error) => {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: "Invalid access key",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-[400px] shadow-xl border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-primary">
              {t("login.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => login.mutate(data))}>
                <FormField
                  control={form.control}
                  name="accessKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder={t("login.accessKey")}
                          className="bg-background/50"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full mt-4"
                  disabled={login.isPending}
                >
                  {login.isPending ? "Loading..." : t("login.button")}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// Using the useAuth hook from lib/auth.tsx