import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogIn, Mail, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import PageLayout from "@/components/PageLayout";

const Login = () => {
  const navigate = useNavigate();
  const { login, startOAuth } = useAuth();

  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle42Login = () => {
    console.log('📱 42 login clicked');
    startOAuth("42");
  };

  const handleGoogleLogin = () => {
    console.log('🔍 Google login clicked');
    startOAuth("google");
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    (async () => {
      try {
        await login(email, password);
        // Redirect to profile page - use window.location.origin for dynamic URL
        const frontendUrl = window.location.origin;
        window.location.href = `${frontendUrl}/profile`;
      } catch (err: any) {
        let msg = err?.message || 'Hmm… that didn’t work.';
        if (msg.includes('Network error')) {
          msg = 'Cannot reach backend. Please check your server status or CORS settings.';
        }
        setError(msg);
      } finally {
        setLoading(false);
      }
    })();
  };

  return (
    <PageLayout className="flex items-center justify-center p-4">
      <div className="glass rounded-2xl p-8 max-w-md w-full text-center">
        {/* Header */}
        <div className="mb-8">
          <span className="text-muted-foreground text-sm">Welcome!</span>
          <h1 className="text-3xl font-bold text-gradient mt-2">
            Login Portal
          </h1>
        </div>
        
        {/* Login Options */}
        <div className="glass rounded-xl p-6 mb-6">
          {!showEmailForm ? (
            <>
              {/* 42 Intra Login */}
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
                login with your preferred method
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={handle42Login}
                  className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 rounded-xl"
                >
                  <LogIn className="w-5 h-5" />
                  Login with 42 Intra
                </Button>
                <Button 
                  onClick={handleGoogleLogin}
                  variant="outline"
                  className="w-full gap-2 glass border-white/10 text-foreground hover:bg-white/5 font-semibold py-6 rounded-xl"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Login with Google
                </Button>
                <Button 
                  onClick={() => setShowEmailForm(true)}
                  variant="outline"
                  className="w-full gap-2 glass border-white/10 text-foreground hover:bg-white/5 font-semibold py-6 rounded-xl"
                >
                  <Mail className="w-5 h-5" />
                  Login with Email
                </Button>
              </div>
              {/* Signup prompt always visible in main login portal */}
              <div className="mt-6">
                <span className="text-muted-foreground text-sm">
                  If not registered yet,{' '}
                  <Link
                    to="/signup"
                    className="text-primary hover:underline font-semibold"
                  >
                    signup →
                  </Link>
                </span>
              </div>
            </>
          ) : (
            <>
              {/* Email Login Form */}
              <div className="flex items-center justify-center mb-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Mail className="w-7 h-7 text-primary" />
                </div>
              </div>
              
                <form onSubmit={handleEmailLogin} className="space-y-4">
                <Input
                  type="text"
                  placeholder="Email or username"
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
                <div>
                  {error && (
                      <div className="text-sm text-destructive mb-2">{error}</div>
  )}

              

  <Button
    type="submit"
    disabled={loading}
    className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 rounded-xl"
  >
    <LogIn className="w-5 h-5" />
    {loading ? "Login in..." : "Login"}
  </Button>
</div>
              </form>
              
              <Button 
                variant="ghost"
                onClick={() => setShowEmailForm(false)}
                className="mt-4 text-secondary hover:text-primary text-sm"
              >
                ← Back to login options
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
        
        {/* Back Link */}
        <div className="mt-6">
          <Link 
            to="/" 
            className="text-muted-foreground hover:text-primary text-sm transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
        
        <p className="text-xs text-muted-foreground mt-4">
          🔒 Secure OAuth 2.0 Authentication
        </p>
      </div>
    </PageLayout>
  );
};

export default Login;
