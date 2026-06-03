"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, AlertCircle } from "lucide-react";

const supabase = createClient();

interface SetPasswordDialogProps {
  open: boolean;
  onClose: () => void;
}

export function SetPasswordDialog({ open, onClose }: SetPasswordDialogProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setPassword("");
      setConfirmPassword("");
      setError("");
      setSuccess(false);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    sessionStorage.removeItem("feedspace_invite_flow");
  };

  return (
    <Modal open={open} onClose={success ? onClose : () => {}} title="Set Password" size="sm">
      {success ? (
        <div className="text-center py-6 space-y-4">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
          <p className="text-foreground font-medium">Password set successfully!</p>
          <p className="text-sm text-muted-foreground">
            You can now sign in with your email and password.
          </p>
          <Button onClick={onClose} className="mt-2">
            Got it
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              You joined via an invitation link. Set a password so you can sign in directly next time.
            </p>
          </div>
          <Input
            label="Password"
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {error && (
            <p className="text-sm text-danger bg-danger/5 rounded-lg px-3 py-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </p>
          )}
          <Button type="submit" loading={loading} className="w-full">
            Set Password
          </Button>
        </form>
      )}
    </Modal>
  );
}
