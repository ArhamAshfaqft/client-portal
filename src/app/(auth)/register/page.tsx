"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [fullName, setFullName] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      const slug = agencyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const { error: agencyError } = await supabase.from("agencies").insert({
        name: agencyName,
        slug,
        primary_color: "#2563eb",
        secondary_color: "#64748b",
      });

      if (agencyError) {
        setError(agencyError.message);
        setLoading(false);
        return;
      }

      const { data: agency } = await supabase
        .from("agencies")
        .select("id")
        .eq("slug", slug)
        .single();

      if (agency) {
        await supabase.from("profiles").insert({
          user_id: authData.user.id,
          agency_id: agency.id,
          role: "owner",
          full_name: fullName,
          email: email,
        });
      }
    }

    router.push("/dashboard");
  };

  return (
    <Card>
      <CardHeader>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Feedspace</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create your agency workspace
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRegister} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="John Smith"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <Input
            label="Agency Name"
            placeholder="Skyline Digital Agency"
            value={agencyName}
            onChange={(e) => setAgencyName(e.target.value)}
            required
          />
          <Input
            label="Email"
            type="email"
            placeholder="john@skyline.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="Create a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          {error && (
            <p className="text-sm text-danger bg-danger/5 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <Button type="submit" loading={loading} className="w-full">
            Create Workspace
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary hover:text-primary-hover font-medium"
          >
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
