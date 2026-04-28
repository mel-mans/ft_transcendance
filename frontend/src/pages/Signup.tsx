import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Mail, LogIn, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import PageLayout from "@/components/PageLayout";

const Signup = () => {
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { signup, startOAuth } = useAuth();

  const handle42Signup = () => {
    startOAuth("42");
  };

  const handleGoogleSignup = () => {
    startOAuth("google");
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await signup(email, password);
      navigate("/profile");
    } catch (err: any) {
      let msg = err?.message || "Something went wrong.";
      if (msg.includes("Network error")) {
        msg =
          "Cannot reach backend. Please check your server status or CORS settings.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout className="flex items-center justify-center p-4">
      <div className="glass rounded-2xl p-8 max-w-md w-full text-center">
        
        {/* Header */}
        <div className="mb-8">
          <span className="text-muted-foreground text-sm">Welcome!</span>
          <h1 className="text-3xl font-bold text-gradient mt-2">
            Create Account
          </h1>
        </div>

        <div className="glass rounded-xl p-6 mb-6">

          {!showForm ? (
            <>
              {/* Icon */}
              <div className="flex items-center justify-center mb-4">
                <Link
                  to="/"
                  aria-label="Go to home page"
                  className="w-[3.25rem] h-[3.25rem] rounded-2xl bg-[#37e07a] flex items-center justify-center font-bold text-base sm:text-lg text-black hover:bg-[#2fd46f] hover:glow-primary transition-all duration-300"
                >
                  42
                </Link>
              </div>

              <p className="text-muted-foreground text-sm mb-6">
                Sign up with your preferred method
              </p>

              <div className="space-y-3">
                <Button
                  onClick={handle42Signup}
                  className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 rounded-xl"
                >
                  <LogIn className="w-5 h-5" />
                  Sign up with 42 Intra
                </Button>

                <Button
                  onClick={handleGoogleSignup}
                  variant="outline"
                  className="w-full gap-2 glass border-white/10 text-foreground hover:bg-white/5 font-semibold py-6 rounded-xl"
                >
                  Sign up with Google
                </Button>

                <Button
                  onClick={() => setShowForm(true)}
                  variant="outline"
                  className="w-full gap-2 glass border-white/10 text-foreground hover:bg-white/5 font-semibold py-6 rounded-xl"
                >
                  <Mail className="w-5 h-5" />
                  Sign up with Email
                </Button>
              </div>

              <div className="mt-6 text-sm text-muted-foreground">
                Already registered?{" "}
                <Link
                  to="/login"
                  className="text-primary hover:underline font-semibold"
                >
                  Login →
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* Form Mode */}
              <div className="flex items-center justify-center mb-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <UserPlus className="w-7 h-7 text-primary" />
                </div>
              </div>

              <p className="text-muted-foreground text-sm mb-6">
                Enter your email
              </p>

              <form onSubmit={handleSignup} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass border-white/10 bg-white/5 text-foreground rounded-xl"
                  required
                />

                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="glass border-white/10 bg-white/5 text-foreground rounded-xl pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 px-3 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="glass border-white/10 bg-white/5 text-foreground rounded-xl pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 px-3 text-muted-foreground hover:text-foreground"
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {error && (
                  <div className="text-sm text-destructive text-center">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 rounded-xl"
                >
                  {loading ? "Creating account..." : "Sign Up"}
                </Button>
              </form>

              <Button
                variant="ghost"
                onClick={() => setShowForm(false)}
                className="mt-4 text-secondary hover:text-primary text-sm"
              >
                ← Back
              </Button>
            </>
          )}
        </div>

        {/* Info Box */}
        <div className="glass rounded-xl p-4 text-xs text-muted-foreground">
          <p className="mb-2">
            <span className="text-primary">•</span> Only 42 students can access this platform
          </p>
          <p>
            <span className="text-primary">•</span> Your campus & login will be verified
          </p>
        </div>
      </div>
    </PageLayout>
  );
};

export default Signup;
