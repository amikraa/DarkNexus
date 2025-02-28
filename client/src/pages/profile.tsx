import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Sidebar from "@/components/layout/sidebar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type User } from "@shared/schema";

const proxySchema = z.object({
  proxyHost: z.string().optional(),
  proxyPort: z.string().optional(),
  proxyUser: z.string().optional(),
  proxyPass: z.string().optional(),
});

export default function Profile() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const userId = localStorage.getItem("userId");

  const { data: user } = useQuery<User>({
    queryKey: [`/api/user/${userId}`],
  });

  const form = useForm({
    resolver: zodResolver(proxySchema),
    defaultValues: {
      proxyHost: user?.proxyHost || "",
      proxyPort: user?.proxyPort || "",
      proxyUser: user?.proxyUser || "",
      proxyPass: user?.proxyPass || "",
    },
  });

  const updateProxy = useMutation({
    mutationFn: async (data: z.infer<typeof proxySchema>) => {
      await apiRequest(`/api/user/${userId}/proxy`, "PATCH", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/user/${userId}`] });
      toast({ title: "Success", description: "Proxy settings updated" });
    },
  });

  const updateLanguage = useMutation({
    mutationFn: async (language: string) => {
      return await apiRequest(`/api/user/${userId}/language`, "PATCH", { language });
    },
    onSuccess: (_, language) => {
      i18n.changeLanguage(language);
      queryClient.invalidateQueries({ queryKey: [`/api/user/${userId}`] });
      toast({ title: "Success", description: "Language updated" });
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="pl-64 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <h1 className="text-3xl font-bold text-primary mb-8">Profile</h1>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{t("profile.proxy")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit((data) =>
                    updateProxy.mutate(data)
                  )}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="proxyHost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Host</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="proxyPort"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Port</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="proxyUser"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="proxyPass"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={updateProxy.isPending}>
                    Save Proxy Settings
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("profile.language")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={user?.language}
                onValueChange={(value) => updateLanguage.mutate(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="hi">हिंदी</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}