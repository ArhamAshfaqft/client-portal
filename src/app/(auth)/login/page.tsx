"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const { demoLogin, isLoading } = useAuth();

  useEffect(() => {
    const t = setTimeout(() => demoLogin("owner"), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      router.push("/dashboard");
    }
  }, [isLoading]);

  return (
    <Card>
      <CardHeader>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Feedspace</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Loading your workspace...
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </CardContent>
    </Card>
  );
}
