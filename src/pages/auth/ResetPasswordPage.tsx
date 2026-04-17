import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Leaf, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const { updatePassword, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    const success = await updatePassword(password);
    if (success) {
      toast.success("Password updated successfully!");
      navigate("/login");
    } else {
      toast.error("Failed to update password. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 20 }).map((_, i) => (
            <Leaf
              key={i}
              className="absolute text-primary-foreground"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                transform: `rotate(${Math.random() * 360}deg) scale(${0.5 + Math.random() * 2})`,
                opacity: 0.15 + Math.random() * 0.3,
              }}
            />
          ))}
        </div>
        <div className="relative z-10 text-primary-foreground max-w-md text-center">
          <Leaf className="h-16 w-16 mb-6 mx-auto" />
          <h1 className="font-display text-4xl font-bold mb-4">Secure Your Account</h1>
          <p className="text-lg opacity-90 leading-relaxed">
            Choose a strong password that you haven't used before.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center lg:text-left">
            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-6 lg:mx-0 mx-auto">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold">New password</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Set your new password to regain access.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reset Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
