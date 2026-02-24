import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogIn, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import PageLayout from "@/components/PageLayout";

const Login = () => {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle42Login = () => {
    // TODO: Implement 42 OAuth when API is ready
    console.log("42 OAuth login triggered");
  };

  const handleGoogleLogin = () => {
    // TODO: Implement Google OAuth when API is ready
    console.log("Google OAuth login triggered");
  };

  const { login } = useAuth();

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    (async () => {
      try {
        await login(email, password);
        navigate('/profile');
      } catch (err: any) {
        // Prefer structured error message if available
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

  const navigate = useNavigate();

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
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center font-bold text-2xl text-primary-foreground">
                  42
                </div>
              </div>
              <p className="text-muted-foreground text-sm mb-6">
                Sign in with your preferred method
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
            </>
          ) : (
            <>
              {/* Email Login Form */}
              <div className="flex items-center justify-center mb-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Mail className="w-7 h-7 text-primary" />
                </div>
              </div>
              <p className="text-muted-foreground text-sm mb-6">
                Enter your email and password
              </p>
              
                <form onSubmit={handleEmailLogin} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass border-white/10 bg-white/5 text-foreground rounded-xl"
                  required
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass border-white/10 bg-white/5 text-foreground rounded-xl"
                  required
                />
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
                    {loading ? 'Signing in...' : 'Sign In'}
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
