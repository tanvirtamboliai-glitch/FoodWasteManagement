import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Leaf, Loader2, ArrowLeft, MailCheck } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const { resetPassword, isLoading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    
    const result = await resetPassword(email);
    if (result.success) {
      setIsSubmitted(true);
      toast.success("Reset link sent!");
    } else {
      toast.error(result.message || "Failed to send reset link. Please try again.");
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
          <h1 className="font-display text-4xl font-bold mb-4">Reset Password</h1>
          <p className="text-lg opacity-90 leading-relaxed">
            Don't worry, happens to the best of us. We'll help you get back into your account.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center lg:text-left">
            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Sign In
            </Link>
            
            <h2 className="font-display text-2xl font-bold">Forgot password?</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Enter your email and we'll send you a link to reset your password.
            </p>
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Reset Link
              </Button>
            </form>
          ) : (
            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 text-center space-y-4 animate-in fade-in zoom-in duration-300">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <MailCheck className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Check your email</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We've sent a password reset link to <span className="font-medium text-foreground">{email}</span>
                </p>
              </div>
              <Button variant="outline" className="w-full" onClick={() => setIsSubmitted(false)}>
                Resend email
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
