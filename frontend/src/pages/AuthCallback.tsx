import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { useAuth } from "@/lib/auth";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { completeOAuthLogin } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) {
      return;
    }
    handledRef.current = true;

    const success = searchParams.get("success");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      setError("OAuth login was not completed.");
      return;
    }

    // Cookie-based sessions do not need ?success=true to be present.
    // If no explicit error exists, validate session via backend and continue.
    if (success === "false") {
      setError("OAuth login was not completed.");
      return;
    }

    (async () => {
      try {
        await completeOAuthLogin();
        navigate("/profile", { replace: true });
      } catch (err: any) {
        setError(err?.message || "OAuth login failed.");
      }
    })();
  }, [searchParams, completeOAuthLogin, navigate]);

  return (
    <PageLayout className="flex items-center justify-center p-4">
      <div className="glass rounded-2xl p-8 max-w-md w-full text-center">
        {!error ? (
          <>
            <h1 className="text-2xl font-bold text-gradient mb-3">Completing Sign-In</h1>
            <p className="text-muted-foreground text-sm">Please wait while we finish your authentication...</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gradient mb-3">Authentication Failed</h1>
            <p className="text-destructive text-sm mb-5">{error}</p>
            <Link to="/login" className="text-primary hover:underline font-semibold">
              Back to Login
            </Link>
          </>
        )}
      </div>
    </PageLayout>
  );
};

export default AuthCallback;
