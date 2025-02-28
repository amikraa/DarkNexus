import { motion } from "framer-motion";
import { Link } from "wouter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gateway } from "@shared/schema";

interface GatewayCardProps {
  gateway: Gateway;
  index: number;
}

export default function GatewayCard({ gateway, index }: GatewayCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link href={`/gateway/${gateway.id}`}>
        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{gateway.name}</span>
              <Badge variant={gateway.active ? "default" : "secondary"}>
                {gateway.active ? "Active" : "Inactive"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Endpoint: {gateway.endpoint}
            </p>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
