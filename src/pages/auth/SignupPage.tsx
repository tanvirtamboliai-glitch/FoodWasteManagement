import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Leaf, Loader2, MailCheck, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function SignupPage() {
  const { signup, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow letters and spaces, and convert to uppercase
    const cleanedValue = e.target.value.replace(/[^a-zA-Z\s]/g, "").toUpperCase();
    setName(cleanedValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    
    const result = await signup(email, password, name);
    if (result.success) {
      if (result.needsVerification) {
        setIsEmailSent(true);
        toast.success("Verification email sent!");
      } else {
        toast.success("Account created successfully!");
        navigate("/student");
      }
    } else {
      toast.error(result.message || "Signup failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel - branding (consistent with login) */}
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
        <div className="relative z-10 text-primary-foreground max-w-md">
          <Leaf className="h-16 w-16 mb-6" />
          <h1 className="font-display text-4xl font-bold mb-4">EcoMeal</h1>
          <p className="text-lg opacity-90 leading-relaxed">
            Join EcoMeal today and start tracking your meals to help reduce food waste in your institution.
          </p>
        </div>
      </div>

      {/* Right panel - signup form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-8">
          {!isEmailSent ? (
            <>
              <div className="text-center lg:text-left">
                <div className="flex items-center gap-2 justify-center lg:justify-start mb-6 lg:hidden">
                  <Leaf className="h-8 w-8 text-primary" />
                  <span className="font-display text-2xl font-bold">EcoMeal</span>
                </div>
                <h2 className="font-display text-2xl font-bold">Create an account</h2>
                <p className="text-muted-foreground text-sm mt-1">Join the student community</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="JOHN DOE"
                    value={name}
                    onChange={handleNameChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign Up
                </Button>
              </form>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">Already have an account? </span>
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Sign In
                </Link>
              </div>
            </>
          ) : (
            <div className="space-y-6 animate-in fade-in zoom-in duration-500">
              <div className="text-center lg:text-left">
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-6 lg:mx-0 mx-auto">
                    <MailCheck className="h-6 w-6 text-primary" />
                </div>
                <h2 className="font-display text-2xl font-bold">Verify your email</h2>
                <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
                  We've sent a verification link to <span className="font-medium text-foreground">{email}</span>. 
                  Please check your inbox and click the link to activate your account.
                </p>
              </div>
              
              <div className="space-y-4">
                <Button asChild className="w-full">
                  <Link to="/login">Proceed to Sign In</Link>
                </Button>
                <button 
                  onClick={() => setIsEmailSent(false)}
                  className="w-full text-center text-sm text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Use a different email
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
